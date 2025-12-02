import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Category {
    id: number;
    name: string;
}

interface Destination {
    id: number;
    name: string;
    slug: string;
    code?: string;
    flag_emoji?: string;
}

interface ServiceDestination {
    id: number;
    price_override?: number | null;
    is_active: boolean;
}

interface Props {
    categories: Category[];
    destinations: Destination[];
}

interface SubService {
    name: string;
    slug: string;
    description: string;
    price: number;
    is_active: boolean;
}

interface RequiredDocument {
    name: string;
    description: string;
    is_required: boolean;
    order: number;
}

interface ProcessingTime {
    duration_label: string;
    duration_hours: number;
    price_multiplier: number;
}

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select';
    placeholder?: string;
    is_required: boolean;
    helper_text?: string;
    options?: Array<{ value: string; label: string }>;
    is_active: boolean;
}

interface GalleryImage {
    file: File | null;
    preview: string;
    displayOrder: number;
}

export default function Create({ categories, destinations: availableDestinations }: Props) {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [subServices, setSubServices] = useState<SubService[]>([]);
    const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
    const [processingTimes, setProcessingTimes] = useState<ProcessingTime[]>([]);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<ServiceDestination[]>([]);

    useEffect(() => {
        return () => {
            galleryImages.forEach((img) => {
                if (img.preview?.startsWith('blob:')) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, [galleryImages]);

    const { data, setData, processing, errors } = useForm({
        category_id: '',
        name: '',
        slug: '',
        description: '',
        price: 0,
        show_price: true,
        is_active: true,
        requires_appointment: false,
        appointment_pricing_mode: 'service_plus_appointment' as 'service_plus_appointment' | 'appointment_only',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== CREATE FORM SUBMISSION ===');
        console.log('selectedDestinations state:', selectedDestinations);
        console.log('selectedDestinations count:', selectedDestinations.length);
        console.log('selectedDestinations JSON:', JSON.stringify(selectedDestinations));
        
        // When using forceFormData, complex arrays need to be JSON stringified
        const payload: any = {
            ...data,
            sub_services: JSON.stringify(subServices),
            required_documents: JSON.stringify(requiredDocuments),
            processing_times: JSON.stringify(processingTimes),
            form_fields: JSON.stringify(formFields),
            destinations: JSON.stringify(selectedDestinations),
        };

        // Add gallery images - utiliser une syntaxe plus simple pour FormData
        galleryImages.forEach((img, index) => {
            if (img.file) {
                payload[`gallery_image_${index}`] = img.file;
                payload[`gallery_image_order_${index}`] = img.displayOrder;
            }
        });
        
        console.log('Full payload keys:', Object.keys(payload));
        console.log('Destinations in payload:', payload.destinations);
        console.log('Destinations type:', typeof payload.destinations);
        
        (router.post as any)('/admin/services', payload, { 
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
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(value));
        }
    };

    const addSubService = () => {
        setSubServices([...subServices, { name: '', slug: '', description: '', price: 0, is_active: true }]);
    };

    const updateSubService = (index: number, field: keyof SubService, value: any) => {
        const updated = [...subServices];
        updated[index] = { ...updated[index], [field]: value };
        if (field === 'name') {
            updated[index].slug = generateSlug(value);
        }
        setSubServices(updated);
    };

    const removeSubService = (index: number) => {
        setSubServices(subServices.filter((_, i) => i !== index));
    };

    const addRequiredDocument = () => {
        setRequiredDocuments([...requiredDocuments, { name: '', description: '', is_required: true, order: requiredDocuments.length }]);
    };

    const updateRequiredDocument = (index: number, field: keyof RequiredDocument, value: any) => {
        const updated = [...requiredDocuments];
        updated[index] = { ...updated[index], [field]: value };
        setRequiredDocuments(updated);
    };

    const removeRequiredDocument = (index: number) => {
        setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
    };

    const addProcessingTime = () => {
        setProcessingTimes([...processingTimes, { duration_label: '', duration_hours: 0, price_multiplier: 1.0 }]);
    };

    const updateProcessingTime = (index: number, field: keyof ProcessingTime, value: any) => {
        const updated = [...processingTimes];
        updated[index] = { ...updated[index], [field]: value };
        setProcessingTimes(updated);
    };

    const removeProcessingTime = (index: number) => {
        setProcessingTimes(processingTimes.filter((_, i) => i !== index));
    };

    const addFormField = () => {
        setFormFields([...formFields, { name: '', label: '', type: 'text', is_required: false, is_active: true }]);
    };

    const updateFormField = (index: number, field: keyof FormField, value: any) => {
        const updated = [...formFields];
        updated[index] = { ...updated[index], [field]: value };
        setFormFields(updated);
    };

    const removeFormField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index));
    };

    const addFormFieldOption = (fieldIndex: number) => {
        const updated = [...formFields];
        if (!updated[fieldIndex].options) {
            updated[fieldIndex].options = [];
        }
        updated[fieldIndex].options = [...(updated[fieldIndex].options || []), { value: '', label: '' }];
        setFormFields(updated);
    };

    const updateFormFieldOption = (fieldIndex: number, optionIndex: number, field: 'value' | 'label', value: string) => {
        const updated = [...formFields];
        if (!updated[fieldIndex].options) {
            updated[fieldIndex].options = [];
        }
        updated[fieldIndex].options[optionIndex] = { ...updated[fieldIndex].options[optionIndex], [field]: value };
        setFormFields(updated);
    };

    const removeFormFieldOption = (fieldIndex: number, optionIndex: number) => {
        const updated = [...formFields];
        if (updated[fieldIndex].options) {
            updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optionIndex);
        }
        setFormFields(updated);
    };

    const addGalleryImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const preview = URL.createObjectURL(file);
                setGalleryImages([...galleryImages, { file, preview, displayOrder: galleryImages.length }]);
            }
        };
        input.click();
    };

    const removeGalleryImage = (index: number) => {
        const image = galleryImages[index];
        if (image.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(image.preview);
        }
        const updated = galleryImages.filter((_, i) => i !== index);
        // Réorganiser les displayOrder
        updated.forEach((img, i) => {
            img.displayOrder = i;
        });
        setGalleryImages(updated);
    };

    const updateGalleryImageOrder = (index: number, newOrder: number) => {
        const updated = [...galleryImages];
        updated[index].displayOrder = newOrder;
        setGalleryImages(updated);
    };

    const toggleDestination = (destinationId: number) => {
        const existing = selectedDestinations.find(d => d.id === destinationId);
        if (existing) {
            setSelectedDestinations(selectedDestinations.filter(d => d.id !== destinationId));
        } else {
            setSelectedDestinations([...selectedDestinations, { id: destinationId, price_override: null, is_active: true }]);
        }
    };

    const updateDestination = (destinationId: number, field: keyof ServiceDestination, value: any) => {
        const updated = selectedDestinations.map(dest => 
            dest.id === destinationId ? { ...dest, [field]: value } : dest
        );
        setSelectedDestinations(updated);
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Services', href: '/admin/services' }, { title: 'Nouveau service', href: '/admin/services/create' }]}>
            <div className="p-6">
                <Head title="Nouveau service" />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold dark:text-gray-200">Nouveau service</h1>
                    <Link href="/admin/services" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <form onSubmit={onSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-gray-800 p-6 md:p-8 space-y-8">
                    {/* Informations de base */}
                    <section>
                        <h2 className="text-lg font-semibold dark:text-gray-200 mb-4">Informations de base</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Catégorie <span className="text-red-500">*</span></label>
                                <select
                                    className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    aria-invalid={!!errors.category_id}
                                >
                                    <option value="" className="bg-white dark:bg-gray-800">Sélectionner une catégorie</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id.toString()} className="bg-white dark:bg-gray-800">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Nom <span className="text-red-500">*</span></label>
                                <input
                                    className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: Visa USA"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Slug <span className="text-red-500">*</span></label>
                                <input
                                    className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Ex: visa-usa"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    aria-invalid={!!errors.slug}
                                />
                                {errors.slug && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Prix <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    value={data.price}
                                    onChange={(e) => setData('price', Number(e.target.value))}
                                    aria-invalid={!!errors.price}
                                />
                                {errors.price && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.price}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Description</label>
                                <textarea
                                    rows={4}
                                    className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="Description du service..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    aria-invalid={!!errors.description}
                                />
                                {errors.description && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Galerie d'images</label>
                                    <button
                                        type="button"
                                        onClick={addGalleryImage}
                                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        + Ajouter une image
                                    </button>
                                </div>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {galleryImages.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <div className="h-32 w-full rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                <img src={img.preview} className="h-full w-full object-cover" alt={`Preview ${index + 1}`} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            <div className="mt-1">
                                                <label className="block text-xs text-gray-600 dark:text-gray-400">Ordre</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="mt-1 block w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs"
                                                    value={img.displayOrder}
                                                    onChange={(e) => updateGalleryImageOrder(index, Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {galleryImages.length === 0 && (
                                        <div className="col-span-full text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune image. Cliquez sur "Ajouter une image" pour en ajouter.</p>
                                        </div>
                                    )}
                                </div>
                                {errors.gallery_images && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.gallery_images}</p>}
                            </div>

                            <div className="md:col-span-2 flex flex-wrap gap-6">
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">Actif</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-[var(--primary)]"
                                        checked={data.show_price}
                                        onChange={(e) => setData('show_price', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">Afficher le prix du service</span>
                                </label>
                                <label className="inline-flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                        checked={data.requires_appointment}
                                        onChange={(e) => setData('requires_appointment', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-800 dark:text-gray-200">Rendez-vous requis</span>
                                </label>
                            </div>

                            {data.requires_appointment && (
                                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Mode de tarification pour ce service</label>
                                    <select
                                        className="block w-full md:w-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                        value={data.appointment_pricing_mode}
                                        onChange={(e) => setData('appointment_pricing_mode', e.target.value as 'service_plus_appointment' | 'appointment_only')}
                                    >
                                        <option value="service_plus_appointment" className="bg-white dark:bg-gray-800">Prix du service + Prix du rendez-vous</option>
                                        <option value="appointment_only" className="bg-white dark:bg-gray-800">Prix du rendez-vous uniquement</option>
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {data.appointment_pricing_mode === 'appointment_only' 
                                            ? "Le client paiera uniquement les frais de rendez-vous (le prix du service ne sera pas facturé)"
                                            : "Le client paiera le prix du service plus les frais de rendez-vous"}
                                    </p>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* Sous-services */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold dark:text-gray-200">Sous-services</h2>
                            <button
                                type="button"
                                onClick={addSubService}
                                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {subServices.map((sub, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Sous-service {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeSubService(index)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                                                value={sub.name}
                                                onChange={(e) => updateSubService(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Slug</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={sub.slug}
                                                onChange={(e) => updateSubService(index, 'slug', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Prix</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={sub.price}
                                                onChange={(e) => updateSubService(index, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Actif</label>
                                            <input
                                                type="checkbox"
                                                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-[var(--primary)]"
                                                checked={sub.is_active}
                                                onChange={(e) => updateSubService(index, 'is_active', e.target.checked)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                                            <textarea
                                                rows={2}
                                                className="mt-1 block w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                                                value={sub.description}
                                                onChange={(e) => updateSubService(index, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {subServices.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucun sous-service. Cliquez sur "Ajouter" pour en créer un.</p>
                            )}
                        </div>
                    </section>

                    {/* Documents requis */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Documents requis</h2>
                            <button
                                type="button"
                                onClick={addRequiredDocument}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {requiredDocuments.map((doc, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Document {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeRequiredDocument(index)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={doc.name}
                                                onChange={(e) => updateRequiredDocument(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Ordre</label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={doc.order}
                                                onChange={(e) => updateRequiredDocument(index, 'order', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                                            <textarea
                                                rows={2}
                                                className="mt-1 block w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                                                value={doc.description}
                                                onChange={(e) => updateRequiredDocument(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                    checked={doc.is_required}
                                                    onChange={(e) => updateRequiredDocument(index, 'is_required', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300">Requis</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {requiredDocuments.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucun document requis. Cliquez sur "Ajouter" pour en créer un.</p>
                            )}
                        </div>
                    </section>

                    {/* Temps de traitement */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Temps de traitement</h2>
                            <button
                                type="button"
                                onClick={addProcessingTime}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {processingTimes.map((time, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Option {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeProcessingTime(index)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Libellé</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Express (24h)"
                                                value={time.duration_label}
                                                onChange={(e) => updateProcessingTime(index, 'duration_label', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Durée (heures)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={time.duration_hours}
                                                onChange={(e) => updateProcessingTime(index, 'duration_hours', Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Multiplicateur de prix</label>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={time.price_multiplier}
                                                onChange={(e) => updateProcessingTime(index, 'price_multiplier', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {processingTimes.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucun temps de traitement. Cliquez sur "Ajouter" pour en créer un.</p>
                            )}
                        </div>
                    </section>

                    {/* Destinations */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold dark:text-gray-200">Destinations</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sélectionnez les destinations pour lesquelles ce service est disponible.</p>
                        </div>
                        <div className="space-y-3">
                            {availableDestinations.map((destination) => {
                                const isSelected = selectedDestinations.some(d => d.id === destination.id);
                                const destinationData = selectedDestinations.find(d => d.id === destination.id);
                                return (
                                    <div key={destination.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex items-start gap-4">
                                            <label className="inline-flex items-center gap-2 cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-[var(--primary)]"
                                                    checked={isSelected}
                                                    onChange={() => toggleDestination(destination.id)}
                                                />
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {destination.flag_emoji && <span className="mr-2">{destination.flag_emoji}</span>}
                                                    {destination.name}
                                                    {destination.code && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({destination.code})</span>}
                                                </span>
                                            </label>
                                            {isSelected && (
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Prix spécifique (optionnel)</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            className="mt-1 block w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm"
                                                            placeholder="Laissez vide pour utiliser le prix par défaut"
                                                            value={destinationData?.price_override ?? ''}
                                                            onChange={(e) => updateDestination(destination.id, 'price_override', e.target.value ? Number(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="inline-flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-[var(--primary)]"
                                                                checked={destinationData?.is_active ?? true}
                                                                onChange={(e) => updateDestination(destination.id, 'is_active', e.target.checked)}
                                                            />
                                                            <span className="text-xs text-gray-700 dark:text-gray-300">Actif pour cette destination</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {availableDestinations.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucune destination disponible. Créez d'abord des destinations.</p>
                            )}
                        </div>
                    </section>

                    {/* Champs de formulaire personnalisés */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Champs de formulaire personnalisés</h2>
                                <p className="text-sm text-gray-600 mt-1">Définissez les champs supplémentaires que les clients devront remplir lors de la commande de ce service.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addFormField}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                + Ajouter un champ
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formFields.map((field, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">Champ {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeFormField(index)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Nom technique <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: package_weight"
                                                value={field.name}
                                                onChange={(e) => updateFormField(index, 'name', e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sans espaces ni caractères spéciaux</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Libellé <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Poids du colis (kg)"
                                                value={field.label}
                                                onChange={(e) => updateFormField(index, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Type de champ <span className="text-red-500">*</span></label>
                                            <select
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                value={field.type}
                                                onChange={(e) => updateFormField(index, 'type', e.target.value as FormField['type'])}
                                            >
                                                <option value="text">Texte</option>
                                                <option value="textarea">Zone de texte</option>
                                                <option value="number">Nombre</option>
                                                <option value="date">Date</option>
                                                <option value="select">Liste déroulante</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Placeholder</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Ex. 5.5"
                                                value={field.placeholder || ''}
                                                onChange={(e) => updateFormField(index, 'placeholder', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700">Texte d'aide</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Poids approximatif du colis en kilogrammes"
                                                value={field.helper_text || ''}
                                                onChange={(e) => updateFormField(index, 'helper_text', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                    checked={field.is_required}
                                                    onChange={(e) => updateFormField(index, 'is_required', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300">Requis</span>
                                            </label>
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                    checked={field.is_active}
                                                    onChange={(e) => updateFormField(index, 'is_active', e.target.checked)}
                                                />
                                                <span className="text-xs text-gray-700">Actif</span>
                                            </label>
                                        </div>
                                        {field.type === 'select' && (
                                            <div className="md:col-span-2 border-t pt-3 mt-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-medium text-gray-700">Options de la liste</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addFormFieldOption(index)}
                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                    >
                                                        + Ajouter une option
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {field.options?.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                                                                placeholder="Valeur"
                                                                value={option.value}
                                                                onChange={(e) => updateFormFieldOption(index, optIndex, 'value', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                                                                placeholder="Libellé"
                                                                value={option.label}
                                                                onChange={(e) => updateFormFieldOption(index, optIndex, 'label', e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFormFieldOption(index, optIndex)}
                                                                className="text-red-600 hover:text-red-700 text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!field.options || field.options.length === 0) && (
                                                        <p className="text-xs text-gray-500">Aucune option. Cliquez sur "Ajouter une option" pour en créer.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {formFields.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Aucun champ personnalisé défini.</p>
                                    <p className="text-xs text-gray-400">Ces champs apparaîtront dans le formulaire de commande pour ce service.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Link href="/admin/services" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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



























