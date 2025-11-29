<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConsultationRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public ?string $message,
        public string $date,
        public string $startTime,
        public string $endTime,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Nouvelle demande de consultation - {$this->name}",
            replyTo: [$this->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.consultation.request',
            with: [
                'clientName' => $this->name,
                'clientEmail' => $this->email,
                'clientMessage' => $this->message,
                'appointmentDate' => $this->date,
                'appointmentStartTime' => $this->startTime,
                'appointmentEndTime' => $this->endTime,
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
