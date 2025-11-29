import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

type ItineraryValue = string | Record<string, unknown> | Array<unknown>;

interface TourismPackage {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    duration_days: number;
    price: number;
    includes?: Array<string | Record<string, unknown>>;
    itinerary?: Array<ItineraryValue>;
    is_active: boolean;
}

interface Props {
    package: TourismPackage;
}

const normaliseList = (value?: Array<string | Record<string, unknown> | Array<unknown>>): string[] => {
    if (!value || value.length === 0) {
        return [''];
    }

    return value.map((item) => {
        if (typeof item === 'string') {
            return item;
        }

        if (Array.isArray(item)) {
            return item.filter((entry) => typeof entry === 'string').join(' • ');
        }

        return Object.entries(item ?? {})
            .map(([key, entry]) => `${key}: ${Array.isArray(entry) ? entry.join(', ') : entry}`)
            .join(' | ');
    });
};

export default function Edit({ package: pkg }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(pkg.image_path ?? null);
    const [includes, setIncludes] = useState<string[]>(normaliseList(pkg.includes));
    const [itinerary, setItinerary] = useState<string[]>(normaliseList(pkg.itinerary));

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const { data, setData, processing, errors } = useForm({
        name: pkg.name || '',
        slug: pkg.slug || '',
        description: pkg.description || '',
        image: null as File | null,
        duration_days: pkg.duration_days || 1,
        price: pkg.price || 0,
        is_active: pkg.is_active ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            includes: includes.filter((item) => item.trim() !== ''),
            itinerary: itinerary.filter((item) => item.trim() !== ''),
            _method: 'put',
        };
        router.post(`/admin/tourism/packages/${pkg.id}`, payload, { forceFormData: true });
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
        if (!data.slug || data.slug === generateSlug(pkg.name)) {
            setData('slug', generateSlug(value));
        }
    };

    const addInclude = () => {
        setIncludes([...includes, '']);
    };

    const updateInclude = (index: number, value: string) => {
        const updated = [...includes];
        updated[index] = value;
        setIncludes(updated);
    };

    const removeInclude = (index: number) => {
        setIncludes(includes.filter((_, i) => i !== index));
    };

    const addItinerary = () => {
        setItinerary([...itinerary, '']);
    };

    const updateItinerary = (index: number, value: string) => {
        const updated = [...itinerary];
        updated[index] = value;
        setItinerary(updated);
    };

    const removeItinerary = (index: number) => {
        setItinerary(itinerary.filter((_, i) => i !== index));
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Tourisme', href: '/admin/tourism/packages' }, { title: 'Éditer', href: `/admin/tourism/packages/${pkg.id}/edit` }]}>
            <div className="p-6">
                <Head title={`Éditer ${pkg.name}`} />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Éditer le package</h1>
                    <Link href="/admin/tourism/packages" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8 space-y-8">
                    {/* Informations de base */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Informations de base</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
                                <input
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: Safari au Kenya"
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
                                    placeholder="Ex: safari-kenya"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    aria-invalid={!!errors.slug}
                                />
                                {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Durée (jours) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.duration_days}
                                    onChange={(e) => setData('duration_days', Number(e.target.value))}
                                    aria-invalid={!!errors.duration_days}
                                />
                                {errors.duration_days && <p className="text-red-600 text-xs mt-1">{errors.duration_days}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Prix <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.price}
                                    onChange={(e) => setData('price', Number(e.target.value))}
                                    aria-invalid={!!errors.price}
                                />
                                {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800">Description</label>
                                <textarea
                                    rows={4}
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Description du package..."
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
                                            setImagePreview(file ? URL.createObjectURL(file) : pkg.image_path ?? null);
                                        }}
                                    />
                                </div>
                                {errors.image && <p className="text-red-600 text-xs mt-1">{errors.image}</p>}
                            </div>

                            <div>
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
                    </section>

                    {/* Inclus */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Inclus dans le package</h2>
                            <button
                                type="button"
                                onClick={addInclude}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {includes.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        placeholder="Ex: Transport, Hôtel, Repas..."
                                        value={item}
                                        onChange={(e) => updateInclude(index, e.target.value)}
                                    />
                                    {includes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeInclude(index)}
                                            className="px-3 py-2 text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Itinéraire */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Itinéraire</h2>
                            <button
                                type="button"
                                onClick={addItinerary}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {itinerary.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <textarea
                                        rows={2}
                                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        placeholder="Ex: Jour 1: Arrivée à Nairobi, visite de la ville..."
                                        value={item}
                                        onChange={(e) => updateItinerary(index, e.target.value)}
                                    />
                                    {itinerary.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItinerary(index)}
                                            className="px-3 py-2 text-red-600 hover:text-red-700"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Link href="/admin/tourism/packages" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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













