<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDestinationRequest extends FormRequest
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
        $destinationId = $this->route('destination')->id ?? null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('destinations', 'slug')->ignore($destinationId)],
            'code' => ['sometimes', 'nullable', 'string', 'max:3'],
            'continent' => ['sometimes', 'nullable', 'string', 'max:255'],
            'flag_emoji' => ['sometimes', 'nullable', 'string', 'max:10'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'image', 'max:4096'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'video_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'media_type' => ['sometimes', 'nullable', 'in:image,video'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
