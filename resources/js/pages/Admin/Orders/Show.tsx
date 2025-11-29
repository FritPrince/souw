import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface Category {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    category?: Category;
}

interface SubService {
    id: number;
    name: string;
}

interface Destination {
    id: number;
    name: string;
    flag_emoji?: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    service?: Service;
    subService?: SubService;
}

interface OrderDocument {
    id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    url: string;
    uploaded_at: string;
}

interface AppointmentSlot {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
}

interface Appointment {
    id: number;
    status: string;
    notes?: string;
    appointmentSlot?: AppointmentSlot;
}

interface Payment {
    id: number;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
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
    payment_status: string;
    payment_method: string;
    total_amount: number;
    notes?: string;
    additional_data?: Record<string, unknown>;
    created_at: string;
    user?: User;
    service?: Service;
    subService?: SubService;
    destination?: Destination;
    items?: OrderItem[];
    documents?: OrderDocument[];
    appointment?: Appointment;
    payment?: Payment;
}

interface Props {
    order: Order;
    formFields?: ServiceFormField[];
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'En attente',
    processing: 'En traitement',
    completed: 'Terminée',
    cancelled: 'Annulée',
    paid: 'Payée',
};

const ORDER_STATUS_OPTIONS = [
    { value: 'processing', label: 'En traitement' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
];

export default function Show({ order, formFields = [] }: Props) {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);

    const { data: statusData, setData: setStatusData, put: putStatus, processing: statusProcessing } = useForm({
        status: order.status,
        notes: '',
    });

    const { data: noteData, setData: setNoteData, post: postNote, processing: noteProcessing } = useForm({
        notes: '',
    });

    const updateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        putStatus(`/admin/orders/${order.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowStatusModal(false);
            },
        });
    };

    const addNote = (e: React.FormEvent) => {
        e.preventDefault();
        postNote(`/admin/orders/${order.id}/add-note`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNoteModal(false);
                setNoteData('notes', '');
            },
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            paid: 'bg-green-100 text-green-700',
            processing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Commandes', href: '/admin/orders' }, { title: order.order_number, href: `/admin/orders/${order.id}` }]}>
            <div className="p-6">
                <Head title={`Commande ${order.order_number}`} />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Commande {order.order_number}</h1>
                    <Link href="/admin/orders" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations client */}
                        <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations client</h2>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Nom:</span> {order.user?.name || '-'}
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Email:</span> {order.user?.email || '-'}
                                </div>
                                {order.user?.phone && (
                                    <div>
                                        <span className="font-medium text-gray-700">Téléphone:</span> {order.user.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Détails de la commande */}
                        <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                            <h2 className="text-lg font-semibold mb-4">Détails de la commande</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="font-medium text-gray-700">Service:</span> {order.service?.name || '-'}
                                    {order.service?.category && (
                                        <span className="text-sm text-gray-500 ml-2">({order.service.category.name})</span>
                                    )}
                                </div>
                                {order.subService && (
                                    <div>
                                        <span className="font-medium text-gray-700">Sous-service:</span> {order.subService.name}
                                    </div>
                                )}
                                {order.destination && (
                                    <div>
                                        <span className="font-medium text-gray-700">Destination:</span>{' '}
                                        {order.destination.flag_emoji && <span>{order.destination.flag_emoji} </span>}
                                        {order.destination.name}
                                    </div>
                                )}
                                {order.items && order.items.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Articles:</span>
                                        <ul className="mt-2 space-y-1">
                                            {order.items.map((item) => (
                                                <li key={item.id} className="text-sm text-gray-600">
                                                    {item.service?.name || item.subService?.name} - Qté: {item.quantity} -{' '}
                                                    {new Intl.NumberFormat('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'XOF',
                                                        minimumFractionDigits: 0,
                                                    }).format(item.total_price)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Additional Data (Custom Fields) */}
                                {order.additional_data &&
                                    order.additional_data !== null &&
                                    typeof order.additional_data === 'object' &&
                                    Object.keys(order.additional_data).length > 0 && (
                                        <div className="border-t pt-4 mt-4">
                                            <h3 className="text-sm font-medium text-gray-700 mb-3">Informations complémentaires</h3>
                                            <div className="space-y-3">
                                                {/* Display fields from formFields first (with labels) */}
                                                {formFields.map((field) => {
                                                    const value = order.additional_data?.[field.name];
                                                    if (value === null || value === undefined || value === '') {
                                                        return null;
                                                    }

                                                    // Get display value
                                                    let displayValue: string;
                                                    if (field.type === 'select' && field.options) {
                                                        const option = field.options.find((opt) => opt.value === String(value));
                                                        displayValue = option?.label || String(value);
                                                    } else if (field.type === 'date') {
                                                        displayValue = new Date(String(value)).toLocaleDateString('fr-FR');
                                                    } else {
                                                        displayValue = String(value);
                                                    }

                                                    return (
                                                        <div key={field.id} className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</span>
                                                            <p className="text-gray-900">{displayValue}</p>
                                                        </div>
                                                    );
                                                })}

                                                {/* Display any additional_data fields not in formFields (fallback) */}
                                                {Object.entries(order.additional_data).map(([key, value]) => {
                                                    // Skip if already displayed via formFields
                                                    if (formFields.some((f) => f.name === key)) {
                                                        return null;
                                                    }

                                                    if (value === null || value === undefined || value === '') {
                                                        return null;
                                                    }

                                                    return (
                                                        <div key={key} className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                {key
                                                                    .replace(/_/g, ' ')
                                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                            </span>
                                                            <p className="text-gray-900">{String(value)}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Documents */}
                        {order.documents && order.documents.length > 0 && (
                            <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                                <h2 className="text-lg font-semibold mb-4">Documents uploadés</h2>
                                <div className="space-y-2">
                                    {order.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium text-sm">{doc.file_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(doc.uploaded_at).toLocaleString('fr-FR')}
                                                </div>
                                            </div>
                                            <a
                                                href={`/admin/orders/${order.id}/documents/${doc.id}/download`}
                                                className="px-3 py-1 text-sm bg-[var(--primary)] text-white rounded hover:opacity-95"
                                            >
                                                Télécharger
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rendez-vous */}
                        {order.appointment && (
                            <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                                <h2 className="text-lg font-semibold mb-4">Rendez-vous</h2>
                                {order.appointment.appointmentSlot && (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Date:</span>{' '}
                                            {new Date(order.appointment.appointmentSlot.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Heure:</span>{' '}
                                            {order.appointment.appointmentSlot.start_time} - {order.appointment.appointmentSlot.end_time}
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Statut:</span>{' '}
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(order.appointment.status)}`}>
                                                {order.appointment.status}
                                            </span>
                                        </div>
                                        {order.appointment.notes && (
                                            <div>
                                                <span className="font-medium text-gray-700">Notes:</span> {order.appointment.notes}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statut et actions */}
                        <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                            <h2 className="text-lg font-semibold mb-4">Statut</h2>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Statut de la commande:</span>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {STATUS_LABELS[order.status] ?? order.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Paiement:</span>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                order.payment_status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : order.payment_status === 'failed'
                                                        ? 'bg-red-100 text-red-700'
                                                        : order.payment_status === 'refunded'
                                                            ? 'bg-gray-100 text-gray-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {order.payment_status === 'pending'
                                                ? 'En attente'
                                                : order.payment_status === 'completed'
                                                    ? 'Payé'
                                                    : order.payment_status === 'failed'
                                                        ? 'Échoué'
                                                        : order.payment_status === 'refunded'
                                                            ? 'Remboursé'
                                                            : order.payment_status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Montant total:</span>
                                    <div className="mt-1 text-lg font-bold text-gray-900">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'XOF',
                                            minimumFractionDigits: 0,
                                        }).format(order.total_amount)}
                                    </div>
                                </div>
                                {order.payment && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Méthode de paiement:</span>
                                        <div className="mt-1 text-sm text-gray-600">{order.payment.payment_method}</div>
                                        {order.payment.transaction_id && (
                                            <div className="mt-1 text-xs text-gray-500">ID: {order.payment.transaction_id}</div>
                                        )}
                                    </div>
                                )}
                                <div className="pt-4 border-t space-y-2">
                                    <button
                                        onClick={() => setShowStatusModal(true)}
                                        className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95"
                                    >
                                        Changer le statut
                                    </button>
                                    <button
                                        onClick={() => setShowNoteModal(true)}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Ajouter une note
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notes internes */}
                        {order.notes && (
                            <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                                <h2 className="text-lg font-semibold mb-4">Notes internes</h2>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</div>
                            </div>
                        )}

                        {/* Informations de paiement */}
                        {order.payment && (
                            <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-6">
                                <h2 className="text-lg font-semibold mb-4">Paiement</h2>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Montant:</span>{' '}
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'XOF',
                                            minimumFractionDigits: 0,
                                        }).format(order.payment.amount)}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Méthode:</span> {order.payment.payment_method}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Statut:</span>{' '}
                                        {order.payment.payment_status === 'pending'
                                            ? 'En attente'
                                            : order.payment.payment_status === 'completed'
                                                ? 'Payé'
                                                : order.payment.payment_status === 'failed'
                                                    ? 'Échoué'
                                                    : order.payment.payment_status === 'refunded'
                                                        ? 'Remboursé'
                                                        : order.payment.payment_status}
                                    </div>
                                    {order.payment.transaction_id && (
                                        <div>
                                            <span className="font-medium text-gray-700">Transaction ID:</span> {order.payment.transaction_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal changement de statut */}
                {showStatusModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Changer le statut</h3>
                            <form onSubmit={updateStatus}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau statut</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        value={statusData.status}
                                        onChange={(e) => setStatusData('status', e.target.value)}
                                    >
                                        {(() => {
                                            const options = [...ORDER_STATUS_OPTIONS];
                                            if (
                                                statusData.status &&
                                                !options.some((option) => option.value === statusData.status)
                                            ) {
                                                options.unshift({
                                                    value: statusData.status,
                                                    label: STATUS_LABELS[statusData.status] ?? statusData.status,
                                                });
                                            }

                                            return options.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        value={statusData.notes}
                                        onChange={(e) => setStatusData('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStatusModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={statusProcessing}
                                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95 disabled:opacity-60"
                                    >
                                        {statusProcessing ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal ajout de note */}
                {showNoteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Ajouter une note</h3>
                            <form onSubmit={addNote}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                                    <textarea
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        value={noteData.notes}
                                        onChange={(e) => setNoteData('notes', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowNoteModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={noteProcessing}
                                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95 disabled:opacity-60"
                                    >
                                        {noteProcessing ? 'Enregistrement...' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}

