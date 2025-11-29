<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'max:2048'],
            'avatar_path' => ['nullable', 'string', 'max:1024'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
