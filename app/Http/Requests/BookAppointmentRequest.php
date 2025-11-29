<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // L'authentification est gérée par le middleware 'auth'
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'appointment_slot_id' => ['required', 'exists:appointment_slots,id'],
            'service_id' => ['required', 'exists:services,id'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'sub_service_id' => ['nullable', 'exists:sub_services,id'],
            'destination_id' => ['nullable', 'exists:destinations,id'],
            'processing_time_id' => ['nullable', 'exists:service_processing_times,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
