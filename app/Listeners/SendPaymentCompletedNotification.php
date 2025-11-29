<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Notifications\PaymentCompletedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPaymentCompletedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PaymentCompleted $event): void
    {
        $event->payment->user->notify(
            new PaymentCompletedNotification($event->payment)
        );
    }
}
