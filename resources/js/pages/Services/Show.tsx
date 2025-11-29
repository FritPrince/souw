import { Head, Link, useForm, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay, OrderStatusBadge } from '@/components/public';
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

interface ServicesShowProps {
    service: Service;
    appointmentPrice?: number;
}

interface OrderFormData {
    service_id: number;
    sub_service_id: number | null;
    destination_id: number | null;
    processing_time_id: number | null;
    notes: string;
    additional_data: Record<string, unknown>;
}

export default function ServicesShow({ service, appointmentPrice = 0 }: ServicesShowProps) {
    const additionalFields = service.form_fields ?? [];

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
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={services.index()}
                            className="text-gray-600 hover:text-primary"
                        >
                            Services
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                                {service.category && (
                                    <>
                                        <Link
                                            href={services.index({ query: { category: service.category.id } })}
                                            className="text-gray-600 hover:text-primary"
                                        >
                                            {service.category.name}
                                        </Link>
                                        <i className="las la-angle-right text-gray-400"></i>
                                    </>
                                )}
                        <span className="text-gray-900 font-medium">
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
                            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
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
                                    {/* contextual SVG visual for public pages */}
                                    <div className="ml-4 hidden md:block">
                                        <div className="relative h-28 w-40 rounded-2xl bg-primary/5 border border-primary/10 overflow-hidden">
                                            <svg
                                                viewBox="0 0 180 120"
                                                className="h-full w-full text-primary"
                                                aria-hidden="true"
                                            >
                                                <defs>
                                                    <linearGradient id="cardTravel" x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0%" stopColor="#0f766e" />
                                                        <stop offset="100%" stopColor="#0891b2" />
                                                    </linearGradient>
                                                </defs>

                                                <rect
                                                    x="0"
                                                    y="0"
                                                    width="180"
                                                    height="120"
                                                    rx="18"
                                                    fill="url(#cardTravel)"
                                                    opacity="0.12"
                                                />

                                                {/* suitcase or parcel depending on service */}
                                                {service.slug.includes('colis') ? (
                                                    <g transform="translate(46 30)">
                                                        {/* box */}
                                                        <rect
                                                            x="4"
                                                            y="20"
                                                            width="72"
                                                            height="44"
                                                            rx="10"
                                                            fill="white"
                                                            opacity="0.96"
                                                        />
                                                        <path
                                                            d="M4 34h72"
                                                            stroke="#e5e7eb"
                                                            strokeWidth="2"
                                                        />
                                                        <rect
                                                            x="32"
                                                            y="20"
                                                            width="16"
                                                            height="44"
                                                            fill="#e5e7eb"
                                                            opacity="0.85"
                                                        />
                                                        {/* tape */}
                                                        <path
                                                            d="M38 20v44"
                                                            stroke="#d1d5db"
                                                            strokeWidth="2"
                                                            strokeDasharray="4 3"
                                                        />
                                                        {/* arrow */}
                                                        <path
                                                            d="M20 48h24l-4-4m4 4-4 4"
                                                            fill="none"
                                                            stroke="#0f172a"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </g>
                                                ) : (
                                                    <g transform="translate(34 30)">
                                                        {/* ticket */}
                                                        <path
                                                            d="M10 18h96a6 6 0 0 1 6 6v12a6 6 0 0 0 0 12v12a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V48a6 6 0 0 0 0-12V24a6 6 0 0 1 6-6Z"
                                                            fill="white"
                                                            opacity="0.97"
                                                        />
                                                        <path
                                                            d="M60 20v52"
                                                            stroke="#e5e7eb"
                                                            strokeWidth="2"
                                                            strokeDasharray="5 4"
                                                        />
                                                        {/* plane icon on ticket */}
                                                        <path
                                                            d="M30 44c12-4 22-6 32-7"
                                                            stroke="#0f172a"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                        <path
                                                            d="m40 34 4 6-8 2"
                                                            fill="#0f172a"
                                                        />
                                                        {/* small text lines */}
                                                        <rect
                                                            x="68"
                                                            y="32"
                                                            width="26"
                                                            height="4"
                                                            rx="2"
                                                            fill="#e5e7eb"
                                                        />
                                                        <rect
                                                            x="68"
                                                            y="42"
                                                            width="32"
                                                            height="4"
                                                            rx="2"
                                                            fill="#e5e7eb"
                                                        />
                                                        <rect
                                                            x="68"
                                                            y="52"
                                                            width="18"
                                                            height="4"
                                                            rx="2"
                                                            fill="#e5e7eb"
                                                        />
                                                    </g>
                                                )}
                                            </svg>
                                        </div>
                                    </div>
                                    {service.show_price && (
                                        <div className="text-right">
                                            <PriceDisplay
                                                amount={calculatePrice()}
                                                size="lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {service.description && (
                                    <div className="prose max-w-none mb-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>
                                )}

                                {service.destinations &&
                                    service.destinations.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                Destinations disponibles
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {service.destinations.map(
                                                    (destination) => (
                                                        <span
                                                            key={destination.id}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                                                        >
                                                            {destination.flag_emoji && (
                                                                <span>
                                                                    {
                                                                        destination.flag_emoji
                                                                    }
                                                                </span>
                                                            )}
                                                            <span>
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
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                Documents requis
                                            </h3>
                                            <ul className="space-y-2">
                                                {service.required_documents.map(
                                                    (doc) => (
                                                        <li
                                                            key={doc.id}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <i className="las la-file-alt text-primary mt-1"></i>
                                                            <div>
                                                                <span className="font-medium text-gray-900">
                                                                    {doc.name}
                                                                </span>
                                                                {doc.is_required && (
                                                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                                                        Requis
                                                                    </span>
                                                                )}
                                                                {doc.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">
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
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                Délais de traitement
                                            </h3>
                                            <div className="space-y-2">
                                                {service.processing_times.map(
                                                    (pt) => (
                                                        <label
                                                            key={pt.id}
                                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
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
                                                                className="text-primary"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="font-medium text-gray-900">
                                                                    {
                                                                        pt.duration_label
                                                                    }
                                                                </span>
                                                                <p className="text-sm text-gray-600">
                                                                    {pt.duration_hours}{' '}
                                                                    heures
                                                                </p>
                                                            </div>
                                                            {service.show_price && (
                                                                <PriceDisplay
                                                                    amount={
                                                                        service.price *
                                                                        pt.price_multiplier
                                                                    }
                                                                    size="sm"
                                                                />
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
                                    <div className="bg-white rounded-lg shadow-md p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Sous-services disponibles
                                        </h2>
                                        <div className="space-y-4">
                                            {service.sub_services.map(
                                                (subService) => (
                                                    <label
                                                        key={subService.id}
                                                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
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
                                                            className="text-primary"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                {
                                                                    subService.name
                                                                }
                                                            </h3>
                                                            {subService.description && (
                                                                <p className="text-sm text-gray-600 mt-1">
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
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Commander ce service
                                </h2>

                                <form onSubmit={handleOrder} className="space-y-4">
                                    {additionalFields.length > 0 && (
                                        <div className="border border-primary/10 rounded-lg p-4 bg-primary/5 space-y-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-primary mb-1">
                                                    Informations complémentaires
                                                </h3>
                                                    <p className="text-xs text-primary/80">
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
                                                        'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60';
                                                    const isRequired = field.is_required;

                                                    if (field.type === 'textarea') {
                                                    return (
                                                            <div key={field.id} className="flex flex-col gap-1">
                                                            <label
                                                                htmlFor={field.name}
                                                                className="text-sm font-medium text-gray-800"
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
                                                                    <p className="text-xs text-gray-500">
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
                                                                    className="text-sm font-medium text-gray-800"
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
                                                                    <option value="">Sélectionner…</option>
                                                                    {field.options?.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {field.helper_text && (
                                                                    <p className="text-xs text-gray-500">
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
                                                                className="text-sm font-medium text-gray-800"
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
                                                                <p className="text-xs text-gray-500">
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
                                                <option value="">
                                                    Sélectionner une
                                                    destination
                                                </option>
                                                {service.destinations.map(
                                                    (dest) => (
                                                        <option
                                                            key={dest.id}
                                                            value={dest.id}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (optionnel)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
                                        <p className="text-sm text-blue-800">
                                            <i className="las la-calendar mr-2"></i>
                                            Ce service nécessite un rendez-vous. Vous
                                            pourrez choisir un créneau disponible après
                                            avoir cliqué sur le bouton ci-dessus.
                                        </p>
                                        {service.appointment_pricing_mode === 'appointment_only' ? (
                                            <p className="text-xs text-blue-700">
                                                <i className="las la-info-circle mr-1"></i>
                                                Frais de rendez-vous uniquement
                                            </p>
                                        ) : appointmentPrice > 0 && (
                                            <p className="text-xs text-blue-700">
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
        </PublicLayout>
    );
}

