<?php

namespace Tests\Feature\Admin;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceClearTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clear_all_services(): void
    {
        $admin = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        Service::factory()->count(3)->create();

        $this->actingAs($admin)
            ->post(route('admin.services.clear'))
            ->assertRedirect(route('admin.services.index'));

        $this->assertDatabaseCount('services', 0);
    }
}
