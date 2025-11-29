<?php

namespace Tests\Feature\Services;

use App\Models\Category;
use App\Models\Service;
use App\Models\SubService;
use Database\Seeders\ServiceStructureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceOrganizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_services_follow_agency_category_structure(): void
    {
        $this->seed(ServiceStructureSeeder::class);

        $tourismCategory = Category::where('slug', 'visites-guidees-tourisme-international')->first();
        $this->assertNotNull($tourismCategory, 'La catégorie VISITES GUIDÉES & TOURISME INTERNATIONAL doit exister.');

        $service = Service::factory()
            ->for($tourismCategory)
            ->create([
                'name' => 'Tourisme test',
                'requires_appointment' => true,
            ]);

        $subServices = SubService::factory()
            ->count(3)
            ->for($service)
            ->create([
                'is_active' => true,
            ]);

        $response = $this->get(route('services.show', $service->slug));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Services/Show')
                ->where('service.name', $service->name)
                ->where('service.category.slug', 'visites-guidees-tourisme-international')
                ->has('service.sub_services', $subServices->count())
            );
    }
}







