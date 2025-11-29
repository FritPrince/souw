<?php

namespace Tests\Feature\Admin;

use App\Models\Destination;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDestinationClearTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clear_all_destinations(): void
    {
        $admin = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        Destination::factory()->count(3)->create();

        $this->actingAs($admin)
            ->post(route('admin.destinations.clear'))
            ->assertRedirect(route('admin.destinations.index'));

        $this->assertDatabaseCount('destinations', 0);
    }
}
