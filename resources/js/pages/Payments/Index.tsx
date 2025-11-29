import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay, EmptyState } from '@/components/public';
import payments from '@/routes/payments';
import { type PaginatedData } from '@/types';

interface Service {
    id: number;
    name: string;
    slug: string;
}

interface Order {
    id: number;
    order_number: string;
    service?: Service;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    payment_date?: string;
    created_at: string;
    order?: Order;
}

interface PaymentsIndexProps {
    payments: PaginatedData<Payment>;
}

const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'En attente',
        completed: 'Payé',
        failed: 'Échoué',
        refunded: 'Remboursé',
    };
    return labels[status] || status;
};

const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
        kkiapay: 'KkiaPay',
        cash: 'Espèces',
        bank_transfer: 'Virement bancaire',
    };
    return labels[method] || method;
};

export default function PaymentsIndex({ payments }: PaymentsIndexProps) {
    return (
        <PublicLayout>
            <Head title="Mes Paiements - SouwTravel" />

            {/* Header */}
            <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Mes Paiements</h1>
                    <p className="text-white/90">
                        Consultez l'historique de tous vos paiements
                    </p>
                </div>
            </section>

            {/* Payments List */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {payments.data.length > 0 ? (
                        <>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    ID Paiement
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Commande
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Service
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Montant
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Méthode
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {payments.data.map((payment) => (
                                                <tr
                                                    key={payment.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            #{payment.id}
                                                        </div>
                                                        {payment.transaction_id && (
                                                            <div className="text-xs text-gray-500">
                                                                {payment.transaction_id.substring(0, 20)}...
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {payment.order?.order_number || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {payment.order?.service?.name || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <PriceDisplay
                                                            amount={payment.amount}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {getPaymentMethodLabel(
                                                                payment.payment_method,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                                payment.payment_status,
                                                            )}`}
                                                        >
                                                            {getPaymentStatusLabel(
                                                                payment.payment_status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.payment_date
                                                            ? new Date(
                                                                  payment.payment_date,
                                                              ).toLocaleDateString(
                                                                  'fr-FR',
                                                              )
                                                            : new Date(
                                                                  payment.created_at,
                                                              ).toLocaleDateString(
                                                                  'fr-FR',
                                                              )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {payment.order && (
                                                            <Link
                                                                href={`/orders/${payment.order.id}`}
                                                                className="text-primary hover:text-primary/80"
                                                            >
                                                                Voir la commande
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {payments.links && payments.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex gap-2">
                                        {payments.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-lg ${
                                                    link.active
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                } ${
                                                    !link.url
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            icon="las la-credit-card"
                            title="Aucun paiement"
                            description="Vous n'avez pas encore effectué de paiement."
                            action={{
                                label: 'Découvrir les services',
                                href: '/services',
                            }}
                        />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

