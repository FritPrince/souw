<?php

namespace App\Jobs;

use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Services\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaymentCallback implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $callbackData
    ) {
    }

    public function handle(PaymentService $paymentService): void
    {
        $payment = $paymentService->handleCallback($this->callbackData);

        if (! $payment) {
            return;
        }

        if ($payment->payment_status === 'completed') {
            event(new PaymentCompleted($payment));
        } else {
            event(new PaymentFailed($payment, 'Paiement échoué'));
        }
    }
}
