<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceProcessingTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'duration_label',
        'duration_hours',
        'price_multiplier',
    ];

    protected function casts(): array
    {
        return [
            'service_id' => 'integer',
            'duration_hours' => 'integer',
            'price_multiplier' => 'decimal:2',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}