<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\OrderDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with(['service', 'user', 'destination']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%'.$request->search.'%')
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', '%'.$request->search.'%')
                            ->orWhere('email', 'like', '%'.$request->search.'%');
                    });
            });
        }

        $orders = $query->latest()->paginate(20);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'search']),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user',
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

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'formFields' => $formFields,
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $oldStatus = $order->status;

        $order->update([
            'status' => $request->status,
            'notes' => $request->notes ?? $order->notes,
        ]);

        // Envoyer la notification de changement de statut
        if ($oldStatus !== $request->status) {
            $order->user->notify(
                new \App\Notifications\OrderStatusUpdatedNotification($order, $oldStatus, $request->status)
            );
        }

        return back()->with('success', 'Statut de la commande mis à jour.');
    }

    public function addNote(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'notes' => ['required', 'string', 'max:1000'],
        ]);

        $order->update([
            'notes' => ($order->notes ? $order->notes."\n\n" : '').now()->format('Y-m-d H:i').': '.$request->notes,
        ]);

        return back()->with('success', 'Note ajoutée avec succès.');
    }

    public function downloadDocument(Order $order, OrderDocument $document): BinaryFileResponse
    {
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
