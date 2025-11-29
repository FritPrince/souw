<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->get('period', 'month'); // day, week, month, year
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Définir les dates selon la période
        if ($startDate && $endDate) {
            $start = \Carbon\Carbon::parse($startDate)->startOfDay();
            $end = \Carbon\Carbon::parse($endDate)->endOfDay();
        } else {
            [$start, $end] = $this->getPeriodDates($period);
        }

        // Revenus par période pour le graphique
        $revenueData = $this->getRevenueData($start, $end, $period);

        // Commandes par période
        $ordersData = $this->getOrdersData($start, $end, $period);

        // Statistiques globales
        $stats = [
            'total_revenue' => Payment::where('payment_status', 'completed')
                ->whereBetween('payment_date', [$start, $end])
                ->sum('amount'),
            'total_orders' => Order::whereBetween('created_at', [$start, $end])->count(),
            'completed_orders' => Order::where('status', 'completed')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'pending_orders' => Order::where('status', 'pending')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'average_order_value' => Order::whereBetween('created_at', [$start, $end])
                ->avg('total_amount'),
        ];

        // Revenus par service
        $revenueByService = Order::select('services.name', DB::raw('SUM(orders.total_amount) as revenue'), DB::raw('COUNT(*) as count'))
            ->join('services', 'orders.service_id', '=', 'services.id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.payment_status', 'completed')
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        // Revenus par statut de paiement
        $revenueByPaymentStatus = Payment::select('payment_status', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->whereBetween('payment_date', [$start, $end])
            ->groupBy('payment_status')
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'revenueData' => $revenueData,
            'ordersData' => $ordersData,
            'stats' => $stats,
            'revenueByService' => $revenueByService,
            'revenueByPaymentStatus' => $revenueByPaymentStatus,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function getPeriodDates(string $period): array
    {
        switch ($period) {
            case 'day':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'week':
                return [now()->startOfWeek(), now()->endOfWeek()];
            case 'month':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'year':
                return [now()->startOfYear(), now()->endOfYear()];
            case 'last_month':
                return [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()];
            case 'last_year':
                return [now()->subYear()->startOfYear(), now()->subYear()->endOfYear()];
            default:
                return [now()->startOfMonth(), now()->endOfMonth()];
        }
    }

    private function getRevenueData($start, $end, string $period): array
    {
        $format = match ($period) {
            'day' => '%Y-%m-%d %H:00',
            'week', 'month' => '%Y-%m-%d',
            'year' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $data = Payment::select(
            DB::raw("DATE_FORMAT(payment_date, '{$format}') as period"),
            DB::raw('SUM(amount) as revenue'),
            DB::raw('COUNT(*) as count')
        )
            ->where('payment_status', 'completed')
            ->whereBetween('payment_date', [$start, $end])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $data->map(function ($item) {
            return [
                'period' => $item->period,
                'revenue' => (float) $item->revenue,
                'count' => (int) $item->count,
            ];
        })->toArray();
    }

    private function getOrdersData($start, $end, string $period): array
    {
        $format = match ($period) {
            'day' => '%Y-%m-%d %H:00',
            'week', 'month' => '%Y-%m-%d',
            'year' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $data = Order::select(
            DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(total_amount) as total')
        )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $data->map(function ($item) {
            return [
                'period' => $item->period,
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ];
        })->toArray();
    }

    public function exportExcel(Request $request)
    {
        // Pour l'instant, on retourne un message
        // L'implémentation complète nécessiterait maatwebsite/excel
        return back()->with('info', 'Export Excel à implémenter avec maatwebsite/excel');
    }

    public function exportPdf(Request $request)
    {
        // Pour l'instant, on retourne un message
        // L'implémentation complète nécessiterait dompdf ou barryvdh/laravel-dompdf
        return back()->with('info', 'Export PDF à implémenter avec dompdf');
    }
}
