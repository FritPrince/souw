<?php

namespace App\Listeners;

use App\Events\AppointmentConfirmed;
use App\Notifications\AppointmentConfirmedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendAppointmentConfirmedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(AppointmentConfirmed $event): void
    {
        $event->appointment->user->notify(
            new AppointmentConfirmedNotification($event->appointment)
        );
    }
}
