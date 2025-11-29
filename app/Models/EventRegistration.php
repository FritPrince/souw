<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EventRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_pack_id',
        'user_id',
        'full_name',
        'gender',
        'birth_date',
        'birth_place',
        'birth_country',
        'nationality',
        'profession',
        'address',
        'residence_country',
        'email',
        'phone',
        'status',
        'notes',
        'reference',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (EventRegistration $registration) {
            if (empty($registration->reference)) {
                $registration->reference = self::generateReference();
            }
        });
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'EVT-'.strtoupper(Str::random(8));
        } while (self::where('reference', $reference)->exists());

        return $reference;
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function pack(): BelongsTo
    {
        return $this->belongsTo(EventPack::class, 'event_pack_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getGenderLabelAttribute(): string
    {
        return match ($this->gender) {
            'male' => 'Masculin',
            'female' => 'Féminin',
            default => $this->gender,
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'En attente',
            'confirmed' => 'Confirmée',
            'cancelled' => 'Annulée',
            'completed' => 'Terminée',
            default => $this->status,
        };
    }
}

