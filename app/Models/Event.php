<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'image_path',
        'location',
        'country',
        'start_date',
        'end_date',
        'is_active',
        'is_featured',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function packs(): HasMany
    {
        return $this->hasMany(EventPack::class)->orderBy('order');
    }

    public function activePacks(): HasMany
    {
        return $this->hasMany(EventPack::class)
            ->where('is_active', true)
            ->orderBy('order');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function isUpcoming(): bool
    {
        return $this->start_date && $this->start_date->isFuture();
    }

    public function isOngoing(): bool
    {
        $now = now();

        return $this->start_date && $this->end_date
            && $now->between($this->start_date, $this->end_date);
    }

    public function isPast(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }
}

