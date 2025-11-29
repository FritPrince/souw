<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Planifier l'envoi des rappels de rendez-vous
// Le scheduler utilise --all pour envoyer tous les rappels configurés
Schedule::command('appointments:send-reminders --all')
    ->name('send-appointment-reminders')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground()
    ->description('Envoyer les rappels de rendez-vous selon la configuration');
