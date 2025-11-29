<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reçu de paiement #{$this->payment->transaction_id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payments.receipt',
            with: [
                'payment' => $this->payment,
                'order' => $this->payment->order,
                'user' => $this->payment->user,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
