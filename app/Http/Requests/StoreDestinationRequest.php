<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDestinationRequest extends FormRequest
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
            'slug' => ['required', 'string', 'max:255', 'unique:destinations,slug'],
            'code' => ['nullable', 'string', 'max:3'],
            'continent' => ['nullable', 'string', 'max:255'],
            'flag_emoji' => ['nullable', 'string', 'max:10'],
            'description' => ['nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'video_path' => ['nullable', 'string', 'max:1024'],
            'media_type' => ['nullable', 'in:image,video'],
            'is_active' => ['boolean'],
        ];
    }
}
