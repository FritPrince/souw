<?php

namespace App\Services;

use App\Models\FedaPayConfig;
use App\Models\Order;
use App\Models\Payment;
use App\Models\CompanyInfo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentReceipt;
use App\Mail\OrderConfirmation;
use App\Mail\AdminOrderNotification;
use App\Notifications\OrderStatusUpdatedNotification;
use FedaPay\FedaPay;
use FedaPay\Customer;
use FedaPay\Transaction;
use FedaPay\Error\ApiConnection;
use FedaPay\Error\InvalidRequest;
use FedaPay\Error\Api;

class PaymentService
{
    protected string $publicKey;

    protected string $privateKey;

    protected string $secret;

    protected bool $sandbox;

    protected string $apiUrl;

    public function __construct()
    {
        // Toujours récupérer la config à jour depuis la DB
        $this->loadConfig();
    }

    protected function loadConfig(): void
    {
        $config = FedaPayConfig::first();
        
        if ($config) {
            // Utiliser la configuration de la base de données
            $this->sandbox = (bool) ($config->is_sandbox ?? true);
            
            // Récupérer les clés selon le mode (FedaPay utilise public_key et secret_key)
            if ($this->sandbox) {
                $this->publicKey = trim($config->public_key_sandbox ?? '');
                $this->secret = trim($config->secret_key_sandbox ?? '');
            } else {
                $this->publicKey = trim($config->public_key_live ?? '');
                $this->secret = trim($config->secret_key_live ?? '');
            }
            
            // Pour compatibilité, utiliser secret comme privateKey
            $this->privateKey = $this->secret;
            
            $this->apiUrl = $this->sandbox ? 'https://sandbox-api.fedapay.com' : 'https://api.fedapay.com';
            
            // Log pour debug
            Log::debug('FedaPay Config Loaded', [
                'sandbox' => $this->sandbox,
                'public_key_set' => !empty($this->publicKey),
                'public_key_length' => strlen($this->publicKey),
                'public_key_preview' => substr($this->publicKey, 0, 20).'...',
            ]);
        } else {
            // Fallback vers la configuration du fichier config si la DB n'a pas de config
            $this->publicKey = config('payment.fedapay.public_key');
            $this->secret = config('payment.fedapay.secret_key');
            $this->privateKey = $this->secret;
            $this->sandbox = config('payment.fedapay.sandbox', true);
            $this->apiUrl = config('payment.fedapay.api_url', 'https://api.fedapay.com');
        }
    }

    /**
     * Initier un paiement FedaPay
     */
    public function initiateFedaPayPayment(Order $order, float $amount, ?Payment $existingPayment = null): array
    {
        // Recharger la config pour s'assurer d'avoir les dernières valeurs
        $this->loadConfig();
        
        // Vérifier que la clé publique est présente
        if (empty($this->publicKey) || empty($this->secret)) {
            throw new \RuntimeException('Clés FedaPay non configurées. Veuillez configurer les clés dans les paramètres admin.');
        }

        $callbackUrl = route('payments.callback');

        if ($existingPayment && $existingPayment->payment_status === 'pending') {
            $payment = $existingPayment;
            $payment->update([
                'amount' => $amount,
                'payment_method' => 'fedapay',
                'payment_status' => 'pending',
                'transaction_id' => null,
                'payment_date' => null,
            ]);
        } elseif ($existingPayment && $existingPayment->payment_status === 'completed') {
            $payment = $existingPayment;
        } else {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'amount' => $amount,
                'currency' => config('payment.currency', 'XOF'),
                'payment_method' => 'fedapay',
                'payment_status' => 'pending',
            ]);
        }

        // Log pour debug (à retirer en production)
        Log::info('FedaPay Payment Init', [
            'sandbox' => $this->sandbox,
            'public_key' => substr($this->publicKey, 0, 20).'...',
            'public_key_length' => strlen($this->publicKey),
            'amount' => $amount,
        ]);

        $user = $order->user ?: $order->user()->first();
        $customerName = $user?->name ?? '';
        $customerEmail = $user?->email ?? '';
        $customerPhone = $user?->phone ?? '';

        $firstName = $customerName;
        $lastName = '';
        if ($customerName) {
            $parts = preg_split('/\s+/', trim($customerName), 2);
            $firstName = $parts[0] ?? $customerName;
            $lastName = $parts[1] ?? '';
        }

        // Utiliser le SDK FedaPay pour créer la transaction
        try {
            FedaPay::setApiKey($this->secret);
            FedaPay::setEnvironment($this->sandbox ? 'sandbox' : 'live');

            // Préparer les données de la transaction
            $currency = config('payment.currency', 'XOF');
            
            // Pour XOF (Franc CFA), le montant est directement en francs, pas en centimes
            // FedaPay attend le montant en unités de base de la devise
            $transactionAmount = (int) round($amount);
            
            // Valider le montant
            if ($transactionAmount <= 0) {
                throw new \RuntimeException('Le montant de la transaction doit être supérieur à 0.');
            }

            // Préparer les données du customer (optionnel)
            $customerData = null;
            
            // Ne créer un customer que si on a au moins un email valide
            if (!empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                try {
                    $customerParams = [
                        'firstname' => $firstName ?: 'Client',
                        'lastname' => $lastName ?: 'Client',
                        'email' => $customerEmail,
                    ];
                    
                    // Ajouter le numéro de téléphone seulement s'il est présent et valide
                    if (!empty($customerPhone) && preg_match('/^[0-9+\-\s()]+$/', $customerPhone)) {
                        // Nettoyer le numéro de téléphone
                        $cleanPhone = preg_replace('/[^0-9+]/', '', $customerPhone);
                        if (strlen($cleanPhone) >= 8) {
                            $customerParams['phone_number'] = [
                                'number' => $cleanPhone,
                                'country' => 'bj', // Bénin par défaut
                            ];
                        }
                    }
                    
                    $customer = Customer::create($customerParams);
                    $customerData = ['id' => $customer->id];
                    
                    Log::info('FedaPay Customer created', ['customer_id' => $customer->id]);
                } catch (\Exception $e) {
                    Log::warning('FedaPay Customer creation failed', [
                        'error' => $e->getMessage(),
                        'email' => $customerEmail,
                    ]);
                    // Continuer sans customer si la création échoue
                }
            }

            // Préparer les données de la transaction
            $transactionParams = [
                'description' => "Paiement pour la commande #{$order->order_number}",
                'amount' => $transactionAmount,
                'currency' => ['iso' => $currency],
                'callback_url' => $callbackUrl,
                'mode' => 'mtn_open', // Mode de paiement par défaut (Mobile Money Open)
            ];
            
            // Ajouter le customer seulement s'il a été créé
            if ($customerData) {
                $transactionParams['customer'] = $customerData;
            }

            Log::info('FedaPay Transaction creation attempt', [
                'amount' => $transactionAmount,
                'currency' => $currency,
                'has_customer' => !empty($customerData),
                'callback_url' => $callbackUrl,
            ]);

            // Créer la transaction
            $transaction = Transaction::create($transactionParams);

            // Mettre à jour le payment avec la transaction_id
            $payment->update(['transaction_id' => (string) $transaction->id]);

            // Retourner les données pour le widget FedaPay
            // Le montant est déjà en francs CFA (XOF n'utilise pas de centimes)
            return [
                'payment_id' => $payment->id,
                'transaction_id' => (string) $transaction->id,
                'amount' => $transactionAmount, // Montant en francs CFA
                'public_key' => trim($this->publicKey),
                'sandbox' => $this->sandbox,
                'callback_url' => $callbackUrl,
                'customer' => [
                    'name' => $customerName,
                    'email' => $customerEmail,
                    'phone' => $customerPhone,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ],
                'transaction_token' => $transaction->token ?? null,
            ];
        } catch (\FedaPay\Error\InvalidRequest $e) {
            Log::error('FedaPay Transaction creation failed - Invalid Request', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
                'amount' => $amount,
                'currency' => config('payment.currency', 'XOF'),
            ]);
            throw new \RuntimeException('Erreur lors de la création de la transaction FedaPay: Requête invalide. '.$e->getMessage());
        } catch (\FedaPay\Error\ApiConnection $e) {
            Log::error('FedaPay Transaction creation failed - API Connection', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);
            throw new \RuntimeException('Erreur de connexion à l\'API FedaPay. Veuillez réessayer plus tard.');
        } catch (Api $e) {
            Log::error('FedaPay Transaction creation failed - API Error', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->id,
            ]);
            throw new \RuntimeException('Erreur API FedaPay: '.$e->getMessage());
        } catch (\Exception $e) {
            Log::error('FedaPay Transaction creation failed - General Error', [
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'payment_id' => $payment->id,
                'trace' => $e->getTraceAsString(),
            ]);
            throw new \RuntimeException('Erreur lors de la création de la transaction FedaPay: '.$e->getMessage());
        }
    }

    /**
     * Vérifier le statut d'une transaction FedaPay
     */
    public function verifyPayment(string $transactionId): array
    {
        $this->loadConfig();

        try {
            // Vérifier que les clés sont configurées
            if (empty($this->secret)) {
                Log::error('FedaPay verification - Secret key not configured');
                return ['status' => 'ERROR', 'message' => 'Configuration FedaPay manquante'];
            }

            // Utiliser les méthodes statiques de FedaPay pour configurer l'API
            if (method_exists(FedaPay::class, 'setApiKey')) {
                FedaPay::setApiKey($this->secret);
            } else {
                // Alternative : utiliser setApiKey comme méthode statique
                \FedaPay\FedaPay::setApiKey($this->secret);
            }
            
            if (method_exists(FedaPay::class, 'setEnvironment')) {
                FedaPay::setEnvironment($this->sandbox ? 'sandbox' : 'live');
            } else {
                // Alternative : utiliser setEnvironment comme méthode statique
                \FedaPay\FedaPay::setEnvironment($this->sandbox ? 'sandbox' : 'live');
            }

            // Récupérer la transaction
            $transaction = Transaction::retrieve($transactionId);
            
            if (!$transaction) {
                return ['status' => 'PENDING', 'message' => 'Transaction non trouvée'];
            }
            
            $status = 'PENDING';
            $transactionStatus = $transaction->status ?? null;
            
            if ($transactionStatus === 'approved' || $transactionStatus === 'success') {
                $status = 'SUCCESS';
            } elseif (in_array($transactionStatus, ['canceled', 'declined', 'failed', 'cancelled'])) {
                $status = 'FAILED';
            }

            return [
                'status' => $status,
                'transaction' => is_object($transaction) && method_exists($transaction, 'toArray') ? $transaction->toArray() : (array) $transaction,
                'message' => $status === 'SUCCESS' ? 'Transaction approuvée' : 'Transaction en cours',
            ];
        } catch (ApiConnection $e) {
            Log::error('FedaPay verification connection error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return ['status' => 'ERROR', 'message' => 'Erreur de connexion à l\'API FedaPay'];
        } catch (InvalidRequest $e) {
            Log::error('FedaPay verification invalid request', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);
            return ['status' => 'PENDING', 'message' => 'Transaction en cours de traitement'];
        } catch (\Exception $e) {
            Log::error('FedaPay verification error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return ['status' => 'ERROR', 'message' => $e->getMessage()];
        }
    }

    /**
     * Traiter le callback de FedaPay
     */
    public function handleCallback(array $data): ?Payment
    {
        $transactionId = $data['transaction_id'] ?? $data['id'] ?? null;
        $status = $data['status'] ?? null;

        if (! $transactionId) {
            Log::warning('FedaPay callback missing transaction_id', $data);
            return null;
        }

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (! $payment && isset($data['data'])) {
            $paymentData = json_decode($data['data'], true);
            if (isset($paymentData['payment_id'])) {
                $payment = Payment::find($paymentData['payment_id']);
            }
        }

        if (! $payment) {
            // Essayer de trouver le paiement par transaction_id dans la table
            Log::warning('FedaPay callback payment not found', $data);
            return null;
        }

        // Vérifier le statut de la transaction via l'API
        $verification = $this->verifyPayment($transactionId);
        $normalizedStatus = strtoupper($verification['status'] ?? $status ?? 'PENDING');

        if ($normalizedStatus === 'SUCCESS' || $normalizedStatus === 'APPROVED') {
            $this->completePayment($payment, ['transaction_id' => $transactionId]);
        } elseif ($normalizedStatus === 'FAILED' || $normalizedStatus === 'CANCELED' || $normalizedStatus === 'DECLINED') {
            $this->failPayment($payment);
        }

        return $payment->fresh();
    }

    public function finalizePaymentFromVerification(Payment $payment, array $verification): void
    {
        $status = strtoupper($verification['status'] ?? '');
        if ($status === 'SUCCESS') {
            $context = [];
            if (isset($verification['transactionId'])) {
                $context['transaction_id'] = $verification['transactionId'];
            }
            $this->completePayment($payment, $context);
        }
    }

    public function completePayment(Payment $payment, array $context = []): void
    {
        if ($payment->payment_status === 'completed') {
            return;
        }

        $updateData = [
            'payment_status' => 'completed',
            'payment_date' => now(),
        ];

        if (! empty($context['transaction_id'])) {
            $updateData['transaction_id'] = $context['transaction_id'];
        } elseif (! $payment->transaction_id) {
            $updateData['transaction_id'] = (string) $payment->id;
        }

        $payment->update($updateData);

        $payment->loadMissing([
            'order.service',
            'order.subService',
            'order.destination',
            'order.user',
            'user',
        ]);

        $order = $payment->order;
         if ($order) {
             $previousStatus = $order->status;
 
             $order->update([
                 'payment_status' => 'completed',
                 'status' => 'processing',
             ]);
 
            $order->refresh();

            if ($previousStatus !== $order->status && $order->user) {
                try {
                    $order->user->notify(new OrderStatusUpdatedNotification($order, $previousStatus, $order->status));
                } catch (\Throwable $e) {
                    Log::error('Order status notification failed after payment', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        try {
            if ($payment->user && $order) {
                $payment->user->notify(new \App\Notifications\PaymentCompletedNotification($payment));
                $order->user?->notify(new \App\Notifications\OrderCreatedNotification($order));
            }
        } catch (\Throwable $e) {
            Log::error('Payment notification to user failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $adminEmail = optional(CompanyInfo::first())->email ?: config('mail.from.address');
            if ($adminEmail && $order) {
                Mail::to($adminEmail)->send(new PaymentReceipt($payment));
                Mail::to($adminEmail)->send(new AdminOrderNotification($order));
            }
        } catch (\Throwable $e) {
            Log::error('Payment notification to admin failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            if ($order?->user?->email) {
                Mail::to($order->user->email)->send(new OrderConfirmation($order));
            }
        } catch (\Throwable $e) {
            Log::error('Order confirmation email failed', [
                'order_id' => $order?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function failPayment(Payment $payment): void
    {
        if ($payment->payment_status === 'completed') {
            return;
        }

        $payment->update([
            'payment_status' => 'failed',
        ]);

        if ($payment->order) {
            $payment->order->update([
                'payment_status' => 'failed',
                'status' => 'failed',
            ]);
        }
    }

    /**
     * Vérifier la signature du callback
     */
    protected function verifySignature(array $data): bool
    {
        if (! isset($data['signature'])) {
            return false;
        }

        $signature = $data['signature'];
        unset($data['signature']);

        ksort($data);
        $queryString = http_build_query($data);
        $expectedSignature = hash_hmac('sha256', $queryString, $this->secret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Rembourser un paiement
     */
    public function refund(Payment $payment): bool
    {
        if ($payment->payment_status !== 'completed') {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->privateKey,
            ])->post($this->apiUrl.'/api/v1/transactions/'.$payment->transaction_id.'/refund');

            if ($response->successful()) {
                $payment->update(['payment_status' => 'refunded']);
                $payment->order->update(['payment_status' => 'refunded']);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('FedaPay refund error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
