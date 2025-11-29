<?php

namespace Tests\Feature\Admin;

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTestimonialClearTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clear_all_testimonials(): void
    {
        $admin = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        Testimonial::factory()->count(3)->create();

        $this->actingAs($admin)
            ->post(route('admin.testimonials.clear'))
            ->assertRedirect(route('admin.testimonials.index'));

        $this->assertDatabaseCount('testimonials', 0);
    }
}
