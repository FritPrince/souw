<?php

namespace Tests\Feature\Services;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceProcessingTime;
use App\Models\SubService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ServiceSpecialCaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_passport_special_case_flow(): void
    {
        Mail::fake();

        $user = User::factory()->create();
        $category = Category::factory()->create(['slug' => 'documents-administratifs']);

        $service = Service::factory()
            ->for($category)
            ->create([
                'name' => 'Passeport biométrique',
                'requires_appointment' => false,
                'price' => 100_000,
            ]);

        ServiceProcessingTime::create([
            'service_id' => $service->id,
            'duration_label' => '24h',
            'duration_hours' => 24,
            'price_multiplier' => 2,
        ]);

        ServiceProcessingTime::create([
            'service_id' => $service->id,
            'duration_label' => '72h',
            'duration_hours' => 72,
            'price_multiplier' => 1.2,
        ]);

        SubService::factory()
            ->for($service)
            ->create([
                'name' => 'Passeport express',
                'price' => 250_000,
            ]);

        $destination = Destination::create([
            'name' => 'France',
            'slug' => 'france',
            'code' => 'FR',
            'continent' => 'Europe',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('services.show', $service->slug))
            ->assertOk();

        $processingTime = $service->processingTimes()->where('duration_label', '24h')->first();
        $subService = $service->subServices()->first();

        $this->actingAs($user)
            ->post(route('orders.store'), [
                'service_id' => $service->id,
                'destination_id' => $destination->id,
                'sub_service_id' => $subService->id,
                'processing_time_id' => $processingTime->id,
                'notes' => 'Traitement urgent',
            ])
            ->assertRedirect();

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertSame('pending', $order->status);
        $this->assertSame('pending', $order->payment_status);
        $this->assertSame(
            $subService->price * $processingTime->price_multiplier,
            (float) $order->total_amount
        );

        Mail::assertNothingSent();
    }
}
