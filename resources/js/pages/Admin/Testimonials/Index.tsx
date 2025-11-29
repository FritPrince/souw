import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Testimonial {
    id: number;
    name: string;
    role?: string;
    avatar_path?: string;
    rating?: number;
    content: string;
    is_active: boolean;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    testimonials: Paginated<Testimonial>;
    filters?: { search?: string };
}

export default function Index({ testimonials, filters }: Props) {
    const onToggle = (id: number) => {
        router.post(`/admin/testimonials/${id}/toggle`, {}, { preserveScroll: true });
    };

    const onDelete = (id: number) => {
        if (confirm('Supprimer ce témoignage ?')) {
            router.delete(`/admin/testimonials/${id}`, { preserveScroll: true });
        }
    };

    const onClear = () => {
        if (confirm('Voulez-vous vraiment supprimer tous les témoignages ? Cette action est irréversible.')) {
            router.post('/admin/testimonials/clear', {}, { preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Témoignages', href: '/admin/testimonials' }]}>
        <div className="p-6">
            <Head title="Témoignages - Admin" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Témoignages</h1>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClear}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm"
                    >
                        Vider tous les témoignages
                    </button>
                    <Link href="/admin/testimonials/create" className="px-4 py-2 bg-[var(--primary)] text-white rounded">
                        Nouveau
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow ring-1 ring-black/5 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Client</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Rôle</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Note</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {testimonials.data.map((t) => (
                            <tr key={t.id}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {t.avatar_path ? (
                                                <img src={t.avatar_path} className="h-full w-full object-cover" />
                                            ) : (
                                                <i className="las la-user text-gray-500"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{t.name}</div>
                                            {t.content && (
                                                <div className="text-xs text-gray-500 line-clamp-1 max-w-[360px]">{t.content}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{t.role || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <span key={idx} className={idx < (t.rating ?? 0) ? 'text-[#f9d121]' : 'text-gray-300'}>★</span>
                                        ))}
                                        <span className="ml-2 text-xs text-gray-500">({t.rating ?? 0}/5)</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {t.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                    <div className="inline-flex items-center gap-2">
                                        <button onClick={() => onToggle(t.id)} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                            {t.is_active ? 'Désactiver' : 'Activer'}
                                        </button>
                                        <Link href={`/admin/testimonials/${t.id}/edit`} className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50">
                                            Éditer
                                        </Link>
                                        <button onClick={() => onDelete(t.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100">
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {testimonials.links.length > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                        <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                            {testimonials.links.map((l, i) => (
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
