<?php

namespace App\Console\Commands\Appointments;

use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateSlotsCommand extends Command
{
    protected $signature = 'appointments:generate-slots 
                            {--days=30 : Nombre de jours à générer à l\'avance}
                            {--date= : Date spécifique (format: Y-m-d)}
                            {--recurring : Générer des créneaux récurrents}';

    protected $description = 'Générer des créneaux de rendez-vous';

    public function handle(AppointmentService $appointmentService): int
    {
        $days = (int) $this->option('days');
        $date = $this->option('date');
        $recurring = $this->option('recurring');

        if ($date) {
            try {
                $dateCarbon = Carbon::parse($date);
                $generated = $appointmentService->generateSlotsForDate($dateCarbon);
                $this->info("✅ {$generated} créneau(x) généré(s) pour le {$dateCarbon->format('d/m/Y')}.");
            } catch (\Exception $e) {
                $this->error("❌ Erreur: {$e->getMessage()}");

                return Command::FAILURE;
            }
        } elseif ($recurring) {
            $generated = $appointmentService->generateRecurringSlots($days);
            $this->info("✅ {$generated} créneau(x) récurrent(s) généré(s) pour les {$days} prochains jours.");
        } else {
            // Générer pour une date spécifique (aujourd'hui par défaut)
            $dateCarbon = Carbon::today();
            $generated = $appointmentService->generateSlotsForDate($dateCarbon);
            $this->info("✅ {$generated} créneau(x) généré(s) pour aujourd'hui ({$dateCarbon->format('d/m/Y')}).");
            $this->line("💡 Utilisez --recurring pour générer des créneaux récurrents.");
        }

        return Command::SUCCESS;
    }
}
