import { Head, Link, router, useForm } from '@inertiajs/react';
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

interface AppointmentSlot {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
}

interface Appointment {
    id: number;
    status: string;
    notes?: string;
    created_at: string;
    guest_name?: string;
    guest_email?: string;
    user?: User;
    service?: Service;
    appointmentSlot?: AppointmentSlot;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    appointments: Paginated<Appointment>;
    filters?: { status?: string; date?: string };
}

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '-';
    try {
        // Si c'est déjà au format YYYY-MM-DD, l'utiliser directement
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        // Sinon, essayer de parser la date
        const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return dateStr; // Retourner la string originale si la date est invalide
        }
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        return dateStr || '-';
    }
};

const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    // Si le temps est au format HH:MM:SS, prendre seulement HH:MM
    return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

export default function Index({ appointments, filters }: Props) {
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (selectedStatus) {
            params.append('status', selectedStatus);
        }
        if (selectedDate) {
            params.append('date', selectedDate);
        }
        router.get('/admin/appointments', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedDate('');
        router.get('/admin/appointments', {}, { preserveState: true, preserveScroll: true });
    };

    const confirmAppointment = (id: number) => {
        router.post(`/admin/appointments/${id}/confirm`, {}, { preserveScroll: true });
    };

    const cancelAppointment = (id: number) => {
        if (confirm('Annuler ce rendez-vous ?')) {
            router.post(`/admin/appointments/${id}/cancel`, {}, { preserveScroll: true });
        }
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

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Rendez-vous', href: '/admin/appointments' }]}>
            <div className="p-6">
                <Head title="Rendez-vous - Admin" />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Rendez-vous</h1>
                    <Link href="/admin/appointments/slots" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                        Gérer les créneaux
                    </Link>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                {APPOINTMENT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmé' : status === 'cancelled' ? 'Annulé' : 'Terminé'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95"
                            >
                                Filtrer
                            </button>
                            {(selectedStatus || selectedDate) && (
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
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Service</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Heure</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {appointments.data.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {appointment.user?.name || appointment.guest_name || '-'}
                                                {!appointment.user && appointment.guest_name && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-purple-50 px-1.5 py-0.5 text-xs text-purple-600">
                                                        Invité
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{appointment.user?.email || appointment.guest_email || ''}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{appointment.service?.name || 'Consultation'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {appointment.appointmentSlot?.date
                                            ? formatDate(appointment.appointmentSlot.date)
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {appointment.appointmentSlot?.start_time && appointment.appointmentSlot?.end_time
                                            ? `${formatTime(appointment.appointmentSlot.start_time)} - ${formatTime(appointment.appointmentSlot.end_time)}`
                                            : appointment.appointmentSlot
                                              ? 'Heure non disponible'
                                              : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                                            {appointment.status === 'pending' ? 'En attente' : appointment.status === 'confirmed' ? 'Confirmé' : appointment.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-2">
                                            {appointment.status === 'pending' && (
                                                <button
                                                    onClick={() => confirmAppointment(appointment.id)}
                                                    className="px-2 py-1 rounded bg-green-50 text-green-600 ring-1 ring-green-200 hover:bg-green-100"
                                                >
                                                    Confirmer
                                                </button>
                                            )}
                                            {appointment.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => cancelAppointment(appointment.id)}
                                                    className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {appointments.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {appointments.links.map((l, i) => (
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
            </div>
        </AppSidebarLayout>
    );
}

