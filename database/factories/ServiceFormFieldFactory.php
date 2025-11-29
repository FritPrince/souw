<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceFormField>
 */
class ServiceFormFieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fieldName = Str::slug($this->faker->unique()->words(2, true), '_');

        return [
            'service_id' => Service::factory(),
            'name' => $fieldName,
            'label' => Str::title(str_replace('_', ' ', $fieldName)),
            'type' => $this->faker->randomElement(['text', 'textarea', 'number', 'date', 'select']),
            'placeholder' => $this->faker->optional()->sentence(3),
            'is_required' => $this->faker->boolean(),
            'is_active' => true,
            'helper_text' => $this->faker->optional()->sentence(),
            'options' => null,
            'display_order' => $this->faker->numberBetween(1, 5),
        ];
    }
}
