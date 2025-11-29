<?php

namespace App\Notifications;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification
{
    public function __construct(
        public Order $order,
        public string $oldStatus,
        public string $newStatus
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
        $old = $this->statusDetails($this->oldStatus);
        $new = $this->statusDetails($this->newStatus);

        return (new MailMessage)
            ->subject("Commande {$this->order->order_number} — {$new['label']}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre commande #{$this->order->order_number} vient de passer à l'étape « {$new['label']} »." )
            ->line($new['message'])
            ->line("Statut précédent : {$old['label']}")
            ->action('Suivre ma commande', route('orders.show', $this->order))
            ->line('Notre équipe reste disponible si vous avez des questions.');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $old = $this->statusDetails($this->oldStatus);
        $new = $this->statusDetails($this->newStatus);

        $message = "📢 Mise à jour de votre commande\n\n";
        $message .= "📋 Commande #{$this->order->order_number}\n";
        $message .= "✅ Nouveau statut : {$new['label']}\n";
        $message .= "ℹ️ {$new['message']}\n\n";
        $message .= "Ancien statut : {$old['label']}\n";
        $message .= "🔗 Suivi : ".route('orders.show', $this->order);

        if ($phone) {
            $whatsapp->sendMessage($phone, $message);
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
        ];
    }

    protected function statusDetails(string $status): array
    {
        return match (strtolower($status)) {
            'pending' => [
                'label' => 'En attente',
                'message' => "Nous avons bien reçu votre demande. Dès validation du paiement, nous lançons votre dossier.",
            ],
            'processing' => [
                'label' => 'En traitement',
                'message' => "Notre équipe s'occupe actuellement de votre dossier. Vous recevrez une mise à jour dès qu'une étape sera franchie.",
            ],
            'completed' => [
                'label' => 'Terminée',
                'message' => "Votre commande est finalisée. Merci de vérifier votre messagerie, nous vous avons envoyé le récapitulatif complet.",
            ],
            'cancelled' => [
                'label' => 'Annulée',
                'message' => "La commande a été annulée. Contactez-nous si vous souhaitez la relancer ou si vous avez besoin d'assistance.",
            ],
            'failed' => [
                'label' => 'Échouée',
                'message' => "Le processus n'a pas abouti. Vérifiez vos informations ou contactez notre support pour reprendre la procédure.",
            ],
            'paid' => [
                'label' => 'Payée',
                'message' => "Nous avons bien reçu votre règlement. Votre dossier passe immédiatement en traitement.",
            ],
            default => [
                'label' => ucfirst($status),
                'message' => "Nous poursuivons le traitement de votre commande et vous tiendrons informé des prochaines étapes.",
            ],
        };
    }
}
