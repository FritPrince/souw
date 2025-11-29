<?php

namespace Tests\Feature\Admin;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSlotManagementTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'email' => 'test@example.com',
        ]);
    }

    public function test_admin_can_delete_slot_without_appointments(): void
    {
        $admin = $this->createAdmin();
        $slot = AppointmentSlot::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.appointments.destroy-slot', $slot))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('appointment_slots', ['id' => $slot->id]);
    }

    public function test_admin_cannot_delete_slot_with_appointments(): void
    {
        $admin = $this->createAdmin();
        $slot = AppointmentSlot::factory()->create();
        $service = Service::factory()->create();

        // Créer un rendez-vous associé au créneau
        Appointment::create([
            'user_id' => $admin->id,
            'appointment_slot_id' => $slot->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.appointments.destroy-slot', $slot))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('appointment_slots', ['id' => $slot->id]);
    }

    public function test_admin_can_clear_slots_without_appointments(): void
    {
        $admin = $this->createAdmin();

        AppointmentSlot::factory()->count(5)->create();

        $this->assertDatabaseCount('appointment_slots', 5);

        $this->actingAs($admin)
            ->post(route('admin.appointments.clear-slots'))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseCount('appointment_slots', 0);
    }

    public function test_clear_slots_preserves_slots_with_appointments(): void
    {
        $admin = $this->createAdmin();
        $service = Service::factory()->create();

        // Créer des créneaux sans rendez-vous
        AppointmentSlot::factory()->count(3)->create();

        // Créer un créneau avec un rendez-vous
        $slotWithAppointment = AppointmentSlot::factory()->create();
        Appointment::create([
            'user_id' => $admin->id,
            'appointment_slot_id' => $slotWithAppointment->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseCount('appointment_slots', 4);

        $this->actingAs($admin)
            ->post(route('admin.appointments.clear-slots'))
            ->assertRedirect()
            ->assertSessionHas('success');

        // Le créneau avec rendez-vous doit être préservé
        $this->assertDatabaseCount('appointment_slots', 1);
        $this->assertDatabaseHas('appointment_slots', ['id' => $slotWithAppointment->id]);
    }
}
