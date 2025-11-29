<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TourismPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_path',
        'video_path',
        'media_type',
        'duration_days',
        'price',
        'includes',
        'itinerary',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'price' => 'decimal:2',
            'includes' => 'array',
            'itinerary' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected function appends(): array
    {
        return ['image_url'];
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! $this->image_path) {
                return null;
            }

            if (Str::startsWith($this->image_path, ['http://', 'https://'])) {
                return $this->image_path;
            }

            return Storage::url(ltrim($this->image_path, '/'));
        });
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(TourismBooking::class);
    }
}
