<?php

namespace App\Console\Commands\Appointments;

use App\Models\Appointment;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendRemindersCommand extends Command
{
    protected $signature = 'appointments:send-reminders 
                            {--hours=24 : Nombre d\'heures avant le rendez-vous pour envoyer le rappel}
                            {--all : Envoyer tous les rappels configurés (24h et 2h avant)}';

    protected $description = 'Envoyer les rappels pour les rendez-vous à venir';

    public function handle(AppointmentService $appointmentService): int
    {
        $hours = (int) $this->option('hours');
        $sendAll = $this->option('all');

        // Si --all est spécifié, envoyer les rappels à 24h et 2h avant
        if ($sendAll) {
            return $this->sendAllReminders($appointmentService);
        }

        // Récupérer les settings depuis la base de données
        $settings = \App\Models\AppointmentReminderSettings::getSettings();
        
        if (! $settings->enabled) {
            $this->info('ℹ️  Les rappels automatiques sont désactivés.');

            return Command::SUCCESS;
        }

        // Si aucune heure spécifiée, utiliser les heures configurées
        if (! $hours && ! empty($settings->reminder_hours)) {
            // Si on est dans le mode normal (sans --all), utiliser la première heure configurée
            // Le scheduler appellera la commande pour chaque heure
            $reminderHours = $settings->reminder_hours[0] ?? 24;
        } else {
            $reminderHours = $hours ?? 24;
        }

        // Calculer la fenêtre de temps pour les rappels
        $now = Carbon::now();
        $reminderTimeStart = $now->copy()->addHours($reminderHours)->subMinutes(30);
        $reminderTimeEnd = $now->copy()->addHours($reminderHours)->addMinutes(30);

        // Récupérer les rendez-vous qui nécessitent un rappel
        $appointments = Appointment::whereIn('status', ['scheduled', 'confirmed'])
            ->whereHas('appointmentSlot', function ($query) use ($reminderTimeStart, $reminderTimeEnd) {
                $query->where(function ($q) use ($reminderTimeStart, $reminderTimeEnd) {
                    // Rendez-vous dans la fenêtre de rappel
                    $q->whereBetween('date', [
                        $reminderTimeStart->format('Y-m-d'),
                        $reminderTimeEnd->format('Y-m-d'),
                    ])
                        ->where(function ($timeQuery) use ($reminderTimeStart, $reminderTimeEnd) {
                            if ($reminderTimeStart->isSameDay($reminderTimeEnd)) {
                                $timeQuery->whereTime('start_time', '>=', $reminderTimeStart->format('H:i:s'))
                                    ->whereTime('start_time', '<=', $reminderTimeEnd->format('H:i:s'));
                            } else {
                                $timeQuery->where(function ($tq) use ($reminderTimeStart, $reminderTimeEnd) {
                                    $tq->where(function ($d1) use ($reminderTimeStart) {
                                        $d1->where('date', $reminderTimeStart->format('Y-m-d'))
                                            ->whereTime('start_time', '>=', $reminderTimeStart->format('H:i:s'));
                                    })
                                        ->orWhere(function ($d2) use ($reminderTimeEnd) {
                                            $d2->where('date', $reminderTimeEnd->format('Y-m-d'))
                                                ->whereTime('start_time', '<=', $reminderTimeEnd->format('H:i:s'));
                                        })
                                        ->orWhereBetween('date', [
                                            $reminderTimeStart->copy()->addDay()->format('Y-m-d'),
                                            $reminderTimeEnd->copy()->subDay()->format('Y-m-d'),
                                        ]);
                                });
                            }
                        });
                });
            })
            ->with(['user', 'appointmentSlot', 'service'])
            ->get()
            ->filter(function ($appointment) use ($reminderHours) {
                // Vérifier si le rappel n'a pas déjà été envoyé pour cette heure
                $slot = $appointment->appointmentSlot;
                $appointmentDateTime = Carbon::parse($slot->date->format('Y-m-d').' '.$slot->start_time->format('H:i:s'));
                $hoursUntilAppointment = Carbon::now()->diffInHours($appointmentDateTime, false);

                // Vérifier si on est dans la bonne fenêtre pour ce rappel
                if ($hoursUntilAppointment < 0) {
                    return false; // Rendez-vous déjà passé
                }

                // Si reminder_sent_at existe, vérifier qu'on n'envoie pas le même rappel
                if ($appointment->reminder_sent_at) {
                    $lastReminderHours = Carbon::now()->diffInHours($appointment->reminder_sent_at, false);
                    // Ne pas renvoyer si le dernier rappel était pour la même heure
                    if (abs($lastReminderHours - $reminderHours) < 2) {
                        return false;
                    }
                }

                // Vérifier que le rendez-vous est dans la fenêtre de rappel
                return abs($hoursUntilAppointment - $reminderHours) <= 1;
            });

        if ($appointments->isEmpty()) {
            $this->info("ℹ️  Aucun rappel à envoyer pour {$reminderHours}h avant le rendez-vous.");

            return Command::SUCCESS;
        }

        $this->info("📧 Envoi de {$appointments->count()} rappel(s) ({$reminderHours}h avant le rendez-vous)...");

        $sent = 0;
        $failed = 0;

        foreach ($appointments as $appointment) {
            try {
                $appointmentService->sendReminder($appointment, $reminderHours);
                $sent++;
                $slot = $appointment->appointmentSlot;
                $this->line("  ✅ Rappel envoyé pour le rendez-vous #{$appointment->id} - {$appointment->user->name} ({$slot->date->format('d/m/Y')} à {$slot->start_time->format('H:i')})");
            } catch (\Exception $e) {
                $failed++;
                $this->error("  ❌ Erreur pour le rendez-vous #{$appointment->id}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("✅ {$sent} rappel(s) envoyé(s) avec succès.");
        if ($failed > 0) {
            $this->warn("⚠️  {$failed} rappel(s) ont échoué.");
        }

        return Command::SUCCESS;
    }

    private function sendAllReminders(AppointmentService $appointmentService): int
    {
        $this->info('📧 Envoi de tous les rappels configurés...');
        $this->newLine();

        // Récupérer les settings depuis la base de données
        $settings = \App\Models\AppointmentReminderSettings::getSettings();
        
        if (! $settings->enabled) {
            $this->info('ℹ️  Les rappels automatiques sont désactivés.');

            return Command::SUCCESS;
        }

        if (empty($settings->reminder_hours)) {
            $this->warn('⚠️  Aucune heure de rappel configurée.');

            return Command::SUCCESS;
        }

        $allSuccess = true;

        foreach ($settings->reminder_hours as $hours) {
            $this->info("🕐 Rappels à {$hours}h avant le rendez-vous:");
            $result = $this->call('appointments:send-reminders', ['--hours' => $hours]);
            $this->newLine();

            if ($result !== Command::SUCCESS) {
                $allSuccess = false;
            }
        }

        if ($allSuccess) {
            $this->info('✅ Tous les rappels ont été traités.');

            return Command::SUCCESS;
        }

        return Command::FAILURE;
    }
}
