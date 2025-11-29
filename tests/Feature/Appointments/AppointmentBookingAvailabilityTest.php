<?php

namespace Tests\Feature\Appointments;

use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentBookingAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_page_displays_company_slot_days(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 6, 10)); // Lundi pour éviter les jours fermés

        $user = User::factory()->create();
        $service = Service::factory()->create([
            'requires_appointment' => true,
        ]);

        $this->actingAs($user)
            ->get(route('appointments.book', ['service_id' => $service->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Services/BookAppointment')
                ->where('service.id', $service->id)
                ->where('slotsByDate', function ($slotsByDate) {
                    $slots = collect($slotsByDate);

                    if ($slots->isEmpty()) {
                        return false;
                    }

                    $firstDay = $slots->first();

                    return ! empty($firstDay['slots']);
                })
            );

        Carbon::setTestNow();
    }
}

