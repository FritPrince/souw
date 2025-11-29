import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    order: number;
    is_active: boolean;
}

interface Props {
    category: Category;
}

export default function Edit({ category }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(category.image_path ?? null);

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const { data, setData, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: null as File | null,
        order: category.order || 0,
        is_active: category.is_active ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            image: data.image,
            order: data.order,
            is_active: data.is_active,
            _method: 'put',
        };

        router.post(`/admin/categories/${category.id}`, payload, {
            forceFormData: true,
        });
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
        if (!data.slug || data.slug === generateSlug(category.name)) {
            setData('slug', generateSlug(value));
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Catégories', href: '/admin/categories' }, { title: 'Éditer', href: `/admin/categories/${category.id}/edit` }]}>
            <div className="p-6">
                <Head title={`Éditer ${category.name}`} />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Éditer la catégorie</h1>
                    <Link href="/admin/categories" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: Visa & Immigration"
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                            />
                            {errors.name && <p id="name-error" className="text-red-600 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Slug <span className="text-red-500">*</span></label>
                            <input
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Ex: visa-immigration"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                aria-invalid={!!errors.slug}
                                aria-describedby={errors.slug ? 'slug-error' : undefined}
                            />
                            {errors.slug && <p id="slug-error" className="text-red-600 text-xs mt-1">{errors.slug}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-800">Description</label>
                            <textarea
                                rows={4}
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                placeholder="Description de la catégorie..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? 'description-error' : undefined}
                            />
                            {errors.description && <p id="description-error" className="text-red-600 text-xs mt-1">{errors.description}</p>}
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
                                        setImagePreview(file ? URL.createObjectURL(file) : category.image_path ?? null);
                                    }}
                                />
                            </div>
                            {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800">Ordre</label>
                            <input
                                type="number"
                                min={0}
                                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                value={data.order}
                                onChange={(e) => setData('order', Number(e.target.value))}
                                aria-invalid={!!errors.order}
                                aria-describedby={errors.order ? 'order-error' : undefined}
                            />
                            {errors.order && <p id="order-error" className="text-red-600 text-xs mt-1">{errors.order}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="inline-flex items-center gap-3">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <span className="text-sm text-gray-800">Actif</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <Link href="/admin/categories" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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
