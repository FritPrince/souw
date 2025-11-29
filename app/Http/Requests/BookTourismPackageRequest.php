<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookTourismPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tourism_package_id' => ['required', 'integer', 'exists:tourism_packages,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'number_of_people' => ['required', 'integer', 'min:1'],
        ];
    }
}
