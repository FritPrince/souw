<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KkiaPayConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_key_live',
        'private_key_live',
        'secret_live',
        'public_key_sandbox',
        'private_key_sandbox',
        'secret_sandbox',
        'is_sandbox',
    ];

    protected function casts(): array
    {
        return [
            'is_sandbox' => 'boolean',
        ];
    }
}
