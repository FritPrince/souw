import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    order: number;
    is_active: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    categories: Paginated<Category>;
}

export default function Index({ categories }: Props) {
    const onClear = () => {
        if (confirm('Voulez-vous vraiment supprimer toutes les catégories ? Cette action est irréversible.')) {
            router.post('/admin/categories/clear', {}, { preserveScroll: true });
        }
    };

    const onDelete = (id: number) => {
        if (confirm('Supprimer cette catégorie ?')) {
            router.delete(`/admin/categories/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Catégories', href: '/admin/categories' }]}>
            <div className="p-6">
                <Head title="Catégories - Admin" />
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Catégories</h1>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClear}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm"
                        >
                            Vider toutes les catégories
                        </button>
                        <Link href="/admin/categories/create" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                            Nouvelle catégorie
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Nom</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Slug</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Description</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Ordre</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {categories.data.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {category.image_path ? (
                                                <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img src={category.image_path} className="h-full w-full object-cover" alt={category.name} />
                                                </div>
                                            ) : null}
                                            <div className="font-medium text-gray-900">{category.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{category.slug}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div className="max-w-[300px] truncate">{category.description || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{category.order}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {category.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="inline-flex items-center gap-2">
                                            <Link href={`/admin/categories/${category.id}/edit`} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                                Éditer
                                            </Link>
                                            <button onClick={() => onDelete(category.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {categories.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {categories.links.map((l, i) => (
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

