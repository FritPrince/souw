<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'image_path',
        'video_path',
        'media_type',
        'price',
        'show_price',
        'is_active',
        'requires_appointment',
        'appointment_pricing_mode',
    ];

    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'price' => 'decimal:2',
            'show_price' => 'boolean',
            'is_active' => 'boolean',
            'requires_appointment' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subServices(): HasMany
    {
        return $this->hasMany(SubService::class);
    }

    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'service_destination')
            ->withPivot('price_override', 'is_active')
            ->withTimestamps();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function requiredDocuments(): HasMany
    {
        return $this->hasMany(RequiredDocument::class);
    }

    public function processingTimes(): HasMany
    {
        return $this->hasMany(ServiceProcessingTime::class);
    }

    public function formFields(): HasMany
    {
        return $this->hasMany(ServiceFormField::class)
            ->where('is_active', true)
            ->orderBy('display_order');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}