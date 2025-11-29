<?php

namespace App\Notifications;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order
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

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Confirmation de commande #{$this->order->order_number}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre commande #{$this->order->order_number} a été créée avec succès.")
            ->line("Service: {$this->order->service->name}")
            ->line("Montant total: {$this->order->total_amount} XOF")
            ->line("Statut: {$this->order->status}")
            ->action('Voir ma commande', route('orders.show', $this->order))
            ->line('Merci de votre confiance !');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $message = "✅ Commande créée avec succès !\n\n";
        $message .= "📋 Commande #{$this->order->order_number}\n";
        $message .= "🛍️ Service: {$this->order->service->name}\n";
        $message .= "💰 Montant: {$this->order->total_amount} XOF\n";
        $message .= "📊 Statut: {$this->order->status}\n\n";
        $message .= "Suivez votre commande sur: ".route('orders.show', $this->order);

        if ($phone) {
            $whatsapp->sendMessage($phone, $message);
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
        ];
    }
}
