import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Calendar, MapPin, Users, Package, Edit, Trash2, Eye, Plus } from 'lucide-react';

interface Event {
    id: number;
    name: string;
    slug: string;
    short_description?: string;
    image_path?: string;
    location?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    is_featured: boolean;
    packs_count: number;
    registrations_count: number;
}

interface Props {
    events: {
        data: Event[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function EventsIndex({ events }: Props) {
    const handleDelete = (event: Event) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`)) {
            router.delete(`/admin/events/${event.id}`);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Événements', href: '/admin/events' }]}>
            <Head title="Événements" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
                        <p className="text-sm text-gray-500 mt-1">{events.total} événement(s)</p>
                    </div>
                    <Link
                        href="/admin/events/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel événement
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
                    {events.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Événement</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lieu</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Packs</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Inscriptions</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {events.data.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {event.image_path ? (
                                                        <img
                                                            src={event.image_path}
                                                            alt={event.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Calendar className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{event.name}</div>
                                                        {event.is_featured && (
                                                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">À la une</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.location || event.country ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{[event.location, event.country].filter(Boolean).join(', ')}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{formatDate(event.start_date)}</div>
                                                {event.end_date && event.end_date !== event.start_date && (
                                                    <div className="text-gray-400">→ {formatDate(event.end_date)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                    <Package className="w-3 h-3" />
                                                    {event.packs_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={`/admin/events/${event.id}/registrations`}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                                                >
                                                    <Users className="w-3 h-3" />
                                                    {event.registrations_count}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    event.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {event.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/events/${event.id}/edit`}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Voir / Modifier"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/events/${event.slug}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Voir la page publique"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(event)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
                            <p className="text-gray-500 mb-4">Commencez par créer votre premier événement.</p>
                            <Link
                                href="/admin/events/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Plus className="w-4 h-4" />
                                Créer un événement
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/events?page=${page}`}
                                className={`px-3 py-1 rounded ${
                                    page === events.current_page
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
        </AppSidebarLayout>
    );
}

