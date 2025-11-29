import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Destination {
    id: number;
    name: string;
    slug: string;
    code?: string;
    continent?: string;
    flag_emoji?: string;
    description?: string;
    image_path?: string;
    is_active: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    destinations: Paginated<Destination>;
    filters?: { search?: string; continent?: string };
}

const CONTINENTS = ['Afrique', 'Amérique', 'Asie', 'Europe', 'Océanie', 'Antarctique'];

export default function Index({ destinations, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedContinent, setSelectedContinent] = useState(filters?.continent || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (selectedContinent) {
            params.append('continent', selectedContinent);
        }
        router.get('/admin/destinations', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedContinent('');
        router.get('/admin/destinations', {}, { preserveState: true, preserveScroll: true });
    };

    const onDelete = (id: number) => {
        if (confirm('Supprimer cette destination ?')) {
            router.delete(`/admin/destinations/${id}`, { preserveScroll: true });
        }
    };

    const onClearAll = () => {
        if (confirm('Voulez-vous vraiment supprimer toutes les destinations ? Cette action est irréversible.')) {
            router.post('/admin/destinations/clear', {}, { preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Destinations', href: '/admin/destinations' }]}>
            <div className="p-6">
                <Head title="Destinations - Admin" />
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Destinations</h1>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm"
                        >
                            Vider toutes les destinations
                        </button>
                        <Link href="/admin/destinations/create" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                            Nouvelle destination
                        </Link>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                placeholder="Nom, code ou description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedContinent}
                                onChange={(e) => setSelectedContinent(e.target.value)}
                            >
                                <option value="">Tous les continents</option>
                                {CONTINENTS.map((continent) => (
                                    <option key={continent} value={continent}>
                                        {continent}
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
                            {(search || selectedContinent) && (
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
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Destination</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Code</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Continent</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {destinations.data.map((destination) => (
                                <tr key={destination.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {destination.image_path ? (
                                                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img src={destination.image_path} className="h-full w-full object-cover" alt={destination.name} />
                                                </div>
                                            ) : null}
                                            <div>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    {destination.flag_emoji && <span>{destination.flag_emoji}</span>}
                                                    {destination.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{destination.code || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{destination.continent || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${destination.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {destination.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-2">
                                            <Link href={`/admin/destinations/${destination.id}/edit`} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                                Éditer
                                            </Link>
                                            <button onClick={() => onDelete(destination.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {destinations.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {destinations.links.map((l, i) => (
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













