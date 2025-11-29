import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ArrowLeft, Mail, Phone, MapPin, User, Calendar, Package, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Pack {
    id: number;
    name: string;
    price: number;
}

interface Registration {
    id: number;
    reference: string;
    full_name: string;
    gender: string;
    birth_date?: string;
    birth_place?: string;
    birth_country?: string;
    nationality?: string;
    profession?: string;
    address?: string;
    residence_country?: string;
    email: string;
    phone?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    pack?: Pack;
    created_at: string;
}

interface Event {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    event: Event;
    registrations: {
        data: Registration[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const statusConfig = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XCircle },
    completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
};

export default function EventRegistrations({ event, registrations }: Props) {
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const updateStatus = (registration: Registration, newStatus: string) => {
        setIsUpdating(registration.id);
        router.put(
            `/admin/events/${event.id}/registrations/${registration.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdating(null),
            }
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    };

    return (
        <AppSidebarLayout breadcrumbs={[
            { title: 'Événements', href: '/admin/events' },
            { title: event.name, href: `/admin/events/${event.id}/edit` },
            { title: 'Inscriptions', href: `/admin/events/${event.id}/registrations` },
        ]}>
            <Head title={`Inscriptions - ${event.name}`} />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/events"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inscriptions</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {event.name} • {registrations.total} inscription(s)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
                    {registrations.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Référence</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Participant</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pack</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {registrations.data.map((registration) => {
                                        const StatusIcon = statusConfig[registration.status].icon;
                                        return (
                                            <tr
                                                key={registration.id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedRegistration(registration)}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-[var(--primary)]">
                                                        {registration.reference}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{registration.full_name}</div>
                                                        <div className="text-xs text-gray-500">{registration.gender}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Mail className="w-3 h-3" />
                                                            {registration.email}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Phone className="w-3 h-3" />
                                                            {registration.phone || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {registration.pack ? (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-sm">
                                                                <Package className="w-3 h-3" />
                                                                {registration.pack.name}
                                                            </span>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatPrice(registration.pack.price)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select
                                                        value={registration.status}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateStatus(registration, e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={isUpdating === registration.id}
                                                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusConfig[registration.status].color} ${
                                                            isUpdating === registration.id ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        <option value="pending">En attente</option>
                                                        <option value="confirmed">Confirmé</option>
                                                        <option value="cancelled">Annulé</option>
                                                        <option value="completed">Terminé</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                    {formatDateTime(registration.created_at)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune inscription</h3>
                            <p className="text-gray-500">Aucune inscription pour cet événement pour le moment.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {registrations.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {Array.from({ length: registrations.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/events/${event.id}/registrations?page=${page}`}
                                className={`px-3 py-1 rounded ${
                                    page === registrations.current_page
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal détail inscription */}
            {selectedRegistration && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedRegistration(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Détails de l'inscription</h2>
                                    <p className="text-sm text-gray-500">Référence : {selectedRegistration.reference}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRegistration(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informations personnelles */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Informations personnelles
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Nom complet</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.full_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Sexe</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.gender}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Date de naissance</label>
                                        <p className="font-medium text-gray-900">{formatDate(selectedRegistration.birth_date)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Lieu de naissance</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.birth_place || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Pays de naissance</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.birth_country || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Nationalité</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.nationality || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">Profession</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.profession || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Coordonnées
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Email</label>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <a href={`mailto:${selectedRegistration.email}`} className="text-[var(--primary)] hover:underline">
                                                {selectedRegistration.email}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Téléphone</label>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {selectedRegistration.phone ? (
                                                <a href={`tel:${selectedRegistration.phone}`} className="text-[var(--primary)] hover:underline">
                                                    {selectedRegistration.phone}
                                                </a>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">Adresse</label>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {selectedRegistration.address || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Pays de résidence</label>
                                        <p className="font-medium text-gray-900">{selectedRegistration.residence_country || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pack et statut */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Réservation
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Pack choisi</label>
                                        {selectedRegistration.pack ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-sm font-medium">
                                                    <Package className="w-4 h-4" />
                                                    {selectedRegistration.pack.name}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {formatPrice(selectedRegistration.pack.price)}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="font-medium text-gray-900">-</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Statut</label>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                statusConfig[selectedRegistration.status].color
                                            }`}>
                                                {statusConfig[selectedRegistration.status].label}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Date d'inscription</label>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {formatDateTime(selectedRegistration.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedRegistration(null)}
                                className="px-4 py-2 text-gray-700 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppSidebarLayout>
    );
}

