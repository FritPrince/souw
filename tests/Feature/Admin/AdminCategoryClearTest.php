<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryClearTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clear_all_categories(): void
    {
        $admin = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        Category::factory()->count(3)->create();

        $this->actingAs($admin)
            ->post(route('admin.categories.clear'))
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseCount('categories', 0);
    }
}












