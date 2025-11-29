<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
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
        $rules = [
            'service_id' => ['required', 'exists:services,id'],
            'sub_service_id' => ['nullable', 'exists:sub_services,id'],
            'destination_id' => ['nullable', 'exists:destinations,id'],
            'processing_time_id' => ['nullable', 'exists:service_processing_times,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'additional_data' => ['nullable', 'array'],
        ];

        // Add dynamic validation rules for service form fields
        if ($this->has('service_id')) {
            $service = Service::with('formFields')->find($this->service_id);
            if ($service && $service->formFields) {
                foreach ($service->formFields as $field) {
                    $fieldKey = "additional_data.{$field->name}";
                    $fieldRules = [];

                    if ($field->is_required) {
                        $fieldRules[] = 'required';
                    } else {
                        $fieldRules[] = 'nullable';
                    }

                    // Add type-specific validation
                    switch ($field->type) {
                        case 'number':
                            $fieldRules[] = 'numeric';
                            break;
                        case 'date':
                            $fieldRules[] = 'date';
                            break;
                        case 'select':
                            if ($field->options) {
                                $validValues = array_column($field->options, 'value');
                                $fieldRules[] = Rule::in($validValues);
                            }
                            break;
                        case 'text':
                        case 'textarea':
                        default:
                            $fieldRules[] = 'string';
                            $fieldRules[] = 'max:1000';
                            break;
                    }

                    $rules[$fieldKey] = $fieldRules;
                }
            }
        }

        return $rules;
    }

    /**
     * Get custom error messages for validation.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $messages = [];

        if ($this->has('service_id')) {
            $service = Service::with('formFields')->find($this->service_id);
            if ($service && $service->formFields) {
                foreach ($service->formFields as $field) {
                    $fieldKey = "additional_data.{$field->name}";
                    $messages["{$fieldKey}.required"] = "Le champ {$field->label} est obligatoire.";
                    $messages["{$fieldKey}.in"] = "La valeur sélectionnée pour {$field->label} n'est pas valide.";
                }
            }
        }

        return $messages;
    }
}
