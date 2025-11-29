import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

const CONTINENTS = ['Afrique', 'Amérique', 'Asie', 'Europe', 'Océanie', 'Antarctique'];

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
}

interface Props {
    destination: Destination;
}

export default function Edit({ destination }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(destination.image_path ?? null);

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const { data, setData, processing, errors } = useForm({
        name: destination.name || '',
        slug: destination.slug || '',
        code: destination.code || '',
        continent: destination.continent || '',
        flag_emoji: destination.flag_emoji || '',
        description: destination.description || '',
        image: null as File | null,
        is_active: destination.is_active ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/destinations/${destination.id}`, { ...data, _method: 'put' }, { forceFormData: true });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (value: string) => {
        setData('name', value);
        if (!data.slug || data.slug === generateSlug(destination.name)) {
            setData('slug', generateSlug(value));
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Destinations', href: '/admin/destinations' }, { title: 'Éditer', href: `/admin/destinations/${destination.id}/edit` }]}>
            <div className="p-6">
                <Head title={`Éditer ${destination.name}`} />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Éditer la destination</h1>
                    <Link href="/admin/destinations" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: États-Unis"
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Slug <span className="text-red-500">*</span></label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: etats-unis"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                aria-invalid={!!errors.slug}
                            />
                            {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Code pays</label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: US"
                                maxLength={3}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                aria-invalid={!!errors.code}
                            />
                            {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Continent</label>
                            <select
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                value={data.continent}
                                onChange={(e) => setData('continent', e.target.value)}
                                aria-invalid={!!errors.continent}
                            >
                                <option value="">Sélectionner un continent</option>
                                {CONTINENTS.map((continent) => (
                                    <option key={continent} value={continent}>
                                        {continent}
                                    </option>
                                ))}
                            </select>
                            {errors.continent && <p className="text-red-600 text-xs mt-1">{errors.continent}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Emoji drapeau</label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: 🇺🇸"
                                maxLength={10}
                                value={data.flag_emoji}
                                onChange={(e) => setData('flag_emoji', e.target.value)}
                                aria-invalid={!!errors.flag_emoji}
                            />
                            {errors.flag_emoji && <p className="text-red-600 text-xs mt-1">{errors.flag_emoji}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Statut</label>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800">Actif</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-800">Description</label>
                            <textarea
                                rows={4}
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Description de la destination..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                aria-invalid={!!errors.description}
                            />
                            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-800">Image</label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="h-24 w-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Aucune</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
                                    onChange={(e) => {
                                        const file = e.currentTarget.files?.[0] ?? null;
                                        setData('image', file);
                                        if (imagePreview?.startsWith('blob:')) {
                                            URL.revokeObjectURL(imagePreview);
                                        }
                                        setImagePreview(file ? URL.createObjectURL(file) : destination.image_path ?? null);
                                    }}
                                />
                            </div>
                            {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Link href="/admin/destinations" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/30 disabled:opacity-60"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}













