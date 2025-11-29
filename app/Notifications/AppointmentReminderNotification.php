<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $appointment
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
        $slot = $this->appointment->appointmentSlot;
        $date = $slot->date->format('d/m/Y');
        $time = $slot->start_time->format('H:i');

        return (new MailMessage)
            ->subject("Rappel: Rendez-vous demain à {$time}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Ceci est un rappel pour votre rendez-vous.")
            ->line("Date: {$date}")
            ->line("Heure: {$time}")
            ->line("Service: {$this->appointment->service->name}")
            ->action('Voir mon rendez-vous', route('appointments.show', $this->appointment))
            ->line('À bientôt !');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $slot = $this->appointment->appointmentSlot;
        $date = $slot->date->format('d/m/Y');
        $time = $slot->start_time->format('H:i');

        $message = "⏰ Rappel de rendez-vous\n\n";
        $message .= "📅 Date: {$date}\n";
        $message .= "🕐 Heure: {$time}\n";
        $message .= "🛍️ Service: {$this->appointment->service->name}\n\n";
        $message .= "N'oubliez pas votre rendez-vous !";

        if ($phone) {
            $whatsapp->sendMessage($phone, $message);
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'date' => $this->appointment->appointmentSlot->date,
        ];
    }
}
