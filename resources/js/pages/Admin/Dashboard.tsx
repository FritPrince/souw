import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ShoppingCart, 
    TrendingUp, 
    Calendar, 
    DollarSign, 
    Package, 
    Clock,
    ArrowUpRight,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
    today: number;
    this_week: number;
    this_month: number;
    pending?: number;
}

interface TopService {
    service_id: number;
    count: number;
    service?: {
        id: number;
        name: string;
    };
}

interface Appointment {
    id: number;
    status: string;
    appointment_slot?: {
        date: string;
        start_time: string;
    };
    service?: {
        name: string;
    };
    user?: {
        name: string;
    };
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    service?: {
        name: string;
    };
    user?: {
        name: string;
    };
}

interface Props {
    stats: {
        orders: Stat;
        revenue: Stat;
    };
    topServices: TopService[];
    upcomingAppointments: Appointment[];
    recentOrders: Order[];
}

export default function Dashboard({ stats, topServices, upcomingAppointments, recentOrders }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Tableau de bord', href: '/admin/dashboard' }]}>
            <div className="p-4 md:p-6 space-y-6">
                <Head title="Tableau de bord - Admin" />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre activité</p>
                    </div>
                </div>

                {/* Statistiques principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes aujourd'hui</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.orders.today}</div>
                            <p className="text-xs text-muted-foreground mt-1">Commandes reçues</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes cette semaine</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.orders.this_week}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sur 7 jours</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes ce mois</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Package className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.orders.this_month}</div>
                            <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-2 hover:border-orange-500/50 transition-colors border-orange-200 dark:border-orange-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En attente</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.orders.pending || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Nécessitent une attention</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenus */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 hover:border-green-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenus aujourd'hui</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.revenue.today)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-green-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenus cette semaine</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.revenue.this_week)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sur 7 jours</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-green-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.revenue.this_month)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Ce mois-ci</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Services les plus demandés */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Services les plus demandés</CardTitle>
                                    <CardDescription>Top des services populaires</CardDescription>
                                </div>
                                <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {topServices.length > 0 ? (
                                <div className="space-y-4">
                                    {topServices.map((item, index) => (
                                        <div key={item.service_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold",
                                                    index === 0 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
                                                    index === 1 && "bg-gradient-to-br from-gray-300 to-gray-500 text-white",
                                                    index === 2 && "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
                                                    index > 2 && "bg-muted text-muted-foreground"
                                                )}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">
                                                        {item.service?.name || `Service #${item.service_id}`}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{item.count} commande{item.count > 1 ? 's' : ''}</div>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">Aucun service pour le moment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rendez-vous à venir */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Rendez-vous à venir</CardTitle>
                                    <CardDescription>Prochains créneaux réservés</CardDescription>
                                </div>
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors border border-border">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold mb-1">
                                                    {appointment.service?.name || 'Service'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                    <Users className="h-3 w-3" />
                                                    {appointment.user?.name || 'Client'}
                                                </div>
                                                {appointment.appointment_slot && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(appointment.appointment_slot.date)} à {appointment.appointment_slot.start_time}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="ml-2 shrink-0">
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">Aucun rendez-vous à venir</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Commandes récentes */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Commandes récentes</CardTitle>
                                <CardDescription>Dernières commandes reçues</CardDescription>
                            </div>
                            <Link 
                                href="/admin/orders" 
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                Voir tout
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Montant</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/admin/orders/${order.id}`)}
                                            >
                                                <td className="py-4 px-4 text-sm font-medium">#{order.id}</td>
                                                <td className="py-4 px-4 text-sm">{order.service?.name || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">{order.user?.name || '-'}</td>
                                                <td className="py-4 px-4 text-sm font-semibold">{formatCurrency(order.total_amount || 0)}</td>
                                                <td className="py-4 px-4">
                                                    <Badge 
                                                        variant={
                                                            order.status === 'completed' ? 'default' :
                                                            order.status === 'pending' ? 'secondary' :
                                                            'outline'
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center">
                                                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                                <p className="text-sm text-muted-foreground">Aucune commande récente</p>
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

