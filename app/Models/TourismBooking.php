<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class TourismBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tourism_package_id',
        'start_date',
        'end_date',
        'number_of_people',
        'total_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'tourism_package_id' => 'integer',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'number_of_people' => 'integer',
            'total_amount' => 'decimal:2',
        ];
    }

    protected function appends(): array
    {
        return [
            'start_date_formatted',
            'end_date_formatted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function startDateFormatted(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->start_date
            ? Carbon::parse($this->start_date)->translatedFormat('d F Y à H:i')
            : null);
    }

    protected function endDateFormatted(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->end_date
            ? Carbon::parse($this->end_date)->translatedFormat('d F Y à H:i')
            : null);
    }

    public function tourismPackage(): BelongsTo
    {
        return $this->belongsTo(TourismPackage::class);
    }
}