<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentReminderSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'reminder_hours' => ['required', 'array'],
            'reminder_hours.*' => ['required', 'integer', 'min:1', 'max:168'], // Max 7 jours
            'email_enabled' => ['required', 'boolean'],
            'whatsapp_enabled' => ['required', 'boolean'],
            'email_subject' => ['nullable', 'string', 'max:255'],
            'email_template' => ['nullable', 'string'],
            'whatsapp_template' => ['nullable', 'string'],
        ];
    }
}
