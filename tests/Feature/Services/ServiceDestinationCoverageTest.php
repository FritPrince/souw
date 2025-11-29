<?php

namespace Tests\Feature\Services;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Service;
use Database\Seeders\ServiceStructureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceDestinationCoverageTest extends TestCase
{
    use RefreshDatabase;

    public function test_services_are_listed_with_categories_and_destinations(): void
    {
        $this->seed(ServiceStructureSeeder::class);

        $category = Category::where('slug', 'visites-guidees-tourisme-international')->first();
        $service = Service::factory()->for($category)->create([
            'name' => 'Tourisme test',
            'slug' => Str::slug('Tourisme test').'-test',
        ]);

        $response = $this->get(route('services.index'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Services/Index')
                ->where('categories', fn ($categories) => collect($categories)->contains(fn ($cat) => $cat['slug'] === 'visites-guidees-tourisme-international'))
                ->where('destinations', fn ($destinations) => collect($destinations)->contains(fn ($dest) => $dest['slug'] === 'france'))
            );
    }

    public function test_services_can_be_filtered_by_destination(): void
    {
        $this->seed(ServiceStructureSeeder::class);

        $category = Category::where('slug', 'visites-guidees-tourisme-international')->first();
        $service = Service::factory()->for($category)->create([
            'name' => 'Tourisme filtré',
            'slug' => Str::slug('Tourisme filtré').'-test',
        ]);

        $destination = Destination::where('slug', 'france')->first();
        $service->destinations()->attach($destination->id, ['is_active' => true]);

        $response = $this->get(route('services.destination', $destination->slug));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Services/Index')
                ->where('services.data', fn ($services) => collect($services)->contains(fn ($srv) => $srv['slug'] === $service->slug))
                ->where('destination.slug', $destination->slug)
            );
    }
}
