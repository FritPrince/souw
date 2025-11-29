<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourismPackageRequest extends FormRequest
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
        $packageId = $this->route('package')->id ?? null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tourism_packages', 'slug')->ignore($packageId)],
            'description' => ['sometimes', 'nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'video_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'media_type' => ['sometimes', 'nullable', 'in:image,video'],
            'duration_days' => ['sometimes', 'required', 'integer', 'min:1'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'includes' => ['sometimes', 'nullable', 'array'],
            'includes.*' => ['string', 'max:255'],
            'itinerary' => ['sometimes', 'nullable', 'array'],
            'itinerary.*' => ['string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
