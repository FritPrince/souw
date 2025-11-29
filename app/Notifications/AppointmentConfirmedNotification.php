<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Mail\AppointmentConfirmation;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class AppointmentConfirmedNotification extends Notification implements ShouldQueue
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

    public function toMail(object $notifiable): MailMessage|AppointmentConfirmation
    {
        // Utiliser le Mailable AppointmentConfirmation pour un email plus détaillé
        Mail::to($notifiable)->send(new AppointmentConfirmation($this->appointment));

        $slot = $this->appointment->appointmentSlot;
        $date = $slot->date->format('d/m/Y');
        $time = $slot->start_time->format('H:i');

        return (new MailMessage)
            ->subject("Confirmation de rendez-vous #{$this->appointment->id}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre rendez-vous a été confirmé avec succès.")
            ->line("Date: {$date}")
            ->line("Heure: {$time}")
            ->line("Service: {$this->appointment->service->name}")
            ->action('Voir mon rendez-vous', route('appointments.show', $this->appointment))
            ->line('Nous vous attendons !');
    }

    public function toWhatsApp(object $notifiable): string
    {
        $whatsapp = app(WhatsAppService::class);
        $phone = $notifiable->phone ?? $notifiable->email;

        $slot = $this->appointment->appointmentSlot;
        $date = $slot->date->format('d/m/Y');
        $time = $slot->start_time->format('H:i');

        $message = "✅ Rendez-vous confirmé !\n\n";
        $message .= "📅 Date: {$date}\n";
        $message .= "🕐 Heure: {$time}\n";
        $message .= "🛍️ Service: {$this->appointment->service->name}\n";
        $message .= "📍 Rendez-vous #{$this->appointment->id}\n\n";
        $message .= "Nous vous attendons !";

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
            'service' => $this->appointment->service->name,
        ];
    }
}
