<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Mail\PaymentReceipt;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class PaymentCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Payment $payment
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['mail'];

        $whatsappService = app(WhatsAppService::class);
        if ($whatsappService->isConfigured() && $notifiable->routeNotificationForWhatsApp()) {
            $channels[] = \App\Notifications\Channels\WhatsAppChannel::class;
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage|PaymentReceipt
    {
        // Utiliser le Mailable PaymentReceipt pour un email plus détaillé
        Mail::to($notifiable)->send(new PaymentReceipt($this->payment));

        return (new MailMessage)
            ->subject("Paiement confirmé - Commande #{$this->payment->order->order_number}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre paiement de {$this->payment->amount} XOF a été confirmé avec succès.")
            ->line("Transaction ID: {$this->payment->transaction_id}")
            ->action('Voir le reçu', route('payments.success', $this->payment))
            ->line('Merci de votre confiance !');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $message = "✅ Paiement confirmé !\n\n";
        $message .= "💰 Montant: {$this->payment->amount} XOF\n";
        $message .= "📋 Commande: #{$this->payment->order->order_number}\n";
        $message .= "🔖 Transaction: {$this->payment->transaction_id}\n";
        $message .= "📅 Date: {$this->payment->payment_date->format('d/m/Y H:i')}\n\n";
        $message .= "Merci pour votre paiement !";

        if ($phone) {
            $whatsapp->sendMessage($phone, $message);
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'transaction_id' => $this->payment->transaction_id,
        ];
    }
}
