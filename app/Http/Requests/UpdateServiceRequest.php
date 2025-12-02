<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Decode JSON strings for complex arrays when using FormData
        if ($this->has('form_fields') && is_string($this->input('form_fields'))) {
            $decoded = json_decode($this->input('form_fields'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['form_fields' => $decoded]);
            }
        }

        if ($this->has('sub_services') && is_string($this->input('sub_services'))) {
            $decoded = json_decode($this->input('sub_services'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['sub_services' => $decoded]);
            }
        }

        if ($this->has('required_documents') && is_string($this->input('required_documents'))) {
            $decoded = json_decode($this->input('required_documents'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['required_documents' => $decoded]);
            }
        }

        if ($this->has('processing_times') && is_string($this->input('processing_times'))) {
            $decoded = json_decode($this->input('processing_times'), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['processing_times' => $decoded]);
            }
        }

        // Handle destinations - use all() to get raw FormData value
        $all = $this->all();
        $destinationsInput = $all['destinations'] ?? null;

        Log::info('UpdateServiceRequest prepareForValidation - destinations', [
            'has' => $this->has('destinations'),
            'input' => $destinationsInput,
            'type' => gettype($destinationsInput),
        ]);

        if ($destinationsInput !== null) {
            if (is_string($destinationsInput) && $destinationsInput !== '') {
                $decoded = json_decode($destinationsInput, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $this->merge(['destinations' => $decoded]);
                    Log::info('UpdateServiceRequest - decoded destinations successfully', [
                        'count' => count($decoded),
                        'destinations' => $decoded,
                    ]);
                } else {
                    // Log error for debugging
                    Log::warning('Failed to decode destinations in UpdateServiceRequest', [
                        'error' => json_last_error_msg(),
                        'input' => $destinationsInput,
                        'json_error' => json_last_error(),
                    ]);
                }
            } elseif (is_array($destinationsInput)) {
                // Already an array, no need to decode
                $this->merge(['destinations' => $destinationsInput]);
                Log::info('UpdateServiceRequest - destinations already array', [
                    'count' => count($destinationsInput),
                ]);
            } else {
                Log::warning('UpdateServiceRequest - destinations is neither string nor array', [
                    'type' => gettype($destinationsInput),
                    'value' => $destinationsInput,
                ]);
            }
        } else {
            Log::info('UpdateServiceRequest - no destinations input');
        }
    }

    public function rules(): array
    {
        $serviceId = $this->route('service')->id ?? null;

        return [
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('services', 'slug')->ignore($serviceId)],
            'description' => ['sometimes', 'nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:4096'],
            // Les images de galerie sont validées dans le contrôleur car elles utilisent une syntaxe dynamique
            'gallery_images_keep' => ['sometimes', 'string'],
            'gallery_images_orders' => ['sometimes', 'string'],
            'video_path' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'media_type' => ['sometimes', 'nullable', 'in:image,video'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'show_price' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'requires_appointment' => ['sometimes', 'boolean'],
            'appointment_pricing_mode' => ['sometimes', 'nullable', 'in:service_plus_appointment,appointment_only'],
            'sub_services' => ['sometimes', 'array'],
            'sub_services.*.name' => ['required_with:sub_services', 'string', 'max:255'],
            'sub_services.*.slug' => ['required_with:sub_services', 'string', 'max:255'],
            'sub_services.*.description' => ['nullable', 'string'],
            'sub_services.*.price' => ['required_with:sub_services', 'numeric', 'min:0'],
            'sub_services.*.is_active' => ['boolean'],
            'required_documents' => ['sometimes', 'array'],
            'required_documents.*.name' => ['required_with:required_documents', 'string', 'max:255'],
            'required_documents.*.description' => ['nullable', 'string'],
            'required_documents.*.is_required' => ['boolean'],
            'required_documents.*.order' => ['nullable', 'integer', 'min:0'],
            'processing_times' => ['sometimes', 'array'],
            'processing_times.*.duration_label' => ['required_with:processing_times', 'string', 'max:255'],
            'processing_times.*.duration_hours' => ['required_with:processing_times', 'integer', 'min:0'],
            'processing_times.*.price_multiplier' => ['required_with:processing_times', 'numeric', 'min:0'],
            'form_fields' => ['sometimes', 'array'],
            'form_fields.*.name' => ['required_with:form_fields', 'string', 'max:255'],
            'form_fields.*.label' => ['required_with:form_fields', 'string', 'max:255'],
            'form_fields.*.type' => ['required_with:form_fields', 'in:text,textarea,number,date,select'],
            'form_fields.*.placeholder' => ['nullable', 'string', 'max:500'],
            'form_fields.*.is_required' => ['boolean'],
            'form_fields.*.helper_text' => ['nullable', 'string', 'max:1000'],
            'form_fields.*.options' => ['nullable', 'array'],
            'form_fields.*.options.*.value' => ['required_with:form_fields.*.options', 'string', 'max:255'],
            'form_fields.*.options.*.label' => ['required_with:form_fields.*.options', 'string', 'max:255'],
            'form_fields.*.is_active' => ['boolean'],
            'destinations' => ['sometimes', 'array'],
            'destinations.*.id' => ['required_with:destinations', 'integer', 'exists:destinations,id'],
            'destinations.*.price_override' => ['nullable', 'numeric', 'min:0'],
            'destinations.*.is_active' => ['boolean'],
        ];
    }
}
