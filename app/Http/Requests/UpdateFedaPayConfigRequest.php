<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFedaPayConfigRequest extends FormRequest
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
            'public_key_live' => ['nullable', 'string', 'max:255'],
            'secret_key_live' => ['nullable', 'string', 'max:255'],
            'public_key_sandbox' => ['nullable', 'string', 'max:255'],
            'secret_key_sandbox' => ['nullable', 'string', 'max:255'],
            'is_sandbox' => ['boolean'],
        ];
    }
}