import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay } from '@/components/public';
import { Button } from '@/components/ui/button';
import orders from '@/routes/orders';
import { process as paymentProcess } from '@/routes/payments';

interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id?: string;
    order?: {
        id: number;
        order_number: string;
    };
}

interface PaymentsFailedProps {
    payment: Payment;
}

export default function PaymentsFailed({
    payment,
}: PaymentsFailedProps) {
    const handleRetry = () => {
        router.visit(paymentProcess.url(payment.id));
    };

    return (
        <PublicLayout>
            <Head title="Paiement échoué - SouwTravel" />

            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                                    <i className="las la-times-circle text-red-600 text-5xl"></i>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Paiement échoué
                                </h1>
                                <p className="text-gray-600">
                                    Votre paiement n'a pas pu être effectué
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                                {payment.order && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">
                                            Commande
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {payment.order.order_number}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">
                                        Montant
                                    </span>
                                    <PriceDisplay amount={payment.amount} />
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    <i className="las la-info-circle mr-2"></i>
                                    Veuillez vérifier vos informations de
                                    paiement et réessayer. Si le problème
                                    persiste, contactez notre support.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={handleRetry} className="w-full sm:w-auto">
                                    <i className="las la-redo mr-2"></i>
                                    Réessayer le paiement
                                </Button>
                                {payment.order && (
                                    <Link
                                        href={orders.show(payment.order.id)}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                                    >
                                        Voir la commande
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

