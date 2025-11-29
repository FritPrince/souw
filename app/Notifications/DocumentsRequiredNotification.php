<?php

namespace App\Notifications;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentsRequiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
        public array $requiredDocuments = []
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
        $message = (new MailMessage)
            ->subject("Documents requis pour la commande #{$this->order->order_number}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Pour finaliser votre commande #{$this->order->order_number}, nous avons besoin des documents suivants :");

        foreach ($this->requiredDocuments as $document) {
            $message->line("• {$document['name']}");
            if (isset($document['description'])) {
                $message->line("  {$document['description']}");
            }
        }

        $message->action('Télécharger les documents', route('orders.show', $this->order))
            ->line('Merci de votre collaboration !');

        return $message;
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $message = "📄 Documents requis\n\n";
        $message .= "📋 Commande #{$this->order->order_number}\n\n";
        $message .= "Veuillez fournir les documents suivants :\n\n";

        foreach ($this->requiredDocuments as $document) {
            $message .= "• {$document['name']}\n";
        }

        $message .= "\nTéléchargez sur: ".route('orders.show', $this->order);

        if ($phone) {
            $whatsapp->sendMessage($phone, $message);

            // Envoyer les documents requis si disponibles
            foreach ($this->requiredDocuments as $document) {
                if (isset($document['file_url'])) {
                    $whatsapp->sendDocument($phone, $document['file_url'], $document['name'], $document['description'] ?? null);
                }
            }
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'required_documents' => $this->requiredDocuments,
        ];
    }
}
