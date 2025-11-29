<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppointmentSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'is_available',
        'max_bookings',
        'current_bookings',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_available' => 'boolean',
            'max_bookings' => 'integer',
            'current_bookings' => 'integer',
        ];
    }

    public function isAvailable(): bool
    {
        return $this->is_available && $this->current_bookings < $this->max_bookings;
    }

    public function incrementBookings(): void
    {
        $this->increment('current_bookings');
    }

    public function decrementBookings(): void
    {
        $this->decrement('current_bookings');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
