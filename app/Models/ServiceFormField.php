<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'label',
        'type',
        'placeholder',
        'is_required',
        'helper_text',
        'options',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'service_id' => 'integer',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'options' => 'array',
            'display_order' => 'integer',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
