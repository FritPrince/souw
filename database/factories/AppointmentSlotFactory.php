<?php

namespace Database\Factories;

use App\Models\AppointmentSlot;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppointmentSlot>
 */
class AppointmentSlotFactory extends Factory
{
    protected $model = AppointmentSlot::class;

    public function definition(): array
    {
        $date = Carbon::today()->addDays($this->faker->numberBetween(1, 5));
        $start = $this->faker->dateTimeBetween('08:00', '16:00');
        $startTime = Carbon::instance($start)->format('H:i');
        $endTime = Carbon::instance($start)->addMinutes(30)->format('H:i');

        return [
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'is_available' => true,
            'max_bookings' => 3,
            'current_bookings' => 0,
        ];
    }
}







