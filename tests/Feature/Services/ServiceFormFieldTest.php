<?php

namespace Tests\Feature\Services;

use App\Models\Service;
use App\Models\ServiceFormField;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceFormFieldTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_show_exposes_dynamic_form_fields(): void
    {
        $service = Service::factory()->create([
            'slug' => 'test-service-show',
            'is_active' => true,
        ]);

        $fields = ServiceFormField::factory()
            ->count(2)
            ->for($service)
            ->sequence(
                ['name' => 'first_field', 'label' => 'Premier champ', 'type' => 'text'],
                ['name' => 'second_field', 'label' => 'Deuxième champ', 'type' => 'number']
            )
            ->create();

        $response = $this->get(route('services.show', $service->slug));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Services/Show')
                ->has('service.form_fields', 2)
                ->where('service.form_fields.0.name', $fields[0]->name)
                ->where('service.form_fields.1.name', $fields[1]->name)
            );
    }
}


