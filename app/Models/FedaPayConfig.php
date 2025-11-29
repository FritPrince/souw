<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FedaPayConfig extends Model
{
    use HasFactory;


    protected $fillable = [
        'public_key_live',
        'secret_key_live',
        'public_key_sandbox',
        'secret_key_sandbox',
        'is_sandbox',
    ];

    protected function casts(): array
    {
        return [
            'is_sandbox' => 'boolean',
        ];
    }
}