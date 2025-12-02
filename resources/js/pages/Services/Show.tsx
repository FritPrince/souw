import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay, OrderStatusBadge, ServiceCard } from '@/components/public';
import services from '@/routes/services';
import { store as orderStore } from '@/routes/orders';
import { book as appointmentBook } from '@/routes/appointments';
import { Button } from '@/components/ui/button';

interface SubService {
    id: number;
    name: string;
    description?: string;
    price: number;
}

interface RequiredDocument {
    id: number;
    name: string;
    description?: string;
    is_required: boolean;
}

interface ProcessingTime {
    id: number;
    duration_label: string;
    duration_hours: number;
    price_multiplier: number;
}

interface ServiceImage {
    id: number;
    image_path: string;
    display_order: number;
}

interface Service {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    show_price: boolean;
    category?: {
        id: number;
        name: string;
        icon?: string;
    };
    destinations?: Array<{
        id: number;
        name: string;
        flag_emoji?: string;
    }>;
    sub_services?: SubService[];
    required_documents?: RequiredDocument[];
    processing_times?: ProcessingTime[];
    requires_appointment: boolean;
    appointment_pricing_mode?: 'service_plus_appointment' | 'appointment_only';
    form_fields?: ServiceFormFieldDefinition[];
    images?: ServiceImage[];
}

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select';

interface ServiceFormFieldDefinition {
    id: number;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string | null;
    is_required: boolean;
    helper_text?: string | null;
    options?: Array<{ value: string; label: string }>;
}

interface RelatedService {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    show_price: boolean;
    category?: {
        id: number;
        name: string;
        icon?: string;
    };
    destinations?: Array<{
        id: number;
        name: string;
        flag_emoji?: string;
    }>;
    image_path?: string;
    video_path?: string;
    media_type?: 'image' | 'video';
}

interface ServicesShowProps {
    service: Service;
    appointmentPrice?: number;
    relatedServices?: RelatedService[];
}

interface OrderFormData {
    service_id: number;
    sub_service_id: number | null;
    destination_id: number | null;
    processing_time_id: number | null;
    notes: string;
    additional_data: Record<string, unknown>;
}

export default function ServicesShow({ service, appointmentPrice = 0, relatedServices = [] }: ServicesShowProps) {
    const additionalFields = service.form_fields ?? [];
    const galleryImages = service.images || [];
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    
    // Carrousel automatique
    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    useEffect(() => {
        if (relatedServices.length === 0 || isPaused) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                if (prev >= relatedServices.length - 1) {
                    return 0; // Retour au début
                }
                return prev + 1;
            });
        }, 4000); // Défilement toutes les 4 secondes
        
        return () => clearInterval(interval);
    }, [relatedServices.length, isPaused]);
    
    useEffect(() => {
        if (carouselRef.current) {
            const cardWidth = 320; // Largeur d'une carte + gap
            const scrollPosition = currentIndex * cardWidth;
            carouselRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
        }
    }, [currentIndex]);

    const { data, setData, processing } = useForm<OrderFormData>({
        service_id: service.id,
        sub_service_id: null as number | null,
        destination_id: null as number | null,
        processing_time_id: null as number | null,
        notes: '',
        additional_data: {},
    });

    const handleAdditionalFieldChange = (
        field: ServiceFormFieldDefinition,
        value: string | number,
    ) => {
        setData('additional_data', {
            ...data.additional_data,
            [field.name]: value,
        });
    };

    const handleOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (service.requires_appointment) {
            // Rediriger vers la page de réservation
            router.visit(appointmentBook.url({ query: { service_id: service.id } }));
        } else {
            // Log data before sending
            console.log('=== ORDER SUBMISSION ===');
            console.log('Full data object:', data);
            console.log('additional_data:', data.additional_data);
            console.log('additional_data keys:', data.additional_data ? Object.keys(data.additional_data) : []);
            console.log('additional_data values:', data.additional_data);
            
            // Créer directement la commande
            router.post(orderStore.url(), data, {
                onError: (errors) => {
                    console.error('Order submission errors:', errors);
                },
                onSuccess: () => {
                    console.log('Order submitted successfully');
                },
            });
        }
    };

    const calculatePrice = () => {
        // Si le service requiert un rendez-vous, utiliser le mode de tarification
        if (service.requires_appointment) {
            const pricingMode = service.appointment_pricing_mode || 'service_plus_appointment';
            
            if (pricingMode === 'appointment_only') {
                // Mode: Prix du rendez-vous uniquement
                return appointmentPrice;
            }
            
            // Mode: Prix du service + Prix du rendez-vous
            let basePrice = service.price;
            const subService = service.sub_services?.find(
                (s) => s.id === data.sub_service_id,
            );
            if (subService) {
                basePrice = subService.price;
            }
            const processingTime = service.processing_times?.find(
                (pt) => pt.id === data.processing_time_id,
            );
            if (processingTime) {
                basePrice *= processingTime.price_multiplier;
            }
            return basePrice + appointmentPrice;
        }
        
        // Service sans rendez-vous : calcul normal
        let basePrice = service.price;
        const subService = service.sub_services?.find(
            (s) => s.id === data.sub_service_id,
        );
        if (subService) {
            basePrice = subService.price;
        }
        const processingTime = service.processing_times?.find(
            (pt) => pt.id === data.processing_time_id,
        );
        if (processingTime) {
            basePrice *= processingTime.price_multiplier;
        }
        return basePrice;
    };

    return (
        <PublicLayout>
            <Head title={`${service.name} - SouwTravel`} />

            {/* Breadcrumb */}
            <section className="bg-gray-50 dark:bg-gray-900 py-4 border-b dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={services.index()}
                            className="text-gray-600 dark:text-gray-400 hover:text-primary"
                        >
                            Services
                        </Link>
                        <i className="las la-angle-right text-gray-400 dark:text-gray-600"></i>
                                {service.category && (
                                    <>
                                        <Link
                                            href={services.index({ query: { category: service.category.id } })}
                                            className="text-gray-600 dark:text-gray-400 hover:text-primary"
                                        >
                                            {service.category.name}
                                        </Link>
                                        <i className="las la-angle-right text-gray-400 dark:text-gray-600"></i>
                                    </>
                                )}
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {service.name}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Service Details */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Content with contextual illustration */}
                        <div className="lg:col-span-2">
                            {/* Gallery d'images */}
                            {galleryImages.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800/50 p-6 mb-6">
                                    <div className="space-y-4">
                                        {/* Image principale */}
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={galleryImages[selectedImageIndex]?.image_path}
                                                alt={`${service.name} - Image ${selectedImageIndex + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {galleryImages.length > 1 && (
                                                <>
                                                    {/* Bouton précédent */}
                                                    {selectedImageIndex > 0 && (
                                                        <button
                                                            onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full p-2 shadow-lg transition-all"
                                                            aria-label="Image précédente"
                                                        >
                                                            <i className="las la-chevron-left text-xl"></i>
                                                        </button>
                                                    )}
                                                    {/* Bouton suivant */}
                                                    {selectedImageIndex < galleryImages.length - 1 && (
                                                        <button
                                                            onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full p-2 shadow-lg transition-all"
                                                            aria-label="Image suivante"
                                                        >
                                                            <i className="las la-chevron-right text-xl"></i>
                                                        </button>
                                                    )}
                                                    {/* Indicateur de position */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {galleryImages.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedImageIndex(index)}
                                                            className={`h-2 rounded-full transition-all ${
                                                                index === selectedImageIndex
                                                                    ? 'w-8 bg-white dark:bg-gray-300'
                                                                    : 'w-2 bg-white/50 dark:bg-gray-600/50 hover:bg-white/75 dark:hover:bg-gray-600/75'
                                                            }`}
                                                            aria-label={`Aller à l'image ${index + 1}`}
                                                        />
                                                    ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Miniatures */}
                                        {galleryImages.length > 1 && (
                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                                {galleryImages.map((img, index) => (
                                                    <button
                                                        key={img.id}
                                                        onClick={() => setSelectedImageIndex(index)}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                            index === selectedImageIndex
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                        aria-label={`Voir l'image ${index + 1}`}
                                                    >
                                                        <img
                                                            src={img.image_path}
                                                            alt={`${service.name} - Miniature ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {index === selectedImageIndex && (
                                                            <div className="absolute inset-0 bg-primary/10"></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800/50 p-8 mb-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        {service.category && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                {service.category.icon && (
                                                    <i
                                                        className={
                                                            service.category.icon
                                                        }
                                                    ></i>
                                                )}
                                                <span>{service.category.name}</span>
                                            </div>
                                        )}
                                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                            {service.name}
                                        </h1>
                                    </div>
                                    {service.show_price && (
                                        <div className="text-right ml-4">
                                            <PriceDisplay
                                                amount={calculatePrice()}
                                                size="lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {service.description && (
                                    <div className="prose max-w-none mb-8 dark:prose-invert">
                                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                                            <div className="whitespace-pre-line">{service.description}</div>
                                        </div>
                                    </div>
                                )}

                                {service.destinations &&
                                    service.destinations.length > 0 && (
                                        <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                <i className="las la-globe text-primary text-xl"></i>
                                                Destinations disponibles
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {service.destinations.map(
                                                    (destination) => (
                                                        <span
                                                            key={destination.id}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                                                        >
                                                            {destination.flag_emoji && (
                                                                <span className="text-lg">
                                                                    {
                                                                        destination.flag_emoji
                                                                    }
                                                                </span>
                                                            )}
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                {destination.name}
                                                            </span>
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {service.required_documents &&
                                    service.required_documents.length > 0 && (
                                        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                <i className="las la-file-alt text-amber-600 dark:text-amber-400 text-xl"></i>
                                                Documents requis
                                            </h3>
                                            <ul className="space-y-3">
                                                {service.required_documents.map(
                                                    (doc) => (
                                                        <li
                                                            key={doc.id}
                                                            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-amber-800/50"
                                                        >
                                                            <div className="flex-shrink-0 mt-0.5">
                                                                <i className="las la-file-alt text-amber-600 dark:text-amber-400 text-xl"></i>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                        {doc.name}
                                                                    </span>
                                                                    {doc.is_required && (
                                                                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full font-medium">
                                                                            Requis
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {doc.description && (
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                        {
                                                                            doc.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {service.processing_times &&
                                    service.processing_times.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                                <i className="las la-clock text-primary text-xl"></i>
                                                Délais de traitement
                                            </h3>
                                            <div className="space-y-3">
                                                {service.processing_times.map(
                                                    (pt) => (
                                                        <label
                                                            key={pt.id}
                                                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                                data.processing_time_id === pt.id
                                                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="processing_time"
                                                                value={pt.id}
                                                                checked={
                                                                    data.processing_time_id ===
                                                                    pt.id
                                                                }
                                                                onChange={() =>
                                                                    setData(
                                                                        'processing_time_id',
                                                                        pt.id,
                                                                    )
                                                                }
                                                                className="text-primary w-5 h-5"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                        {
                                                                            pt.duration_label
                                                                        }
                                                                    </span>
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                        <i className="las la-clock mr-1"></i>
                                                                        {pt.duration_hours}{' '}
                                                                        heures
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {service.show_price && (
                                                                <div className="text-right">
                                                                    <PriceDisplay
                                                                        amount={
                                                                            service.price *
                                                                            pt.price_multiplier
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </div>
                                                            )}
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {service.sub_services &&
                                service.sub_services.length > 0 && (
                                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800/50 p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                            <i className="las la-list-ul text-primary text-2xl"></i>
                                            Sous-services disponibles
                                        </h2>
                                        <div className="space-y-3">
                                            {service.sub_services.map(
                                                (subService) => (
                                                    <label
                                                        key={subService.id}
                                                        className={`flex items-center gap-4 p-5 border-2 rounded-lg cursor-pointer transition-all ${
                                                            data.sub_service_id === subService.id
                                                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="sub_service"
                                                            value={subService.id}
                                                            checked={
                                                                data.sub_service_id ===
                                                                subService.id
                                                            }
                                                            onChange={() =>
                                                                setData(
                                                                    'sub_service_id',
                                                                    subService.id,
                                                                )
                                                            }
                                                            className="text-primary w-5 h-5"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {
                                                                        subService.name
                                                                    }
                                                                </h3>
                                                                {service.show_price && (
                                                                    <PriceDisplay
                                                                        amount={subService.price}
                                                                        size="sm"
                                                                    />
                                                                )}
                                                            </div>
                                                            {subService.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                    {
                                                                        subService.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Sidebar - Order Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg dark:shadow-gray-800/50 p-6 sticky top-4 border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                    <i className="las la-shopping-cart text-primary text-2xl"></i>
                                    Commander ce service
                                </h2>

                                <form onSubmit={handleOrder} className="space-y-4">
                                    {additionalFields.length > 0 && (
                                        <div className="border border-primary/10 dark:border-primary/20 rounded-lg p-4 bg-primary/5 dark:bg-primary/10 space-y-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-primary dark:text-primary-foreground mb-1">
                                                    Informations complémentaires
                                                </h3>
                                                    <p className="text-xs text-primary/80 dark:text-primary-foreground/80">
                                                    Ces précisions nous permettent de personnaliser le service{' '}
                                                    {service.name.toLowerCase()} sans devoir modifier le code lorsque de
                                                    nouvelles offres arrivent.
                                                    </p>
                                            </div>

                        <div className="space-y-3">
                                                {additionalFields.map((field) => {
                                                    const rawValue =
                                                        (data.additional_data?.[field.name] ??
                                                            '') as string | number;
                                                    const commonClasses =
                                                        'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60';
                                                    const isRequired = field.is_required;

                                                    if (field.type === 'textarea') {
                                                    return (
                                                            <div key={field.id} className="flex flex-col gap-1">
                                                            <label
                                                                htmlFor={field.name}
                                                                className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                                            >
                                                                {field.label}
                                                                    {isRequired && (
                                                                        <span className="text-red-500 ml-1">*</span>
                                                                )}
                                                            </label>
                                                                <textarea
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    className={commonClasses}
                                                                    placeholder={field.placeholder ?? undefined}
                                                                    rows={3}
                                                                    required={isRequired}
                                                                    value={rawValue as string}
                                                                    onChange={(event) =>
                                                                        handleAdditionalFieldChange(
                                                                            field,
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                                {field.helper_text && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {field.helper_text}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    if (field.type === 'select') {
                                                        return (
                                                            <div key={field.id} className="flex flex-col gap-1">
                                                                <label
                                                                    htmlFor={field.name}
                                                                    className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                                                >
                                                                    {field.label}
                                                                    {isRequired && (
                                                                        <span className="text-red-500 ml-1">*</span>
                                                                    )}
                                                                </label>
                                                                <select
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    className={commonClasses}
                                                                    required={isRequired}
                                                                    value={rawValue as string}
                                                                    onChange={(event) =>
                                                                        handleAdditionalFieldChange(
                                                                            field,
                                                                            event.target.value,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="" className="bg-white dark:bg-gray-800">Sélectionner…</option>
                                                                    {field.options?.map((option) => (
                                                                        <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {field.helper_text && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {field.helper_text}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={field.id} className="flex flex-col gap-1">
                                                            <label
                                                                htmlFor={field.name}
                                                                className="text-sm font-medium text-gray-800 dark:text-gray-200"
                                                            >
                                                                {field.label}
                                                                {isRequired && (
                                                                    <span className="text-red-500 ml-1">*</span>
                                                                )}
                                                            </label>
                                                                <input
                                                                    id={field.name}
                                                                    name={field.name}
                                                                    type={
                                                                        field.type === 'number'
                                                                            ? 'number'
                                                                            : field.type === 'date'
                                                                                ? 'date'
                                                                                : 'text'
                                                                    }
                                                                    className={commonClasses}
                                                                placeholder={field.placeholder ?? undefined}
                                                                required={isRequired}
                                                                    value={rawValue as string | number}
                                                                    onChange={(event) =>
                                                                        handleAdditionalFieldChange(
                                                                            field,
                                                                            field.type === 'number'
                                                                                ? Number(event.target.value)
                                                                                : event.target.value,
                                                                        )
                                                                    }
                                                                />
                                                            {field.helper_text && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {field.helper_text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Afficher la sélection de destination uniquement pour les services sans rendez-vous */}
                                    {!service.requires_appointment && service.destinations && service.destinations.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Destination
                                            </label>
                                            <select
                                                value={
                                                    data.destination_id || ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'destination_id',
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="" className="bg-white dark:bg-gray-800">
                                                    Sélectionner une
                                                    destination
                                                </option>
                                                {service.destinations.map(
                                                    (dest) => (
                                                        <option
                                                            key={dest.id}
                                                            value={dest.id}
                                                            className="bg-white dark:bg-gray-800"
                                                        >
                                                            {dest.flag_emoji || ''}{' '}
                                                            {dest.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Notes (optionnel)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Ajoutez des informations supplémentaires..."
                                        />
                                    </div>

                                    <div className="border-t pt-4">
                                        {service.show_price && (
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    Total
                                                </span>
                                                <PriceDisplay
                                                    amount={calculatePrice()}
                                                    size="lg"
                                                />
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            {processing
                                                ? 'Traitement...'
                                                : service.requires_appointment
                                                  ? 'Réserver un rendez-vous'
                                                  : 'Commander maintenant'}
                                        </Button>
                                    </div>
                                </form>

                                {service.requires_appointment && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2 border border-blue-100 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            <i className="las la-calendar mr-2"></i>
                                            Ce service nécessite un rendez-vous. Vous
                                            pourrez choisir un créneau disponible après
                                            avoir cliqué sur le bouton ci-dessus.
                                        </p>
                                        {service.appointment_pricing_mode === 'appointment_only' ? (
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                <i className="las la-info-circle mr-1"></i>
                                                Frais de rendez-vous uniquement
                                            </p>
                                        ) : appointmentPrice > 0 && (
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                <i className="las la-info-circle mr-1"></i>
                                                Prix du service + {new Intl.NumberFormat('fr-FR').format(appointmentPrice)} FCFA (frais de rendez-vous)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Articles connexes - Carrousel automatique */}
            {relatedServices.length > 0 && (
                <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-gray-900 dark:via-gray-900 dark:to-primary/10">
                    <div className="container mx-auto px-4">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-center gap-3">
                                <i className="las la-th-large text-primary text-3xl"></i>
                                Articles connexes
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">Découvrez d'autres services qui pourraient vous intéresser</p>
                        </div>
                        
                        <div 
                            className="relative"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {/* Carrousel */}
                            <div
                                ref={carouselRef}
                                className="flex gap-6 overflow-x-hidden scroll-smooth"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                }}
                            >
                                {relatedServices.map((relatedService) => (
                                    <div
                                        key={relatedService.id}
                                        className="flex-shrink-0 w-80"
                                    >
                                        <ServiceCard
                                            service={{
                                                id: relatedService.id,
                                                name: relatedService.name,
                                                slug: relatedService.slug,
                                                description: relatedService.description,
                                                price: relatedService.price,
                                                category: relatedService.category,
                                                destinations: relatedService.destinations,
                                                image_path: relatedService.image_path,
                                                video_path: relatedService.video_path,
                                                media_type: relatedService.media_type,
                                            }}
                                            className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Gradient overlay pour un effet de fade sur les bords */}
                            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10"></div>
                            
                            {/* Boutons de navigation (optionnels, pour navigation manuelle) */}
                            {relatedServices.length > 3 && (
                                <>
                                    <button
                                        onClick={() => setCurrentIndex((prev) => prev > 0 ? prev - 1 : relatedServices.length - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-3 shadow-lg transition-all z-20 hover:scale-110"
                                        aria-label="Service précédent"
                                    >
                                        <i className="las la-chevron-left text-2xl"></i>
                                    </button>
                                    <button
                                        onClick={() => setCurrentIndex((prev) => prev < relatedServices.length - 1 ? prev + 1 : 0)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-3 shadow-lg transition-all z-20 hover:scale-110"
                                        aria-label="Service suivant"
                                    >
                                        <i className="las la-chevron-right text-2xl"></i>
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Indicateurs de progression */}
                        {relatedServices.length > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {relatedServices.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            index === currentIndex
                                                ? 'w-8 bg-primary'
                                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Aller au service ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}

