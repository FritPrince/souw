<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();
        $monthStart = now()->startOfMonth();

        // Statistiques commandes
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $ordersThisWeek = Order::where('created_at', '>=', $weekStart)->count();
        $ordersThisMonth = Order::where('created_at', '>=', $monthStart)->count();
        $pendingOrders = Order::where('status', 'pending')->count();

        // Revenus
        $revenueToday = Payment::where('payment_status', 'completed')
            ->whereDate('payment_date', $today)
            ->sum('amount');
        $revenueThisWeek = Payment::where('payment_status', 'completed')
            ->where('payment_date', '>=', $weekStart)
            ->sum('amount');
        $revenueThisMonth = Payment::where('payment_status', 'completed')
            ->where('payment_date', '>=', $monthStart)
            ->sum('amount');

        // Services les plus demandés
        $topServices = Order::selectRaw('service_id, COUNT(*) as count')
            ->where('created_at', '>=', $monthStart)
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->limit(5)
            ->with('service')
            ->get();

        // Rendez-vous à venir
        $upcomingAppointments = Appointment::where('status', 'scheduled')
            ->whereHas('appointmentSlot', function ($q) {
                $q->where('date', '>=', now()->toDateString());
            })
            ->with(['appointmentSlot', 'service', 'user'])
            ->orderBy('created_at')
            ->limit(10)
            ->get();

        // Commandes récentes
        $recentOrders = Order::with(['service', 'user'])
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'orders' => [
                    'today' => $ordersToday,
                    'this_week' => $ordersThisWeek,
                    'this_month' => $ordersThisMonth,
                    'pending' => $pendingOrders,
                ],
                'revenue' => [
                    'today' => $revenueToday,
                    'this_week' => $revenueThisWeek,
                    'this_month' => $revenueThisMonth,
                ],
            ],
            'topServices' => $topServices,
            'upcomingAppointments' => $upcomingAppointments,
            'recentOrders' => $recentOrders,
        ]);
    }
}
