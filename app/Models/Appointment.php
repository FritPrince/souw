<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'guest_name',
        'guest_email',
        'appointment_slot_id',
        'service_id',
        'status',
        'notes',
        'reminder_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'order_id' => 'integer',
            'user_id' => 'integer',
            'appointment_slot_id' => 'integer',
            'service_id' => 'integer',
            'reminder_sent_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointmentSlot(): BelongsTo
    {
        return $this->belongsTo(AppointmentSlot::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}