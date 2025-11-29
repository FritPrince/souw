<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Géré par middleware admin
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string'],
            'phone_primary' => ['sometimes', 'nullable', 'string', 'max:20'],
            'phone_secondary' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'appointment_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'appointment_pricing_mode' => ['sometimes', 'nullable', 'in:service_plus_appointment,appointment_only'],
            'rccm' => ['sometimes', 'nullable', 'string', 'max:50'],
            'ifu' => ['sometimes', 'nullable', 'string', 'max:50'],
            'whatsapp_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'logo' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hero_media_type' => ['sometimes', 'nullable', 'in:image,video'],
            'hero_image' => ['sometimes', 'nullable', 'image', 'max:8192'],
            'hero_image_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hero_video' => ['sometimes', 'nullable', 'file', 'mimetypes:video/mp4,video/webm,video/ogg', 'max:30720'],
            'hero_video_path' => ['sometimes', 'nullable', 'string', 'max:255'],
            'info_section1_image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'info_section2_image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'info_section3_image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'info_section1_badge' => ['sometimes', 'nullable', 'string', 'max:255'],
            'info_section2_badge' => ['sometimes', 'nullable', 'string', 'max:255'],
            'info_section3_badge' => ['sometimes', 'nullable', 'string', 'max:255'],
            'social_media' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
