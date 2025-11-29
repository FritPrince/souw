import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import {
    OrderStatusBadge,
    PriceDisplay,
    PaymentStatusBadge,
    DocumentUpload,
} from '@/components/public';
import orders from '@/routes/orders';
import { process as paymentProcess, initiate as paymentInitiate } from '@/routes/payments';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Service {
    id: number;
    name: string;
    slug: string;
    category?: {
        name: string;
    };
}

interface ServiceFormField {
    id: number;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    notes?: string;
    additional_data?: Record<string, unknown>;
    created_at: string;
    service?: Service;
    sub_service?: {
        name: string;
    };
    destination?: {
        name: string;
        flag_emoji?: string;
    };
    items?: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
    documents?: Array<{
        id: number;
        file_name: string;
        file_path: string;
        url: string;
        uploaded_at: string;
    }>;
    appointment?: {
        id: number;
        status: string;
        appointment_slot: {
            date: string;
            start_time: string;
            end_time: string;
        };
    };
    payment?: {
        id: number;
        payment_status: string;
        payment_method: string;
        transaction_id?: string;
    };
}

interface OrdersShowProps {
    order: Order;
    formFields?: ServiceFormField[];
}

export default function OrdersShow({ order, formFields = [] }: OrdersShowProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadKey, setUploadKey] = useState(() => Date.now());

    // Debug logs
    console.log('=== ORDER DETAILS ===');
    console.log('Order:', order);
    console.log('Order additional_data:', order.additional_data);
    console.log('FormFields:', formFields);
    console.log('FormFields count:', formFields.length);

    const handleUploadDocuments = (files: File[]) => {
        if (files.length === 0) {
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('documents[]', file);
        });

        setUploading(true);

        router.post(orders.uploadDocuments.url(order.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setUploadKey(Date.now());
            },
            onFinish: () => {
                setUploading(false);
            },
        });
    };

    const handlePayment = (e?: React.MouseEvent) => {
        e?.preventDefault();
        router.post(paymentInitiate.url(), {
            order_id: order.id,
            payment_method: 'fedapay',
        });
    };

    const statusMessages: Record<
        string,
        { title: string; description: string; tone: string; icon: string }
    > = {
        pending: {
            title: 'Commande en attente',
            description:
                'Nous attendons la confirmation de votre paiement. Dès validation, nous lancerons immédiatement le traitement de votre dossier.',
            tone: 'border-yellow-400 bg-yellow-50 text-yellow-800',
            icon: 'las la-hourglass-half',
        },
        processing: {
            title: 'Votre dossier est en traitement',
            description:
                'Notre équipe traite actuellement votre demande. Nous vous informerons à chaque étape clé et restons disponibles si vous avez besoin de précisions.',
            tone: 'border-blue-500 bg-blue-50 text-blue-800',
            icon: 'las la-sync-alt',
        },
        paid: {
            title: 'Paiement confirmé',
            description:
                'Nous avons bien reçu votre règlement. Votre dossier passe à présent en traitement ; vous serez informé dès la prochaine étape.',
            tone: 'border-blue-500 bg-blue-50 text-blue-800',
            icon: 'las la-file-invoice-dollar',
        },
        completed: {
            title: 'Commande finalisée',
            description:
                'Votre commande est terminée. Consultez votre messagerie pour retrouver le récapitulatif complet et la suite des actions éventuelles.',
            tone: 'border-green-500 bg-green-50 text-green-800',
            icon: 'las la-check-circle',
        },
        cancelled: {
            title: 'Commande annulée',
            description:
                'Cette commande a été annulée. Contactez-nous si vous souhaitez la relancer ou si vous avez des questions spécifiques.',
            tone: 'border-red-500 bg-red-50 text-red-800',
            icon: 'las la-times-circle',
        },
        failed: {
            title: 'Paiement non abouti',
            description:
                'Le paiement n’a pas pu être finalisé. Vérifiez vos informations ou tentez un nouveau règlement depuis cette page.',
            tone: 'border-orange-500 bg-orange-50 text-orange-800',
            icon: 'las la-exclamation-triangle',
        },
    };

    const statusInfo =
        statusMessages[order.status?.toLowerCase() ?? ''] ?? statusMessages.processing;

    return (
        <PublicLayout>
            <Head title={`Commande ${order.order_number} - SouwTravel`} />

            {/* Breadcrumb */}
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={orders.index()}
                            className="text-gray-600 hover:text-primary"
                        >
                            Mes commandes
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        <span className="text-gray-900 font-medium">
                            {order.order_number}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Order Details */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div
                        className={`mb-6 rounded-lg border-l-4 p-5 shadow-sm ${statusInfo.tone}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                                <i className={statusInfo.icon}></i>
                            </span>
                            <div>
                                <h2 className="text-base font-semibold">
                                    {statusInfo.title}
                                </h2>
                                <p className="text-sm mt-1 leading-relaxed">
                                    {statusInfo.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Info */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            Commande {order.order_number}
                                        </h1>
                                        <p className="text-sm text-gray-500">
                                            Créée le{' '}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                                            Service
                                        </h3>
                                        <p className="text-gray-900">
                                            {order.service?.name}
                                        </p>
                                        {order.service?.category && (
                                            <p className="text-sm text-gray-500">
                                                {order.service.category.name}
                                            </p>
                                        )}
                                    </div>

                                    {order.sub_service && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                                Sous-service
                                            </h3>
                                            <p className="text-gray-900">
                                                {order.sub_service.name}
                                            </p>
                                        </div>
                                    )}

                                    {order.destination && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                                Destination
                                            </h3>
                                            <p className="text-gray-900 flex items-center gap-2">
                                                {order.destination.flag_emoji && (
                                                    <span>
                                                        {
                                                            order.destination
                                                                .flag_emoji
                                                        }
                                                    </span>
                                                )}
                                                <span>
                                                    {order.destination.name}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {order.notes && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </h3>
                                            <p className="text-gray-900">
                                                {order.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Data (Custom Fields) */}
                                    {order.additional_data &&
                                        order.additional_data !== null &&
                                        typeof order.additional_data === 'object' &&
                                        Object.keys(order.additional_data).length >
                                            0 && (
                                            <div className="border-t pt-4 mt-4">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                    Informations
                                                    complémentaires
                                                </h3>
                                                <div className="space-y-3">
                                                    {/* Display fields from formFields first (with labels) */}
                                                    {formFields.map((field) => {
                                                        const value =
                                                            order.additional_data?.[
                                                                field.name
                                                            ];
                                                        if (
                                                            value === null ||
                                                            value === undefined ||
                                                            value === ''
                                                        ) {
                                                            return null;
                                                        }

                                                        // Get display value
                                                        let displayValue: string;
                                                        if (
                                                            field.type ===
                                                                'select' &&
                                                            field.options
                                                        ) {
                                                            const option =
                                                                field.options.find(
                                                                    (opt) =>
                                                                        opt.value ===
                                                                        String(
                                                                            value,
                                                                        ),
                                                                );
                                                            displayValue =
                                                                option?.label ||
                                                                String(value);
                                                        } else if (
                                                            field.type === 'date'
                                                        ) {
                                                            displayValue =
                                                                new Date(
                                                                    String(
                                                                        value,
                                                                    ),
                                                                ).toLocaleDateString(
                                                                    'fr-FR',
                                                                );
                                                        } else {
                                                            displayValue =
                                                                String(value);
                                                        }

                                                        return (
                                                            <div
                                                                key={field.id}
                                                                className="flex flex-col gap-1"
                                                            >
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    {field.label}
                                                                </span>
                                                                <p className="text-gray-900">
                                                                    {displayValue}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Display any additional_data fields not in formFields (fallback) */}
                                                    {Object.entries(
                                                        order.additional_data,
                                                    ).map(([key, value]) => {
                                                        // Skip if already displayed via formFields
                                                        if (
                                                            formFields.some(
                                                                (f) => f.name === key,
                                                            )
                                                        ) {
                                                            return null;
                                                        }

                                                        if (
                                                            value === null ||
                                                            value === undefined ||
                                                            value === ''
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <div
                                                                key={key}
                                                                className="flex flex-col gap-1"
                                                            >
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                    {key
                                                                        .replace(
                                                                            /_/g,
                                                                            ' ',
                                                                        )
                                                                        .replace(
                                                                            /\b\w/g,
                                                                            (l) =>
                                                                                l.toUpperCase(),
                                                                        )}
                                                                </span>
                                                                <p className="text-gray-900">
                                                                    {String(
                                                                        value,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Documents
                                </h2>

                                {order.documents &&
                                order.documents.length > 0 ? (
                                    <div className="space-y-2 mb-4">
                                        {order.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="las la-file-pdf text-red-500 text-xl"></i>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {doc.file_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Uploadé le{' '}
                                                            {new Date(
                                                                doc.uploaded_at,
                                                            ).toLocaleDateString(
                                                                'fr-FR',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`/orders/${order.id}/documents/${doc.id}/download`}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <i className="las la-download"></i>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm mb-4">
                                        Aucun document uploadé
                                    </p>
                                )}

                                <DocumentUpload
                                    key={uploadKey}
                                    onUpload={handleUploadDocuments}
                                    disabled={uploading}
                                    label="Ajouter des documents"
                                />
                            </div>

                            {/* Appointment */}
                            {order.appointment && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Rendez-vous
                                    </h2>
                                    <div className="space-y-2">
                                        <p className="text-gray-900">
                                            <span className="font-medium">
                                                Date:{' '}
                                            </span>
                                            {new Date(
                                                order.appointment.appointment_slot
                                                    .date,
                                            ).toLocaleDateString('fr-FR')}
                                        </p>
                                        <p className="text-gray-900">
                                            <span className="font-medium">
                                                Heure:{' '}
                                            </span>
                                            {
                                                order.appointment.appointment_slot
                                                    .start_time
                                            }{' '}
                                            -{' '}
                                            {
                                                order.appointment.appointment_slot
                                                    .end_time
                                            }
                                        </p>
                                        <OrderStatusBadge
                                            status={order.appointment.status}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
                                {/* Payment Status */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Paiement
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700">
                                                Montant total
                                            </span>
                                            <PriceDisplay
                                                amount={order.total_amount}
                                            />
                                        </div>
                                        {order.payment && (
                                            <div>
                                                <PaymentStatusBadge
                                                    status={
                                                        order.payment
                                                            .payment_status
                                                    }
                                                />
                                                {order.payment
                                                    .transaction_id && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Transaction:{' '}
                                                        {
                                                            order.payment
                                                                .transaction_id
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {order.payment_status !==
                                            'completed' && (
                                            <Button
                                                type="button"
                                                onClick={handlePayment}
                                                className="w-full"
                                            >
                                                Payer maintenant
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Actions
                                    </h3>
                                    <div className="space-y-2">
                                        {['pending', 'paid'].includes(
                                            order.status,
                                        ) && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    router.post(
                                                        orders.cancel.url(
                                                            order.id,
                                                        ),
                                                    );
                                                }}
                                            >
                                                Annuler la commande
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

