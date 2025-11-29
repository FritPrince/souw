<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Service;
use App\Models\ServiceFormField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Services/Index', [
            'services' => Service::with('category')->latest()->paginate(15),
            'categories' => Category::all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Services/Create', [
            'categories' => Category::where('is_active', true)->orderBy('order')->get(),
            'destinations' => Destination::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        $service = Service::create($data);

        // Handle sub-services
        if ($request->has('sub_services')) {
            $subServices = $request->input('sub_services', []);
            if (is_string($subServices)) {
                $subServices = json_decode($subServices, true) ?? [];
            }
            if (is_array($subServices)) {
                foreach ($subServices as $subServiceData) {
                    if (! empty($subServiceData['name'])) {
                        $service->subServices()->create($subServiceData);
                    }
                }
            }
        }

        // Handle required documents
        if ($request->has('required_documents')) {
            $requiredDocuments = $request->input('required_documents', []);
            if (is_string($requiredDocuments)) {
                $requiredDocuments = json_decode($requiredDocuments, true) ?? [];
            }
            if (is_array($requiredDocuments)) {
                foreach ($requiredDocuments as $docData) {
                    if (! empty($docData['name'])) {
                        $service->requiredDocuments()->create($docData);
                    }
                }
            }
        }

        // Handle processing times
        if ($request->has('processing_times')) {
            $processingTimes = $request->input('processing_times', []);
            if (is_string($processingTimes)) {
                $processingTimes = json_decode($processingTimes, true) ?? [];
            }
            if (is_array($processingTimes)) {
                foreach ($processingTimes as $timeData) {
                    if (! empty($timeData['duration_label'])) {
                        $service->processingTimes()->create($timeData);
                    }
                }
            }
        }

        // Handle form fields
        if ($request->has('form_fields')) {
            $formFields = $request->input('form_fields', []);

            // Handle JSON string from FormData
            if (is_string($formFields)) {
                $formFields = json_decode($formFields, true) ?? [];
            }

            if (is_array($formFields) && count($formFields) > 0) {
                foreach ($formFields as $index => $fieldData) {
                    // Skip empty fields
                    if (empty($fieldData['name']) || empty($fieldData['label'])) {
                        continue;
                    }

                    // Process options for select fields
                    $options = null;
                    if (isset($fieldData['options']) && is_array($fieldData['options']) && count($fieldData['options']) > 0) {
                        // Filter out empty options
                        $validOptions = array_filter($fieldData['options'], function ($option) {
                            return ! empty($option['value']) && ! empty($option['label']);
                        });
                        if (count($validOptions) > 0) {
                            $options = array_values($validOptions);
                        }
                    }

                    try {
                        $service->formFields()->create([
                            'name' => trim($fieldData['name']),
                            'label' => trim($fieldData['label']),
                            'type' => $fieldData['type'] ?? 'text',
                            'placeholder' => ! empty($fieldData['placeholder']) ? trim($fieldData['placeholder']) : null,
                            'is_required' => isset($fieldData['is_required']) ? (bool) $fieldData['is_required'] : false,
                            'helper_text' => ! empty($fieldData['helper_text']) ? trim($fieldData['helper_text']) : null,
                            'options' => $options,
                            'is_active' => isset($fieldData['is_active']) ? (bool) $fieldData['is_active'] : true,
                            'display_order' => $index + 1,
                        ]);
                    } catch (\Exception $e) {
                        // Log error but continue with other fields
                        Log::error('Error creating form field: '.$e->getMessage(), [
                            'service_id' => $service->id,
                            'field_data' => $fieldData,
                        ]);
                    }
                }
            }
        }

        // Handle destinations - always process even if empty array
        Log::info('=== STORE DESTINATIONS DEBUG ===');
        Log::info('Service ID:', ['service_id' => $service->id]);
        Log::info('Request has destinations:', ['has' => $request->has('destinations')]);
        Log::info('All request keys:', ['keys' => array_keys($request->all())]);
        Log::info('Validated keys:', ['keys' => array_keys($request->validated())]);

        // Try to get from validated data first (already decoded by FormRequest)
        $validated = $request->validated();
        $destinations = $validated['destinations'] ?? $request->input('destinations', []);

        Log::info('Raw destinations:', ['destinations' => $destinations, 'type' => gettype($destinations)]);

        // If still a string, decode it (fallback if FormRequest didn't decode)
        if (is_string($destinations)) {
            Log::info('Destinations is string, decoding...', ['raw' => $destinations]);
            $decoded = json_decode($destinations, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $destinations = $decoded;
                Log::info('Decoded destinations successfully:', ['destinations' => $destinations]);
            } else {
                Log::error('Failed to decode destinations JSON', ['error' => json_last_error_msg()]);
                $destinations = [];
            }
        }

        if (is_array($destinations)) {
            Log::info('Destinations is array, processing...', ['count' => count($destinations)]);
            $syncData = [];
            foreach ($destinations as $index => $destData) {
                Log::info('Processing destination:', ['index' => $index, 'destData' => $destData, 'keys' => array_keys($destData ?? [])]);

                // Check if id exists and is valid
                if (! isset($destData['id'])) {
                    Log::warning('Destination data missing id:', ['destData' => $destData, 'index' => $index]);

                    continue;
                }

                $destId = $destData['id'];

                // Convert to integer if it's a string
                if (is_string($destId)) {
                    $destId = (int) $destId;
                }

                if (empty($destId) || $destId <= 0) {
                    Log::warning('Destination id is invalid:', ['id' => $destId, 'destData' => $destData]);

                    continue;
                }

                // Verify destination exists
                if (! \App\Models\Destination::where('id', $destId)->exists()) {
                    Log::warning('Destination does not exist:', ['id' => $destId]);

                    continue;
                }

                $syncData[$destId] = [
                    'price_override' => isset($destData['price_override']) && $destData['price_override'] !== '' && $destData['price_override'] !== null ? (float) $destData['price_override'] : null,
                    'is_active' => isset($destData['is_active']) ? (bool) $destData['is_active'] : true,
                ];
                Log::info('Added destination to sync data:', ['id' => $destId, 'data' => $syncData[$destId]]);
            }
            Log::info('Sync data prepared:', ['syncData' => $syncData, 'count' => count($syncData)]);

            try {
                $service->destinations()->sync($syncData);
                Log::info('Destinations synced successfully', ['service_id' => $service->id, 'synced_count' => count($syncData)]);

                // Verify sync worked
                $syncedDestinations = $service->destinations()->count();
                Log::info('Verification - synced destinations count:', ['count' => $syncedDestinations]);
            } catch (\Exception $e) {
                Log::error('Error syncing destinations:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'service_id' => $service->id,
                    'sync_data' => $syncData,
                ]);
            }
        } else {
            Log::warning('Destinations is not an array after processing', ['type' => gettype($destinations), 'value' => $destinations]);
        }

        return redirect()->route('admin.services.index')
            ->with('success', 'Service créé avec succès.');
    }

    public function edit(Service $service): Response
    {
        $service->load([
            'category',
            'subServices',
            'requiredDocuments',
            'processingTimes',
            'destinations',
        ]);

        // Load form fields without the is_active filter for admin editing
        $formFields = ServiceFormField::where('service_id', $service->id)->orderBy('display_order')->get();
        $service->setRelation('formFields', $formFields);

        // Convert service to array and explicitly add formFields to ensure they're serialized
        $serviceArray = $service->toArray();
        $serviceArray['formFields'] = $formFields->toArray();

        return Inertia::render('Admin/Services/Edit', [
            'service' => $serviceArray,
            'categories' => Category::where('is_active', true)->orderBy('order')->get(),
            'destinations' => Destination::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): Response
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if (! empty($service->image_path)) {
                $old = str_replace('/storage/', '', $service->image_path);
                if (Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $path = $request->file('image')->store('services', 'public');
            $data['image_path'] = '/storage/'.$path;
        }

        unset($data['image']);

        // Only update fields that are present in validated data
        if (! empty($data)) {
            $service->update($data);
        }

        // Handle sub-services (delete all and recreate)
        if ($request->has('sub_services')) {
            $subServices = $request->input('sub_services', []);
            // Handle JSON string from FormData
            if (is_string($subServices)) {
                $subServices = json_decode($subServices, true) ?? [];
            }
            $service->subServices()->delete();
            if (is_array($subServices)) {
                foreach ($subServices as $subServiceData) {
                    if (! empty($subServiceData['name'])) {
                        $service->subServices()->create($subServiceData);
                    }
                }
            }
        }

        // Handle required documents (delete all and recreate)
        if ($request->has('required_documents')) {
            $requiredDocuments = $request->input('required_documents', []);
            // Handle JSON string from FormData
            if (is_string($requiredDocuments)) {
                $requiredDocuments = json_decode($requiredDocuments, true) ?? [];
            }
            $service->requiredDocuments()->delete();
            if (is_array($requiredDocuments)) {
                foreach ($requiredDocuments as $docData) {
                    if (! empty($docData['name'])) {
                        $service->requiredDocuments()->create($docData);
                    }
                }
            }
        }

        // Handle processing times (delete all and recreate)
        if ($request->has('processing_times')) {
            $processingTimes = $request->input('processing_times', []);
            // Handle JSON string from FormData
            if (is_string($processingTimes)) {
                $processingTimes = json_decode($processingTimes, true) ?? [];
            }
            $service->processingTimes()->delete();
            if (is_array($processingTimes)) {
                foreach ($processingTimes as $timeData) {
                    if (! empty($timeData['duration_label'])) {
                        $service->processingTimes()->create($timeData);
                    }
                }
            }
        }

        // Handle form fields (delete all and recreate)
        // Use validated data which should already be decoded by FormRequest
        $formFields = $request->input('form_fields', []);

        if ($request->has('form_fields')) {
            // Only delete if we have form_fields data
            ServiceFormField::where('service_id', $service->id)->delete();

            if (is_array($formFields) && count($formFields) > 0) {
                foreach ($formFields as $index => $fieldData) {
                    // Skip empty fields
                    if (empty($fieldData['name']) || empty($fieldData['label'])) {
                        continue;
                    }

                    // Process options for select fields
                    $options = null;
                    if (isset($fieldData['options']) && is_array($fieldData['options']) && count($fieldData['options']) > 0) {
                        // Filter out empty options
                        $validOptions = array_filter($fieldData['options'], function ($option) {
                            return ! empty($option['value']) && ! empty($option['label']);
                        });
                        if (count($validOptions) > 0) {
                            $options = array_values($validOptions);
                        }
                    }

                    try {
                        ServiceFormField::create([
                            'service_id' => $service->id,
                            'name' => trim($fieldData['name']),
                            'label' => trim($fieldData['label']),
                            'type' => $fieldData['type'] ?? 'text',
                            'placeholder' => ! empty($fieldData['placeholder']) ? trim($fieldData['placeholder']) : null,
                            'is_required' => isset($fieldData['is_required']) ? (bool) $fieldData['is_required'] : false,
                            'helper_text' => ! empty($fieldData['helper_text']) ? trim($fieldData['helper_text']) : null,
                            'options' => $options,
                            'is_active' => isset($fieldData['is_active']) ? (bool) $fieldData['is_active'] : true,
                            'display_order' => $index + 1,
                        ]);
                    } catch (\Exception $e) {
                        // Log error but continue with other fields
                        Log::error('Error creating form field: '.$e->getMessage(), [
                            'service_id' => $service->id,
                            'field_data' => $fieldData,
                        ]);
                    }
                }
            }
        }

        // Handle destinations - always process even if empty array
        Log::info('=== UPDATE DESTINATIONS DEBUG ===');
        Log::info('Service ID:', ['service_id' => $service->id]);
        Log::info('Request has destinations:', ['has' => $request->has('destinations')]);
        Log::info('All request keys:', ['keys' => array_keys($request->all())]);

        $validated = $request->validated();
        Log::info('Validated keys:', ['keys' => array_keys($validated)]);
        Log::info('Validated destinations:', ['destinations' => $validated['destinations'] ?? 'NOT SET', 'type' => isset($validated['destinations']) ? gettype($validated['destinations']) : 'N/A']);

        $destinations = $validated['destinations'] ?? $request->input('destinations', []);
        Log::info('Raw destinations from input:', ['destinations' => $destinations, 'type' => gettype($destinations)]);

        // If still a string, decode it (fallback if FormRequest didn't decode)
        if (is_string($destinations)) {
            Log::info('Destinations is string, decoding...', ['raw' => $destinations]);
            $decoded = json_decode($destinations, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $destinations = $decoded;
                Log::info('Decoded destinations successfully:', ['destinations' => $destinations]);
            } else {
                Log::error('Failed to decode destinations JSON in update', ['error' => json_last_error_msg(), 'raw' => $destinations]);
                $destinations = [];
            }
        }

        if (is_array($destinations)) {
            Log::info('Destinations is array, processing...', ['count' => count($destinations)]);
            $syncData = [];
            foreach ($destinations as $index => $destData) {
                Log::info('Processing destination:', ['index' => $index, 'destData' => $destData, 'keys' => array_keys($destData ?? [])]);

                // Check if id exists and is valid
                if (! isset($destData['id'])) {
                    Log::warning('Destination data missing id in update:', ['destData' => $destData, 'index' => $index]);

                    continue;
                }

                $destId = $destData['id'];

                // Convert to integer if it's a string
                if (is_string($destId)) {
                    $destId = (int) $destId;
                }

                if (empty($destId) || $destId <= 0) {
                    Log::warning('Destination id is invalid in update:', ['id' => $destId, 'destData' => $destData]);

                    continue;
                }

                // Verify destination exists
                if (! \App\Models\Destination::where('id', $destId)->exists()) {
                    Log::warning('Destination does not exist in update:', ['id' => $destId]);

                    continue;
                }

                $syncData[$destId] = [
                    'price_override' => isset($destData['price_override']) && $destData['price_override'] !== '' && $destData['price_override'] !== null ? (float) $destData['price_override'] : null,
                    'is_active' => isset($destData['is_active']) ? (bool) $destData['is_active'] : true,
                ];
                Log::info('Added destination to sync data:', ['id' => $destId, 'data' => $syncData[$destId]]);
            }
            Log::info('Sync data prepared:', ['syncData' => $syncData, 'count' => count($syncData)]);

            try {
                $service->destinations()->sync($syncData);
                Log::info('Destinations synced successfully in update', ['service_id' => $service->id, 'synced_count' => count($syncData)]);

                // Get and log the synced destinations
                $syncedDestinations = $service->destinations()->with('pivot')->get();
                Log::info('Synced destinations:', [
                    'count' => $syncedDestinations->count(),
                    'destinations' => $syncedDestinations->map(function ($dest) {
                        return [
                            'id' => $dest->id,
                            'name' => $dest->name,
                            'price_override' => $dest->pivot->price_override,
                            'is_active' => $dest->pivot->is_active,
                        ];
                    })->toArray(),
                ]);
            } catch (\Exception $e) {
                Log::error('Error syncing destinations in update:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'service_id' => $service->id,
                    'sync_data' => $syncData,
                ]);
            }
        } else {
            Log::warning('Destinations is not an array after processing', ['type' => gettype($destinations), 'value' => $destinations]);
        }

        // Reload the service with all relations including formFields before redirecting
        $service->refresh();

        // Verify fields were created
        $allFields = ServiceFormField::where('service_id', $service->id)->orderBy('display_order')->get();

        $service->load([
            'category',
            'subServices',
            'requiredDocuments',
            'processingTimes',
            'destinations',
        ]);
        $service->setRelation('formFields', $allFields);

        // Convert service to array and explicitly add formFields
        $serviceArray = $service->toArray();
        $serviceArray['formFields'] = $allFields->toArray();

        // Use Inertia::render instead of redirect to ensure formFields are included
        return Inertia::render('Admin/Services/Edit', [
            'service' => $serviceArray,
            'categories' => Category::where('is_active', true)->orderBy('order')->get(),
        ])->with([
            'success' => 'Service mis à jour avec succès.',
        ]);
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'Service supprimé avec succès.');
    }

    public function clear(): RedirectResponse
    {
        Service::query()->delete();

        return redirect()->route('admin.services.index')
            ->with('success', 'Tous les services ont été supprimés.');
    }

    public function toggleStatus(Service $service): RedirectResponse
    {
        $service->update(['is_active' => ! $service->is_active]);

        return back()->with('success', 'Statut du service mis à jour.');
    }
}
