<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Appointment $appointment
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Confirmation de rendez-vous #{$this->appointment->id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointments.confirmation',
            with: [
                'appointment' => $this->appointment,
                'user' => $this->appointment->user,
                'slot' => $this->appointment->appointmentSlot,
                'service' => $this->appointment->service,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
