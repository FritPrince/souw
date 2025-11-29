<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourismPackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Géré par middleware admin
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:tourism_packages,slug'],
            'description' => ['nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'video_path' => ['nullable', 'string', 'max:1024'],
            'media_type' => ['nullable', 'in:image,video'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'includes' => ['nullable', 'array'],
            'includes.*' => ['string', 'max:255'],
            'itinerary' => ['nullable', 'array'],
            'itinerary.*' => ['string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }
}
