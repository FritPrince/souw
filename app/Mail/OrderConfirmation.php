<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Confirmation de commande #{$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        $this->order->loadMissing('documents');

        return new Content(view: 'emails.orders.confirmation', with: [
            'order' => $this->order,
            'user' => $this->order->user,
            'service' => $this->order->service,
            'subService' => $this->order->subService,
            'destination' => $this->order->destination,
            'documents' => $this->order->documents->map(fn ($document) => [
                'name' => $document->file_name,
                'uploaded_at' => $document->uploaded_at?->format('d/m/Y H:i'),
                'url' => Storage::url($document->file_path),
                'mime' => $document->file_type,
            ]),
        ]);
    }

    public function attachments(): array
    {
        return [];
    }
}
