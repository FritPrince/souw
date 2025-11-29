<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $phone,
        public string $email,
        public string $subject,
        public string $message,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Nouveau message de contact - {$this->subject}",
            replyTo: [$this->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact.form',
            with: [
                'clientName' => $this->name,
                'clientPhone' => $this->phone,
                'clientEmail' => $this->email,
                'subject' => $this->subject,
                'message' => $this->message,
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
