<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentReminderSettings extends Model
{
    use HasFactory;

    protected $table = 'appointment_reminder_settings';

    protected $fillable = [
        'enabled',
        'reminder_hours',
        'email_enabled',
        'whatsapp_enabled',
        'email_subject',
        'email_template',
        'whatsapp_template',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'reminder_hours' => 'array',
            'email_enabled' => 'boolean',
            'whatsapp_enabled' => 'boolean',
        ];
    }

    public static function getSettings(): self
    {
        return static::firstOrCreate([], [
            'enabled' => true,
            'reminder_hours' => [24, 2],
            'email_enabled' => true,
            'whatsapp_enabled' => false,
        ]);
    }
}
