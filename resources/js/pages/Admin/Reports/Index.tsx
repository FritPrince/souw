import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Package,
    Download,
    Calendar,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';

interface RevenueData {
    period: string;
    revenue: number;
    count: number;
}

interface OrdersData {
    period: string;
    count: number;
    total: number;
}

interface RevenueByService {
    name: string;
    revenue: number;
    count: number;
}

interface RevenueByPaymentStatus {
    payment_status: string;
    total: number;
    count: number;
}

interface Props {
    revenueData: RevenueData[];
    ordersData: OrdersData[];
    stats: {
        total_revenue: number;
        total_orders: number;
        completed_orders: number;
        pending_orders: number;
        average_order_value: number;
    };
    revenueByService: RevenueByService[];
    revenueByPaymentStatus: RevenueByPaymentStatus[];
    filters: {
        period: string;
        start_date?: string;
        end_date?: string;
    };
}

const COLORS = ['#00508b', '#f9d121', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b'];

export default function ReportsIndex({
    revenueData,
    ordersData,
    stats,
    revenueByService,
    revenueByPaymentStatus,
    filters,
}: Props) {
    const [period, setPeriod] = useState(filters.period);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        router.get('/admin/reports', { period: value }, { preserveState: true });
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        router.get(`/admin/reports/export/${type}`, { period });
    };

    // Préparer les données pour le graphique combiné
    const chartData = revenueData.map((revenue, index) => {
        const order = ordersData[index] || { count: 0, total: 0 };
        return {
            period: revenue.period,
            revenue: revenue.revenue,
            orders: order.count,
        };
    });

    // Données pour le graphique en camembert des services
    const pieData = revenueByService.map((item) => ({
        name: item.name,
        value: item.revenue,
    }));

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Rapports', href: '/admin/reports' }]}>
            <div className="p-4 md:p-6 space-y-6">
                <Head title="Rapports - Admin" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Rapports et Statistiques</h1>
                        <p className="text-muted-foreground mt-1">Analyse détaillée de votre activité</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('excel')}
                            className="gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('pdf')}
                            className="gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Filtres */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Période
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-full sm:w-[250px]">
                                <SelectValue placeholder="Sélectionner une période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">Aujourd'hui</SelectItem>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois</SelectItem>
                                <SelectItem value="year">Cette année</SelectItem>
                                <SelectItem value="last_month">Mois dernier</SelectItem>
                                <SelectItem value="last_year">Année dernière</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Statistiques principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-2 hover:border-green-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(stats.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Revenus générés</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total commandes</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-blue-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes complétées</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Package className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.completed_orders}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Complétées</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-orange-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.pending_orders}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">En attente</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-purple-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(stats.average_order_value || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Par commande</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphique des revenus et commandes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Évolution des revenus et commandes</CardTitle>
                        <CardDescription>Revenus et nombre de commandes sur la période sélectionnée</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        if (name === 'revenue') {
                                            return [formatCurrency(value), 'Revenus'];
                                        }
                                        return [value, 'Commandes'];
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    name="Revenus"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#00508b"
                                    strokeWidth={2}
                                    name="Commandes"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenus par service */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenus par service</CardTitle>
                            <CardDescription>Top 10 des services générant le plus de revenus</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {revenueByService.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Aucune donnée disponible
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenus par statut de paiement */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenus par statut de paiement</CardTitle>
                            <CardDescription>Répartition des paiements par statut</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {revenueByPaymentStatus.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueByPaymentStatus}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="payment_status" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#00508b" name="Revenus" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Aucune donnée disponible
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tableau détaillé des services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Détail des revenus par service</CardTitle>
                        <CardDescription>Liste complète des services avec leurs revenus</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                                            Service
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                                            Revenus
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                                            Commandes
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                                            Moyenne
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueByService.length > 0 ? (
                                        revenueByService.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium">{item.name}</td>
                                                <td className="py-4 px-4 text-sm font-semibold">
                                                    {formatCurrency(item.revenue)}
                                                </td>
                                                <td className="py-4 px-4 text-sm">
                                                    <Badge variant="secondary">{item.count}</Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {formatCurrency(item.revenue / item.count)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-muted-foreground">
                                                Aucune donnée disponible
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}








