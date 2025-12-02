import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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

interface SubService {
    id?: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    is_active: boolean;
}

interface RequiredDocument {
    id?: number;
    name: string;
    description: string;
    is_required: boolean;
    order: number;
}

interface ProcessingTime {
    id?: number;
    duration_label: string;
    duration_hours: number;
    price_multiplier: number;
}

interface FormField {
    id?: number;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select';
    placeholder?: string;
    is_required: boolean;
    helper_text?: string;
    options?: Array<{ value: string; label: string }>;
    is_active: boolean;
}

interface ServiceImage {
    id: number;
    image_path: string;
    display_order: number;
}

interface GalleryImage {
    id?: number; // Si présent, c'est une image existante
    file: File | null; // Si présent, c'est une nouvelle image
    preview: string;
    displayOrder: number;
    isDeleted?: boolean; // Pour marquer les images existantes à supprimer
}

interface Service {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    image_path?: string;
    price: number;
    show_price: boolean;
    is_active: boolean;
    requires_appointment: boolean;
    appointment_pricing_mode?: 'service_plus_appointment' | 'appointment_only';
    subServices?: SubService[];
    requiredDocuments?: RequiredDocument[];
    processingTimes?: ProcessingTime[];
    formFields?: FormField[];
    images?: ServiceImage[];
    destinations?: Array<{
        id: number;
        name: string;
        slug: string;
        code?: string;
        flag_emoji?: string;
        pivot?: {
            price_override?: number | null;
            is_active: boolean;
        };
    }>;
}

interface Props {
    service: Service;
    categories: Category[];
    destinations: Destination[];
}

export default function Edit({ service: initialService, categories, destinations: availableDestinations }: Props) {
    const { props } = usePage<{ service: Service; categories: Category[]; destinations: Destination[] }>();
    const service = props.service;
    const destinations = props.destinations || availableDestinations || [];
    
    // Initialize gallery images from service
    const initializeGalleryImages = (): GalleryImage[] => {
        if (!service.images || service.images.length === 0) {
            return [];
        }
        return service.images.map((img) => ({
            id: img.id,
            file: null,
            preview: img.image_path,
            displayOrder: img.display_order,
            isDeleted: false,
        }));
    };
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initializeGalleryImages());
    const [subServices, setSubServices] = useState<SubService[]>(service.subServices || []);
    const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>(service.requiredDocuments || []);
    const [processingTimes, setProcessingTimes] = useState<ProcessingTime[]>(service.processingTimes || []);
    
    // Initialize selected destinations from service
    const initializeDestinations = (): ServiceDestination[] => {
        if (!service.destinations || service.destinations.length === 0) {
            return [];
        }
        return service.destinations.map(dest => ({
            id: dest.id,
            price_override: dest.pivot?.price_override ?? null,
            is_active: dest.pivot?.is_active ?? true,
        }));
    };
    const [selectedDestinations, setSelectedDestinations] = useState<ServiceDestination[]>(initializeDestinations());
    // Normalize form fields from backend (ensure all fields have correct types)
    const normalizeFormFields = (fields: any[]): FormField[] => {
        return (fields || []).map((field) => ({
            id: field.id,
            name: field.name || '',
            label: field.label || '',
            type: (field.type || 'text') as FormField['type'],
            placeholder: field.placeholder || '',
            is_required: field.is_required ?? false,
            helper_text: field.helper_text || '',
            options: Array.isArray(field.options) ? field.options : [],
            is_active: field.is_active ?? true,
        }));
    };

    const initialFormFields = normalizeFormFields(service.formFields || []);
    console.log('Initial formFields from service:', initialFormFields);
    console.log('Service formFields raw:', service.formFields);
    
    const [formFields, setFormFields] = useState<FormField[]>(initialFormFields);

    // Update formFields when service data changes (after reload)
    useEffect(() => {
        const normalized = normalizeFormFields(props.service.formFields || []);
        console.log('useEffect triggered - service.formFields:', props.service.formFields);
        console.log('useEffect - normalized fields:', normalized);
        setFormFields((currentFields) => {
            console.log('Current formFields in state:', currentFields);
            // Only update if the data actually changed
            const currentFieldsJson = JSON.stringify(currentFields.map(f => ({ name: f.name, label: f.label })));
            const newFieldsJson = JSON.stringify(normalized.map(f => ({ name: f.name, label: f.label })));
            if (currentFieldsJson !== newFieldsJson) {
                console.log('Updating formFields from service data:', normalized);
                return normalized;
            }
            console.log('No update needed - fields are the same');
            return currentFields;
        });
    }, [props.service.formFields]);

    // Update destinations when service data changes (after reload)
    useEffect(() => {
        if (!props.service.destinations || props.service.destinations.length === 0) {
            setSelectedDestinations([]);
            return;
        }
        const newDestinations = props.service.destinations.map(dest => ({
            id: dest.id,
            price_override: dest.pivot?.price_override ?? null,
            is_active: dest.pivot?.is_active ?? true,
        }));
        setSelectedDestinations(newDestinations);
    }, [props.service.destinations]);

    // Update requiredDocuments when service data changes (after reload)
    useEffect(() => {
        if (!props.service.requiredDocuments || props.service.requiredDocuments.length === 0) {
            setRequiredDocuments([]);
            return;
        }
        const normalized = (props.service.requiredDocuments || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name || '',
            description: doc.description || '',
            is_required: doc.is_required ?? true,
            order: doc.order ?? 0,
        }));
        setRequiredDocuments(normalized);
    }, [props.service.requiredDocuments]);

    // Update processingTimes when service data changes (after reload)
    useEffect(() => {
        if (!props.service.processingTimes || props.service.processingTimes.length === 0) {
            setProcessingTimes([]);
            return;
        }
        const normalized = (props.service.processingTimes || []).map((time: any) => ({
            id: time.id,
            duration_label: time.duration_label || '',
            duration_hours: time.duration_hours ?? 0,
            price_multiplier: time.price_multiplier ?? 1.0,
        }));
        setProcessingTimes(normalized);
    }, [props.service.processingTimes]);

    // Update gallery images when service data changes (after reload)
    useEffect(() => {
        if (!props.service.images || props.service.images.length === 0) {
            setGalleryImages([]);
            return;
        }
        const normalized = props.service.images.map((img: any) => ({
            id: img.id,
            file: null,
            preview: img.image_path,
            displayOrder: img.display_order,
            isDeleted: false,
        }));
        setGalleryImages(normalized);
    }, [props.service.images]);

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
        category_id: service.category_id.toString(),
        name: service.name || '',
        slug: service.slug || '',
        description: service.description || '',
        price: service.price || 0,
        show_price: service.show_price ?? true,
        is_active: service.is_active ?? true,
        requires_appointment: service.requires_appointment ?? false,
        appointment_pricing_mode: (service.appointment_pricing_mode || 'service_plus_appointment') as 'service_plus_appointment' | 'appointment_only',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('=== BEFORE FILTER ===');
        console.log('formFields state:', formFields);
        console.log('formFields count:', formFields.length);
        formFields.forEach((field, idx) => {
            console.log(`Field ${idx}:`, { name: field.name, label: field.label, type: field.type, id: field.id });
        });
        
        // Filter out empty fields before sending
        const validFormFields = formFields.filter(
            (field) => {
                const isValid = field.name.trim() !== '' && field.label.trim() !== '';
                if (!isValid) {
                    console.log('Filtering out invalid field:', field);
                }
                return isValid;
            }
        );
        
        // When using forceFormData, complex arrays need to be JSON stringified
        const payload: any = {
            ...data,
            sub_services: JSON.stringify(subServices),
            required_documents: JSON.stringify(requiredDocuments),
            processing_times: JSON.stringify(processingTimes),
            form_fields: JSON.stringify(validFormFields),
            destinations: JSON.stringify(selectedDestinations),
            _method: 'put',
        };

        // Add gallery images - nouvelles images et images existantes à conserver
        const imagesToKeep: number[] = [];
        let newImageIndex = 0;
        
        galleryImages.forEach((img) => {
            if (img.isDeleted) {
                // Ne pas inclure les images marquées pour suppression
                return;
            }
            if (img.id) {
                // Image existante à conserver
                imagesToKeep.push(img.id);
            } else if (img.file) {
                // Nouvelle image à uploader - utiliser une syntaxe simple
                payload[`gallery_image_${newImageIndex}`] = img.file;
                payload[`gallery_image_order_${newImageIndex}`] = img.displayOrder;
                newImageIndex++;
            }
        });
        payload['gallery_images_keep'] = JSON.stringify(imagesToKeep);
        payload['gallery_images_orders'] = JSON.stringify(
            galleryImages
                .filter((img) => !img.isDeleted && img.id)
                .map((img) => ({ id: img.id, order: img.displayOrder }))
        );

        console.log('=== FORM SUBMISSION ===');
        console.log('All formFields in state:', formFields);
        console.log('Valid formFields to send:', validFormFields);
        console.log('Form fields count:', validFormFields.length);
        console.log('Form fields JSON:', JSON.stringify(validFormFields));
        console.log('Full payload keys:', Object.keys(payload));
        
        console.log('edit:120 Destinations in payload:', selectedDestinations);
        console.log('edit:120 Destinations type:', typeof selectedDestinations);
        
        router.post(`/admin/services/${service.id}`, payload, { 
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
            onSuccess: (page) => {
                console.log('Form submitted successfully');
                console.log('Page data received:', page);
                
                const pageProps = page?.props as { service?: Service } | undefined;
                const serviceData = pageProps?.service;
                
                console.log('Service in page data:', serviceData);
                console.log('FormFields in page data:', serviceData?.formFields);
                
                // Log destinations enregistrées
                const savedDestinations = serviceData?.destinations || [];
                if (savedDestinations.length > 0) {
                    console.log('✅ Destinations enregistrées pour ce service:');
                    savedDestinations.forEach((dest) => {
                        console.log(`  - ${dest.name} (ID: ${dest.id}) - Prix override: ${dest.pivot?.price_override ?? 'Aucun'} - Actif: ${dest.pivot?.is_active ? 'Oui' : 'Non'}`);
                    });
                } else {
                    console.log('⚠️ Aucune destination enregistrée pour ce service');
                }
            },
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
        if (!data.slug || data.slug === generateSlug(service.name)) {
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
        const newField = { name: '', label: '', type: 'text' as const, is_required: false, is_active: true };
        console.log('Adding new field. Current fields:', formFields);
        setFormFields([...formFields, newField]);
        console.log('After adding - new state will have:', formFields.length + 1, 'fields');
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
        // Si c'est une image existante, la marquer comme supprimée
        if (image.id) {
            const updated = [...galleryImages];
            updated[index].isDeleted = true;
            setGalleryImages(updated);
        } else {
            // Si c'est une nouvelle image, la supprimer complètement
            const updated = galleryImages.filter((_, i) => i !== index);
            updated.forEach((img, i) => {
                img.displayOrder = i;
            });
            setGalleryImages(updated);
        }
    };

    const updateGalleryImageOrder = (index: number, newOrder: number) => {
        const updated = [...galleryImages];
        updated[index].displayOrder = newOrder;
        setGalleryImages(updated);
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Services', href: '/admin/services' }, { title: 'Éditer', href: `/admin/services/${service.id}/edit` }]}>
            <div className="p-6">
                <Head title={`Éditer ${service.name}`} />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold dark:text-gray-200">Éditer le service</h1>
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
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id.toString()}>
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
                                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        + Ajouter une image
                                    </button>
                                </div>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {galleryImages
                                        .map((img, originalIndex) => ({ img, originalIndex }))
                                        .filter(({ img }) => !img.isDeleted)
                                        .map(({ img, originalIndex }, displayIndex) => (
                                        <div key={img.id || `new-${originalIndex}`} className="relative group">
                                            <div className="h-32 w-full rounded-md overflow-hidden bg-gray-100">
                                                <img src={img.preview} className="h-full w-full object-cover" alt={`Preview ${displayIndex + 1}`} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(originalIndex)}
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
                                                    onChange={(e) => updateGalleryImageOrder(originalIndex, Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {galleryImages.filter((img) => !img.isDeleted).length === 0 && (
                                        <div className="col-span-full text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune image. Cliquez sur "Ajouter une image" pour en ajouter.</p>
                                        </div>
                                    )}
                                </div>
                                {errors.gallery_images && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.gallery_images}</p>}
                            </div>

                            <div className="md:col-span-2 flex gap-6">
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
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 accent-[var(--primary)]"
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
                                        className="block w-full md:w-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                                        value={data.appointment_pricing_mode}
                                        onChange={(e) => setData('appointment_pricing_mode', e.target.value as 'service_plus_appointment' | 'appointment_only')}
                                    >
                                        <option value="service_plus_appointment">Prix du service + Prix du rendez-vous</option>
                                        <option value="appointment_only">Prix du rendez-vous uniquement</option>
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
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
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
                            <h2 className="text-lg font-semibold dark:text-gray-200">Documents requis</h2>
                            <button
                                type="button"
                                onClick={addRequiredDocument}
                                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {requiredDocuments.map((doc, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Document {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeRequiredDocument(index)}
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
                                <p className="text-sm text-gray-500 text-center py-4">Aucun document requis. Cliquez sur "Ajouter" pour en créer un.</p>
                            )}
                        </div>
                    </section>

                    {/* Temps de traitement */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold dark:text-gray-200">Temps de traitement</h2>
                            <button
                                type="button"
                                onClick={addProcessingTime}
                                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                + Ajouter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {processingTimes.map((time, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Option {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeProcessingTime(index)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Libellé</label>
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
                            <h2 className="text-lg font-semibold">Destinations</h2>
                            <p className="text-sm text-gray-600 mt-1">Sélectionnez les destinations pour lesquelles ce service est disponible.</p>
                        </div>
                        <div className="space-y-3">
                            {destinations.map((destination) => {
                                const isSelected = selectedDestinations.some(d => d.id === destination.id);
                                const destinationData = selectedDestinations.find(d => d.id === destination.id);
                                return (
                                    <div key={destination.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            <label className="inline-flex items-center gap-2 cursor-pointer flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                    checked={isSelected}
                                                    onChange={() => toggleDestination(destination.id)}
                                                />
                                                <span className="font-medium text-gray-900">
                                                    {destination.flag_emoji && <span className="mr-2">{destination.flag_emoji}</span>}
                                                    {destination.name}
                                                    {destination.code && <span className="text-xs text-gray-500 ml-2">({destination.code})</span>}
                                                </span>
                                            </label>
                                            {isSelected && (
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700">Prix spécifique (optionnel)</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                            placeholder="Laissez vide pour utiliser le prix par défaut"
                                                            value={destinationData?.price_override ?? ''}
                                                            onChange={(e) => updateDestination(destination.id, 'price_override', e.target.value ? Number(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <label className="inline-flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                                checked={destinationData?.is_active ?? true}
                                                                onChange={(e) => updateDestination(destination.id, 'is_active', e.target.checked)}
                                                            />
                                                            <span className="text-xs text-gray-700">Actif pour cette destination</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {destinations.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Aucune destination disponible. Créez d'abord des destinations.</p>
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
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nom technique <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: package_weight"
                                                value={field.name}
                                                onChange={(e) => updateFormField(index, 'name', e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Sans espaces ni caractères spéciaux</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Libellé <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                                                placeholder="Ex: Poids du colis (kg)"
                                                value={field.label}
                                                onChange={(e) => updateFormField(index, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Type de champ <span className="text-red-500">*</span></label>
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
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Texte d'aide</label>
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
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Options de la liste</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addFormFieldOption(index)}
                                                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                    >
                                                        + Ajouter une option
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {field.options?.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs"
                                                                placeholder="Valeur"
                                                                value={option.value}
                                                                onChange={(e) => updateFormFieldOption(index, optIndex, 'value', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 text-xs"
                                                                placeholder="Libellé"
                                                                value={option.label}
                                                                onChange={(e) => updateFormFieldOption(index, optIndex, 'label', e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFormFieldOption(index, optIndex)}
                                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!field.options || field.options.length === 0) && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Aucune option. Cliquez sur "Ajouter une option" pour en créer.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {formFields.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Aucun champ personnalisé défini.</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Ces champs apparaîtront dans le formulaire de commande pour ce service.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-800">
                        <Link href="/admin/services" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 dark:ring-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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













