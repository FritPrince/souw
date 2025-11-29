import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Category {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    price: number;
    is_active: boolean;
    requires_appointment: boolean;
    category?: Category;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    services: Paginated<Service>;
    categories: Category[];
    filters?: { category?: string; search?: string };
}

export default function Index({ services, categories, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        if (selectedCategory) {
            params.append('category', selectedCategory);
        }
        router.get('/admin/services', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        router.get('/admin/services', {}, { preserveState: true, preserveScroll: true });
    };

    const onToggle = (id: number) => {
        router.post(`/admin/services/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    const onDelete = (id: number) => {
        if (confirm('Supprimer ce service ?')) {
            router.delete(`/admin/services/${id}`, { preserveScroll: true });
        }
    };

    const onClearAll = () => {
        if (confirm('Voulez-vous vraiment supprimer tous les services ? Cette action est irréversible.')) {
            router.post('/admin/services/clear', {}, { preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Services', href: '/admin/services' }]}>
            <div className="p-6">
                <Head title="Services - Admin" />
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Services</h1>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm"
                        >
                            Vider tous les services
                        </button>
                        <Link href="/admin/services/create" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                            Nouveau service
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
                                placeholder="Nom ou description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Toutes les catégories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
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
                            {(search || selectedCategory) && (
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
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Service</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Catégorie</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Prix</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {services.data.map((service) => (
                                <tr key={service.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {service.image_path ? (
                                                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img src={service.image_path} className="h-full w-full object-cover" alt={service.name} />
                                                </div>
                                            ) : null}
                                            <div>
                                                <div className="font-medium text-gray-900">{service.name}</div>
                                                {service.requires_appointment && (
                                                    <span className="text-xs text-blue-600">Rendez-vous requis</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{service.category?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'XOF',
                                            minimumFractionDigits: 0,
                                        }).format(service.price)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {service.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-2">
                                            <button onClick={() => onToggle(service.id)} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                                {service.is_active ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <Link href={`/admin/services/${service.id}/edit`} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                                Éditer
                                            </Link>
                                            <button onClick={() => onDelete(service.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {services.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {services.links.map((l, i) => (
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













