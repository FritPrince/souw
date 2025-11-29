import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { OrderStatusBadge, PriceDisplay, EmptyState } from '@/components/public';
import orders, { show as orderShow } from '@/routes/orders';
import { type PaginatedData } from '@/types';

interface Service {
    id: number;
    name: string;
    slug: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
    service?: Service;
    destination?: {
        name: string;
        flag_emoji?: string;
    };
    payment?: {
        id: number;
        payment_status: string;
    };
}

interface OrdersIndexProps {
    orders: PaginatedData<Order>;
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    return (
        <PublicLayout>
            <Head title="Mes Commandes - SouwTravel" />

            {/* Header */}
            <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Mes Commandes</h1>
                    <p className="text-white/90">
                        Suivez l'état de toutes vos commandes
                    </p>
                </div>
            </section>

            {/* Orders List */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {orders.data.length > 0 ? (
                        <>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
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
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Paiement
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
                                            {orders.data.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.order_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {order.service?.name ||
                                                                'N/A'}
                                                        </div>
                                                        {order.destination && (
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                {order.destination
                                                                    .flag_emoji && (
                                                                    <span>
                                                                        {
                                                                            order
                                                                                .destination
                                                                                .flag_emoji
                                                                        }
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    {
                                                                        order
                                                                            .destination
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <PriceDisplay
                                                            amount={
                                                                order.total_amount
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <OrderStatusBadge
                                                            status={order.status}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {order.payment_status ===
                                                        'completed' ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Payé
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                En attente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={orderShow.url(order.id)}
                                                            className="text-primary hover:text-primary/80"
                                                        >
                                                            Voir détails
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {orders.links && orders.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex gap-2">
                                        {orders.links.map((link, index) => (
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
                            icon="las la-shopping-cart"
                            title="Aucune commande"
                            description="Vous n'avez pas encore de commandes. Commencez par explorer nos services."
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


