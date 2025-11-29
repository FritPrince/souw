<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UploadDocumentsRequest;
use App\Models\Order;
use App\Models\OrderDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['service', 'subService', 'destination', 'payment'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $service = \App\Models\Service::findOrFail($request->service_id);
        $totalAmount = $service->price;

        // Calcul du prix selon la destination si spécifiée
        if ($request->destination_id) {
            $destinationPrice = $service->destinations()
                ->where('destinations.id', $request->destination_id)
                ->first()?->pivot->price_override;

            if ($destinationPrice) {
                $totalAmount = $destinationPrice;
            }
        }

        // Calcul du prix selon le sous-service si spécifié
        if ($request->sub_service_id) {
            $subService = \App\Models\SubService::findOrFail($request->sub_service_id);
            $totalAmount = $subService->price;
        }

        // Calcul du prix selon le délai de traitement si spécifié
        if ($request->processing_time_id) {
            $processingTime = \App\Models\ServiceProcessingTime::findOrFail($request->processing_time_id);
            $totalAmount *= $processingTime->price_multiplier;
        }

        // Log additional_data for debugging
        Log::info('Creating order with additional_data', [
            'additional_data' => $request->additional_data,
            'additional_data_type' => gettype($request->additional_data),
            'service_id' => $request->service_id,
        ]);

        $order = Order::create([
            'user_id' => Auth::id(),
            'service_id' => $request->service_id,
            'sub_service_id' => $request->sub_service_id,
            'destination_id' => $request->destination_id,
            'order_number' => 'ORD-'.Str::upper(Str::random(8)),
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'payment_status' => 'pending',
            'notes' => $request->notes,
            'additional_data' => $request->additional_data ?? [],
        ]);

        // Log created order to verify additional_data was saved
        Log::info('Order created', [
            'order_id' => $order->id,
            'additional_data' => $order->additional_data,
            'additional_data_type' => gettype($order->additional_data),
        ]);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Commande créée avec succès. Veuillez procéder au paiement.');
    }

    public function show(Order $order): Response
    {
        // Vérifier que l'utilisateur peut accéder à cette commande
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load([
            'service.category',
            'subService',
            'destination',
            'items',
            'documents',
            'appointment.appointmentSlot',
            'payment',
        ]);

        // Load form fields for the service to display labels for additional_data
        $formFields = [];
        if ($order->service_id) {
            $formFields = \App\Models\ServiceFormField::where('service_id', $order->service_id)
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get()
                ->toArray();
        }

        // Log for debugging
        Log::info('Loading order details', [
            'order_id' => $order->id,
            'additional_data' => $order->additional_data,
            'additional_data_type' => gettype($order->additional_data),
            'additional_data_keys' => is_array($order->additional_data) ? array_keys($order->additional_data) : [],
            'form_fields_count' => count($formFields),
        ]);

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'formFields' => $formFields,
        ]);
    }

    public function uploadDocuments(UploadDocumentsRequest $request, Order $order): RedirectResponse
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        foreach ($request->file('documents') as $file) {
            $path = $file->store('orders/documents', 'public');

            $order->documents()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'uploaded_at' => now(),
            ]);
        }

        return back()->with('success', 'Documents uploadés avec succès.');
    }

    public function cancel(Order $order): RedirectResponse
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if (! in_array($order->status, ['pending', 'paid'])) {
            return back()->with('error', 'Cette commande ne peut pas être annulée.');
        }

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Commande annulée avec succès.');
    }

    public function downloadDocument(Order $order, OrderDocument $document): BinaryFileResponse
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($document->order_id !== $order->id) {
            abort(404);
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($document->file_path)) {
            abort(404);
        }

        $path = $disk->path($document->file_path);

        return response()->download($path, $document->file_name);
    }
}
