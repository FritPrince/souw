import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface TourismPackage {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    duration_days: number;
    price: number;
    is_active: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    packages: Paginated<TourismPackage>;
    filters?: { search?: string; status?: string };
}

export default function Index({ packages, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (selectedStatus) {
            params.append('status', selectedStatus);
        }
        router.get('/admin/tourism/packages', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('');
        router.get('/admin/tourism/packages', {}, { preserveState: true, preserveScroll: true });
    };

    const onDelete = (id: number) => {
        if (confirm('Supprimer ce package ?')) {
            router.delete(`/admin/tourism/packages/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Tourisme', href: '/admin/tourism/packages' }]}>
            <div className="p-6">
                <Head title="Packages Tourisme - Admin" />
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Packages Tourisme</h1>
                    <Link href="/admin/tourism/packages/create" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                        Nouveau package
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
                                placeholder="Nom ou description..."
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
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
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
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Package</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Durée</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Prix</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {packages.data.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {pkg.image_path ? (
                                                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img src={pkg.image_path} className="h-full w-full object-cover" alt={pkg.name} />
                                                </div>
                                            ) : null}
                                            <div>
                                                <div className="font-medium text-gray-900">{pkg.name}</div>
                                                {pkg.description && (
                                                    <div className="text-xs text-gray-500 line-clamp-1">{pkg.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{pkg.duration_days} jour(s)</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'XOF',
                                            minimumFractionDigits: 0,
                                        }).format(pkg.price)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {pkg.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-2">
                                            <Link href={`/admin/tourism/packages/${pkg.id}/edit`} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                                Éditer
                                            </Link>
                                            <button onClick={() => onDelete(pkg.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {packages.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {packages.links.map((l, i) => (
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













