import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Pack {
    name: string;
    description: string;
    features: string[];
    price: number;
    max_participants: number | null;
    is_active: boolean;
}

export default function EventCreate() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [newFeature, setNewFeature] = useState<string[]>([]);

    const { data, setData, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        image: null as File | null,
        location: '',
        country: '',
        start_date: '',
        end_date: '',
        is_active: true,
        is_featured: false,
    });

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
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(value));
        }
    };

    const addPack = () => {
        setPacks([...packs, {
            name: '',
            description: '',
            features: [],
            price: 0,
            max_participants: null,
            is_active: true,
        }]);
        setNewFeature([...newFeature, '']);
    };

    const updatePack = (index: number, field: keyof Pack, value: any) => {
        const updated = [...packs];
        updated[index] = { ...updated[index], [field]: value };
        setPacks(updated);
    };

    const removePack = (index: number) => {
        setPacks(packs.filter((_, i) => i !== index));
        setNewFeature(newFeature.filter((_, i) => i !== index));
    };

    const addFeature = (packIndex: number) => {
        if (newFeature[packIndex]?.trim()) {
            const updated = [...packs];
            updated[packIndex].features = [...updated[packIndex].features, newFeature[packIndex].trim()];
            setPacks(updated);
            const newFeatures = [...newFeature];
            newFeatures[packIndex] = '';
            setNewFeature(newFeatures);
        }
    };

    const removeFeature = (packIndex: number, featureIndex: number) => {
        const updated = [...packs];
        updated[packIndex].features = updated[packIndex].features.filter((_, i) => i !== featureIndex);
        setPacks(updated);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            ...data,
            packs: JSON.stringify(packs),
        };

        router.post('/admin/events', payload, {
            forceFormData: true,
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[
            { title: 'Événements', href: '/admin/events' },
            { title: 'Nouvel événement', href: '/admin/events/create' }
        ]}>
            <Head title="Nouvel événement" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Nouvel événement</h1>
                    <Link href="/admin/events" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    {/* Informations de base */}
                    <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6">
                        <h2 className="text-lg font-semibold mb-4">Informations de base</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: CAN 2025"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Slug <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="can-2025"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                />
                                {errors.slug && <p className="text-red-600 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800">Description courte</label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Une phrase d'accroche pour l'événement"
                                    maxLength={500}
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800">Description complète</label>
                                <textarea
                                    rows={4}
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Description détaillée de l'événement..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Lieu</label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: Casablanca"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Pays</label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: Maroc"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Date de début</label>
                                <input
                                    type="date"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800">Date de fin</label>
                                <input
                                    type="date"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800">Image de couverture</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="h-24 w-40 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
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
                                            setImagePreview(file ? URL.createObjectURL(file) : null);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 flex gap-6">
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800">Actif</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                        checked={data.is_featured}
                                        onChange={(e) => setData('is_featured', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800">À la une</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Packs */}
                    <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Packs</h2>
                                <p className="text-sm text-gray-500">Créez les différentes formules pour cet événement</p>
                            </div>
                            <button
                                type="button"
                                onClick={addPack}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter un pack
                            </button>
                        </div>

                        <div className="space-y-4">
                            {packs.map((pack, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <h3 className="font-medium text-gray-900">Pack {index + 1}</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePack(index)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Nom du pack <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Gold, Silver, Bronze..."
                                                value={pack.name}
                                                onChange={(e) => updatePack(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Prix (FCFA) <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={pack.price}
                                                onChange={(e) => updatePack(index, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Description</label>
                                            <textarea
                                                rows={2}
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Description du pack..."
                                                value={pack.description}
                                                onChange={(e) => updatePack(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Nombre max de participants</label>
                                            <input
                                                type="number"
                                                min={1}
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Illimité si vide"
                                                value={pack.max_participants ?? ''}
                                                onChange={(e) => updatePack(index, 'max_participants', e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                    checked={pack.is_active}
                                                    onChange={(e) => updatePack(index, 'is_active', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-700">Actif</span>
                                            </label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Avantages inclus</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                    placeholder="Ajouter un avantage..."
                                                    value={newFeature[index] || ''}
                                                    onChange={(e) => {
                                                        const updated = [...newFeature];
                                                        updated[index] = e.target.value;
                                                        setNewFeature(updated);
                                                    }}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature(index))}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => addFeature(index)}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                                                >
                                                    Ajouter
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {pack.features.map((feature, fIndex) => (
                                                    <span
                                                        key={fIndex}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-xs"
                                                    >
                                                        {feature}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(index, fIndex)}
                                                            className="hover:text-red-500"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {packs.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-sm text-gray-500">Aucun pack créé. Cliquez sur "Ajouter un pack" pour commencer.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href="/admin/events" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white shadow hover:opacity-95 disabled:opacity-60"
                        >
                            {processing ? 'Enregistrement...' : 'Créer l\'événement'}
                        </button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}

