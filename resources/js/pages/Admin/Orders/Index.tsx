import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Service {
    id: number;
    name: string;
}

interface Destination {
    id: number;
    name: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    user?: User;
    service?: Service;
    destination?: Destination;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    orders: Paginated<Order>;
    filters?: { status?: string; payment_status?: string; search?: string };
}

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

export default function Index({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters?.payment_status || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (selectedStatus) {
            params.append('status', selectedStatus);
        }
        if (selectedPaymentStatus) {
            params.append('payment_status', selectedPaymentStatus);
        }
        router.get('/admin/orders', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        setSelectedPaymentStatus('');
        router.get('/admin/orders', {}, { preserveState: true, preserveScroll: true });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            processing: 'bg-blue-50 text-blue-700 border border-blue-200',
            completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            failed: 'bg-red-50 text-red-700 border border-red-200',
            refunded: 'bg-gray-50 text-gray-700 border border-gray-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Commandes', href: '/admin/orders' }]}>
            <div className="p-6 space-y-6">
                <Head title="Commandes - Admin" />
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
                        <p className="mt-1 text-sm text-gray-500">Gérez toutes les commandes de votre plateforme</p>
                    </div>
                </div>

                {/* Filtres améliorés */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className="las la-search mr-1"></i>
                                Recherche
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                placeholder="N° commande, nom, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className="las la-tasks mr-1"></i>
                                Statut
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                {ORDER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'pending'
                                            ? 'En attente'
                                            : status === 'processing'
                                                ? 'En traitement'
                                                : status === 'completed'
                                                    ? 'Terminée'
                                                    : 'Annulée'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className="las la-credit-card mr-1"></i>
                                Paiement
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                {PAYMENT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'pending'
                                            ? 'En attente'
                                            : status === 'completed'
                                                ? 'Payé'
                                                : status === 'failed'
                                                    ? 'Échoué'
                                                    : 'Remboursé'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1 flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-95 font-medium text-sm transition-all shadow-sm hover:shadow-md"
                            >
                                <i className="las la-filter mr-1"></i>
                                Filtrer
                            </button>
                            {(search || selectedStatus || selectedPaymentStatus) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all"
                                >
                                    <i className="las la-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tableau amélioré */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-hashtag text-gray-400"></i>
                                            Commande
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-user text-gray-400"></i>
                                            Client
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-concierge-bell text-gray-400"></i>
                                            Service
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-map-marker-alt text-gray-400"></i>
                                            Destination
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-money-bill-wave text-gray-400"></i>
                                            Montant
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-info-circle text-gray-400"></i>
                                            Statut
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-credit-card text-gray-400"></i>
                                            Paiement
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <i className="las la-calendar text-gray-400"></i>
                                            Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <i className="las la-inbox text-4xl text-gray-300 mb-3"></i>
                                                <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
                                                <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50/50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold text-gray-900">{order.order_number}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">{order.user?.name || '-'}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{order.user?.email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">{order.service?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{order.destination?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'XOF',
                                                        minimumFractionDigits: 0,
                                                    }).format(order.total_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status === 'pending' && <i className="las la-clock"></i>}
                                                    {order.status === 'processing' && <i className="las la-sync-alt"></i>}
                                                    {order.status === 'completed' && <i className="las la-check-circle"></i>}
                                                    {order.status === 'cancelled' && <i className="las la-times-circle"></i>}
                                                    {order.status === 'pending'
                                                        ? 'En attente'
                                                        : order.status === 'processing'
                                                            ? 'En traitement'
                                                            : order.status === 'completed'
                                                                ? 'Terminée'
                                                                : 'Annulée'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}
                                                >
                                                    {order.payment_status === 'pending' && <i className="las la-hourglass-half"></i>}
                                                    {order.payment_status === 'completed' && <i className="las la-check-circle"></i>}
                                                    {order.payment_status === 'failed' && <i className="las la-exclamation-circle"></i>}
                                                    {order.payment_status === 'refunded' && <i className="las la-undo"></i>}
                                                    {order.payment_status === 'pending'
                                                        ? 'En attente'
                                                        : order.payment_status === 'completed'
                                                            ? 'Payé'
                                                            : order.payment_status === 'failed'
                                                                ? 'Échoué'
                                                                : 'Remboursé'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <i className="las la-calendar-alt text-gray-400"></i>
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[var(--primary)] bg-[var(--primary)]/10 rounded-lg hover:bg-[var(--primary)]/20 transition-all"
                                                >
                                                    <i className="las la-eye"></i>
                                                    <span>Voir</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination améliorée */}
                    {orders.links.length > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                            <nav className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">Page</span>
                                    <span className="mx-2">
                                        {orders.links
                                            .map((l, i) => (l.active ? i : null))
                                            .filter((i) => i !== null)[0] || 1}
                                    </span>
                                    <span>sur {orders.links.length - 2}</span>
                                </div>
                                <div className="inline-flex rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white">
                                    {orders.links.map((l, i) => {
                                        if (l.label === '...') {
                                            return (
                                                <span key={i} className="px-3 py-2 text-sm text-gray-500 bg-white">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={i}
                                                href={l.url || '#'}
                                                className={`px-4 py-2 text-sm font-medium transition-all ${
                                                    l.active
                                                        ? 'bg-[var(--primary)] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                } ${i === 0 ? 'border-r border-gray-200' : ''} ${i === orders.links.length - 1 ? '' : 'border-r border-gray-200'}`}
                                                dangerouslySetInnerHTML={{ __html: l.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}

