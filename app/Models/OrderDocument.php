<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OrderDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'file_path',
        'file_name',
        'file_type',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'order_id' => 'integer',
            'uploaded_at' => 'datetime',
        ];
    }

    protected function appends(): array
    {
        return ['url'];
    }

    protected function url(): Attribute
    {
        return Attribute::get(fn (): string => Storage::url($this->file_path));
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}