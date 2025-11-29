<?php

namespace App\Http\Controllers;

use App\Http\Requests\InitiatePaymentRequest;
use App\Jobs\ProcessPaymentCallback;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as LaravelLog;
use Illuminate\Support\Facades\Mail as LaravelMail;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
    }

    public function index(): Response
    {
        $payments = Payment::where('user_id', Auth::id())
            ->with(['order.service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function initiate(InitiatePaymentRequest $request): Response|RedirectResponse
    {
        $order = Order::where('id', $request->order_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($order->payment_status === 'completed') {
            $payment = $order->payment ?? $order->payments()->latest()->first();
            if ($payment) {
                return redirect()->route('payments.success', $payment);
            }

            return back()->with('error', 'Cette commande est déjà payée.');
        }

        if ($request->payment_method === 'fedapay') {
            $pendingPayment = $order->payments()
                ->where('payment_method', 'fedapay')
                ->where('payment_status', 'pending')
                ->latest()
                ->first();

            $paymentData = $this->paymentService->initiateFedaPayPayment($order, (float) $order->total_amount, $pendingPayment);

            return Inertia::render('Payments/Process', [
                'payment' => Payment::find($paymentData['payment_id'])->load(['order.service', 'user']),
                'fedapay' => $paymentData,
            ]);
        }

        // Pour les autres méthodes de paiement (cash, bank_transfer)
        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => Auth::id(),
            'amount' => $order->total_amount,
            'currency' => config('payment.currency', 'XOF'),
            'payment_method' => $request->payment_method ?? 'fedapay',
            'payment_status' => 'pending',
        ]);

        return redirect()->route('payments.process', $payment);
    }

    public function process(Payment $payment): Response
    {
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        $payment->load(['order.service']);
        $payment->loadMissing('user');

        $fedapayData = null;
        if ($payment->payment_method === 'fedapay' && $payment->payment_status === 'pending') {
            $fedapayData = $this->paymentService->initiateFedaPayPayment($payment->order, (float) $payment->amount, $payment);
        }

        return Inertia::render('Payments/Process', [
            'payment' => $payment,
            'fedapay' => $fedapayData,
        ]);
    }

    public function callback(Request $request): JsonResponse|RedirectResponse
    {
        $data = $request->all();

        // Traiter le callback de manière asynchrone
        ProcessPaymentCallback::dispatch($data);

        // Si c'est une requête AJAX (webhook), retourner une réponse JSON
        if ($request->expectsJson() || $request->isJson()) {
            return response()->json(['status' => 'received']);
        }

        // Sinon, traiter de manière synchrone pour la redirection
        $payment = $this->paymentService->handleCallback($data);

        if (! $payment) {
            return redirect()->route('payments.index')
                ->with('error', 'Paiement introuvable.');
        }

        if ($payment->payment_status === 'completed') {
            return redirect()->route('payments.success', $payment)
                ->with('success', 'Paiement effectué avec succès.');
        }

        return redirect()->route('payments.failed', $payment)
            ->with('error', 'Le paiement a échoué.');
    }

    public function verify(Request $request, Payment $payment): JsonResponse
    {
        try {
            if ($payment->user_id !== Auth::id()) {
                abort(403);
            }

            $payment->refresh();

            if ($payment->payment_status === 'completed') {
                return response()->json([
                    'status' => 'completed',
                    'verification_status' => 'SUCCESS',
                ]);
            }

            if ($payment->payment_method === 'fedapay') {
                $transactionId = trim((string) $request->query('transactionId', ''));

                if ($transactionId !== '' && $payment->transaction_id !== $transactionId) {
                    $payment->update(['transaction_id' => $transactionId]);
                }

                $transactionRef = $transactionId !== '' ? $transactionId : ($payment->transaction_id ?: null);
                
                $verificationData = null;
                $verificationStatus = 'PENDING';
                $verificationMessage = null;
                
                // Si force=true, le widget a confirmé que le paiement est terminé
                // On fait confiance au widget et on marque directement comme complété sans vérifier l'API
                if ($request->boolean('force') && $payment->payment_status !== 'completed') {
                    try {
                        $context = [];
                        if ($transactionRef) {
                            $context['transaction_id'] = $transactionRef;
                        }
                        
                        // Marquer le paiement comme complété car le widget FedaPay a confirmé le succès
                        // On fait confiance au callback onComplete du widget
                        $this->paymentService->completePayment($payment, $context);
                        $payment->refresh();
                        $verificationStatus = 'SUCCESS';
                        $verificationMessage = 'Paiement confirmé par le widget FedaPay';
                        
                        LaravelLog::info('FedaPay payment forced to completed', [
                            'payment_id' => $payment->id,
                            'transaction_id' => $transactionRef,
                        ]);
                    } catch (\Exception $e) {
                        LaravelLog::error('Error completing payment with force=true', [
                            'payment_id' => $payment->id,
                            'transaction_id' => $transactionRef,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                        // Si erreur, on continue avec le statut actuel
                        $verificationStatus = 'ERROR';
                        $verificationMessage = 'Erreur lors de la complétion du paiement: '.$e->getMessage();
                    }
                }
                // Si on a un transactionId et qu'on n'a pas forcé, vérifier le statut via l'API FedaPay
                elseif ($transactionRef) {
                    try {
                        $verificationData = $this->paymentService->verifyPayment($transactionRef);
                        $verificationStatus = strtoupper($verificationData['status'] ?? 'PENDING');
                        $verificationMessage = $verificationData['message'] ?? null;
                        
                        LaravelLog::info('FedaPay verification', [
                            'payment_id' => $payment->id,
                            'transaction_id' => $transactionRef,
                            'verification_status' => $verificationStatus,
                            'current_payment_status' => $payment->payment_status,
                        ]);
                        
                        // Si la vérification API indique SUCCESS, marquer comme complété
                        if ($verificationStatus === 'SUCCESS' && $payment->payment_status !== 'completed') {
                            try {
                                $context = [];
                                if ($transactionRef !== '') {
                                    $context['transaction_id'] = $transactionRef;
                                }
                                $this->paymentService->completePayment($payment, $context);
                                $payment->refresh();
                            } catch (\Exception $e) {
                                LaravelLog::error('Error completing payment from API verification', [
                                    'payment_id' => $payment->id,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }
                    } catch (\Exception $e) {
                        LaravelLog::error('FedaPay verification error in controller', [
                            'payment_id' => $payment->id,
                            'transaction_id' => $transactionRef,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                        // En cas d'erreur de vérification, on continue avec le statut PENDING
                        $verificationStatus = 'PENDING';
                        $verificationMessage = 'Erreur de vérification: '.$e->getMessage();
                    }
                } else {
                    // Pas de transactionId encore, retourner le statut actuel
                    $verificationStatus = 'PENDING';
                }

                return response()->json([
                    'status' => $payment->payment_status,
                    'verification_status' => $verificationStatus,
                    'message' => $verificationMessage,
                    'transaction_id' => $transactionRef,
                ]);
            }

            return response()->json([
                'status' => $payment->payment_status,
            ]);
        } catch (\Exception $e) {
            LaravelLog::error('Payment verification exception', [
                'payment_id' => $payment->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => $payment->payment_status ?? 'pending',
                'verification_status' => 'ERROR',
                'message' => 'Erreur lors de la vérification du paiement',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function success(Payment $payment): Response
    {
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Payments/Success', [
            'payment' => $payment->load(['order.service', 'order.subService', 'order.destination']),
        ]);
    }

    public function failed(Payment $payment): Response
    {
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Payments/Failed', [
            'payment' => $payment->load('order'),
        ]);
    }

    public function sendRecap(Payment $payment): JsonResponse
    {
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        $payment->loadMissing(['order.service', 'order.subService', 'order.destination', 'order.user']);

        if ($payment->payment_status !== 'completed') {
            $this->paymentService->completePayment($payment);
            $payment->refresh();
        }

        try {
            if ($payment->order?->user?->email) {
                LaravelMail::to($payment->order->user->email)->send(new \App\Mail\OrderConfirmation($payment->order));
            }

            $adminEmail = optional(\App\Models\CompanyInfo::first())->email ?: config('mail.from.address');
            if ($adminEmail) {
                LaravelMail::to($adminEmail)->send(new \App\Mail\AdminOrderNotification($payment->order));
            }

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            LaravelLog::error('sendRecap failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
