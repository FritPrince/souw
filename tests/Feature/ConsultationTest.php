<?php

namespace Tests\Feature;

use App\Mail\ConsultationRequestNotification;
use App\Models\AppointmentSlot;
use App\Models\CompanyInfo;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ConsultationTest extends TestCase
{
    use RefreshDatabase;

    public function test_consultation_page_can_be_rendered(): void
    {
        $response = $this->get(route('consultation.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Consultation/Index')
            ->has('availableDates')
            ->has('slotsByDate')
        );
    }

    public function test_available_dates_are_shown_correctly(): void
    {
        // Créer un créneau disponible pour demain
        $tomorrow = Carbon::tomorrow();
        $slot = AppointmentSlot::factory()->create([
            'date' => $tomorrow,
            'is_available' => true,
            'max_bookings' => 3,
            'current_bookings' => 0,
        ]);

        $response = $this->get(route('consultation.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('availableDates', fn ($dates) => in_array($tomorrow->format('Y-m-d'), is_array($dates) ? $dates : $dates->toArray()))
        );
    }

    public function test_user_can_submit_consultation_request(): void
    {
        Mail::fake();

        // Créer une entreprise avec un email
        CompanyInfo::create([
            'name' => 'Test Company',
            'email' => 'admin@test.com',
        ]);

        // Créer un créneau disponible
        $slot = AppointmentSlot::factory()->create([
            'date' => Carbon::tomorrow(),
            'is_available' => true,
            'max_bookings' => 3,
            'current_bookings' => 0,
        ]);

        $response = $this->post(route('consultation.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'Je souhaite discuter de mon projet.',
            'appointment_slot_id' => $slot->id,
            'accept_terms' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Vérifier que le mail a été envoyé
        Mail::assertSent(ConsultationRequestNotification::class, function ($mail) {
            return $mail->hasTo('admin@test.com');
        });

        // Vérifier que le compteur a été incrémenté
        $slot->refresh();
        $this->assertEquals(1, $slot->current_bookings);
    }

    public function test_consultation_request_requires_valid_data(): void
    {
        $slot = AppointmentSlot::factory()->create([
            'date' => Carbon::tomorrow(),
            'is_available' => true,
        ]);

        $response = $this->post(route('consultation.store'), [
            'name' => '',
            'email' => 'invalid-email',
            'appointment_slot_id' => $slot->id,
            'accept_terms' => false,
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'accept_terms']);
    }

    public function test_cannot_book_unavailable_slot(): void
    {
        Mail::fake();

        CompanyInfo::create([
            'name' => 'Test Company',
            'email' => 'admin@test.com',
        ]);

        // Créer un créneau complet
        $slot = AppointmentSlot::factory()->create([
            'date' => Carbon::tomorrow(),
            'is_available' => true,
            'max_bookings' => 1,
            'current_bookings' => 1,
        ]);

        $response = $this->post(route('consultation.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'appointment_slot_id' => $slot->id,
            'accept_terms' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        // Vérifier qu'aucun mail n'a été envoyé
        Mail::assertNotSent(ConsultationRequestNotification::class);
    }
}
