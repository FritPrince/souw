<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\SubService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubService>
 */
class SubServiceFactory extends Factory
{
    protected $model = SubService::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->sentence(3);

        return [
            'service_id' => Service::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'description' => $this->faker->optional()->paragraph(),
            'price' => $this->faker->randomFloat(2, 30, 1500),
            'is_active' => true,
        ];
    }
}







