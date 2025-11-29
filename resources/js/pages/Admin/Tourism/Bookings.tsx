import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface User {
    id: number;
    name: string;
    email: string;
}

interface TourismPackage {
    id: number;
    name: string;
}

interface TourismBooking {
    id: number;
    start_date: string;
    end_date: string;
    number_of_people: number;
    total_amount: number;
    status: string;
    created_at: string;
    user?: User;
    tourism_package?: TourismPackage;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    bookings: Paginated<TourismBooking>;
    filters?: { status?: string; search?: string };
}

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function Bookings({ bookings, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [statusUpdates, setStatusUpdates] = useState<Record<number, string>>({});
    const [bookingToDelete, setBookingToDelete] = useState<TourismBooking | null>(null);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (selectedStatus) {
            params.append('status', selectedStatus);
        }
        router.get('/admin/tourism/bookings', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        router.get('/admin/tourism/bookings', {}, { preserveState: true, preserveScroll: true });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-blue-100 text-blue-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const handleStatusChange = (bookingId: number, value: string) => {
        setStatusUpdates((prev) => ({
            ...prev,
            [bookingId]: value,
        }));
    };

    const handleStatusUpdate = (booking: TourismBooking) => {
        const selected = statusUpdates[booking.id] ?? booking.status;

        if (!selected || selected === booking.status) {
            return;
        }

        router.put(
            `/admin/tourism/bookings/${booking.id}/status`,
            { status: selected },
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = () => {
        if (!bookingToDelete) {
            return;
        }

        router.delete(`/admin/tourism/bookings/${bookingToDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setBookingToDelete(null),
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Tourisme', href: '/admin/tourism/packages' }, { title: 'Réservations', href: '/admin/tourism/bookings' }]}>
            <div className="p-6">
                <Head title="Réservations Tourisme - Admin" />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Réservations Tourisme</h1>
                    <Link href="/admin/tourism/packages" className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        Retour aux packages
                    </Link>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                placeholder="Client, package..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                {BOOKING_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmée' : status === 'cancelled' ? 'Annulée' : 'Terminée'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95"
                            >
                                Filtrer
                            </button>
                            {(search || selectedStatus) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Client</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Package</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Dates</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Personnes</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Montant</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date réservation</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {bookings.data.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{booking.user?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{booking.user?.email || ''}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{booking.tourism_package?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div>{new Date(booking.start_date).toLocaleDateString('fr-FR')}</div>
                                        <div className="text-xs text-gray-500">au {new Date(booking.end_date).toLocaleDateString('fr-FR')}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{booking.number_of_people}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'XOF',
                                            minimumFractionDigits: 0,
                                        }).format(booking.total_amount)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                            {booking.status === 'pending' ? 'En attente' : booking.status === 'confirmed' ? 'Confirmée' : booking.status === 'cancelled' ? 'Annulée' : 'Terminée'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="rounded border border-gray-200 bg-white px-2 py-1 text-sm"
                                                    value={statusUpdates[booking.id] ?? booking.status}
                                                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                >
                                                    {BOOKING_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status === 'pending'
                                                                ? 'En attente'
                                                                : status === 'confirmed'
                                                                    ? 'Confirmée'
                                                                    : status === 'cancelled'
                                                                        ? 'Annulée'
                                                                        : 'Terminée'}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(booking)}
                                                    disabled={
                                                        (statusUpdates[booking.id] ?? booking.status) === booking.status
                                                    }
                                                    className="px-3 py-1 rounded bg-[var(--primary)] text-white text-xs font-medium disabled:opacity-40"
                                                >
                                                    Mettre à jour
                                                </button>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={booking.status !== 'completed'}
                                                onClick={() => setBookingToDelete(booking)}
                                                className="h-7 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {bookings.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {bookings.links.map((l, i) => (
                                    <Link
                                        key={i}
                                        href={l.url || '#'}
                                        className={`px-3 py-2 text-sm ${l.active ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>

                <Dialog open={bookingToDelete !== null} onOpenChange={(open) => !open && setBookingToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-lg">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m0 3.75h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Confirmer la suppression
                            </DialogTitle>
                            <DialogDescription>
                                Cette réservation terminée sera définitivement supprimée. Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                            <p className="font-medium text-gray-900">
                                {bookingToDelete?.tourism_package?.name ?? 'Package inconnu'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Réservée le{' '}
                                {bookingToDelete
                                    ? new Date(bookingToDelete.created_at).toLocaleDateString('fr-FR')
                                    : ''}
                            </p>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setBookingToDelete(null)}>
                                Annuler
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDelete}>
                                Supprimer définitivement
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}













