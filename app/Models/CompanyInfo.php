<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone_primary',
        'phone_secondary',
        'email',
        'appointment_price',
        'appointment_pricing_mode',
        'rccm',
        'ifu',
        'whatsapp_number',
        'logo_path',
        'hero_image_path',
        'hero_video_path',
        'hero_media_type',
        'info_section1_image',
        'info_section2_image',
        'info_section3_image',
        'info_section1_badge',
        'info_section2_badge',
        'info_section3_badge',
        'social_media',
    ];

    protected function casts(): array
    {
        return [
            'social_media' => 'array',
            'appointment_price' => 'decimal:2',
        ];
    }
}
