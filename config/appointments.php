<?php

return [
    'default_work_hours' => [
        'start' => '09:00',
        'end' => '17:00',
        'lunch_break_start' => '12:00',
        'lunch_break_end' => '13:00',
    ],

    'slot_duration_minutes' => 30,

    'max_bookings_per_slot' => 1,

    'advance_booking_days' => 30,

    'reminder_hours_before' => 24,

    'closed_days' => [
        'sunday',
    ],

    'holidays' => [
        // Format: 'Y-m-d' => 'Nom du jour férié'
        // Exemple: '2025-01-01' => 'Jour de l\'an',
    ],

    'recurring_slots' => [
        'enabled' => true,
        'generate_days_ahead' => 30,
    ],
];
