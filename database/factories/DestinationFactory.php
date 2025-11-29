<?php

namespace Database\Factories;

use App\Models\Destination;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Destination>
 */
class DestinationFactory extends Factory
{
    protected $model = Destination::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->country();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(4),
            'code' => strtoupper(Str::random(2)),
            'continent' => $this->faker->randomElement(['Europe', 'Amérique du Nord', 'Asie', 'Afrique']),
            'flag_emoji' => '🏳️',
            'description' => $this->faker->optional()->paragraph(),
            'is_active' => true,
        ];
    }
}







