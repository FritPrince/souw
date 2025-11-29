import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay } from '@/components/public';
import orders from '@/routes/orders';
import { useEffect, useState } from 'react';

interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id?: string;
    payment_date?: string;
    order?: {
        id: number;
        order_number: string;
    };
}

interface PaymentsSuccessProps {
    payment: Payment;
}

export default function PaymentsSuccess({
    payment,
}: PaymentsSuccessProps) {
    const [open, setOpen] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    // Debug: vérifier que la modale doit s'afficher
    useEffect(() => {
        console.log('PaymentsSuccess - Modal state:', { open, payment_id: payment.id });
    }, [open, payment.id]);

    const sendRecap = async () => {
        setError(null);
        setSending(true);
        try {
            const res = await fetch(`/payments/${payment.id}/send-recap`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.message || 'Envoi du mail impossible');
            }
            setSent(true);
        } catch (e: any) {
            setError(e.message || 'Une erreur est survenue');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Modal overlay - en dehors du layout pour éviter les problèmes de z-index */}
            {open && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" 
                    style={{ zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={(e) => {
                        // Fermer la modale si on clique sur l'overlay (en dehors de la modale)
                        if (e.target === e.currentTarget) {
                            setOpen(false);
                        }
                    }}
                >
                    <div 
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 relative" 
                        style={{ zIndex: 100000 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600">
                                <path d="M9 12.75l-2-2L5.25 12.5 9 16.25 18.75 6.5 17 4.75 9 12.75z" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 text-center">Paiement validé</h2>
                        <p className="mt-2 text-center text-gray-600">
                            Votre paiement a été confirmé. Souhaitez-vous recevoir le mail récapitulatif de votre commande ?
                        </p>

                        <div className="mt-6 space-y-2">
                            {error && (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                                    {error}
                                </div>
                            )}
                            {sent && (
                                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">
                                    Mail récapitulatif envoyé avec succès.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                onClick={sendRecap}
                                disabled={sending || sent}
                                className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white shadow hover:opacity-95 disabled:opacity-60"
                            >
                                {sending ? 'Envoi...' : sent ? 'Envoyé' : 'Recevoir le mail récapitulatif'}
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="px-5 py-2.5 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PublicLayout>
                <Head title="Paiement réussi - SouwTravel" />

                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <div className="mb-6">
                                    <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                                        <i className="las la-check-circle text-green-600 text-5xl"></i>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Paiement réussi !
                                    </h1>
                                    <p className="text-gray-600">
                                        Votre paiement a été effectué avec succès
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
                                            Montant payé
                                        </span>
                                        <PriceDisplay amount={payment.amount} />
                                    </div>
                                    {payment.transaction_id && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700">
                                                Transaction ID
                                            </span>
                                            <span className="font-mono text-sm text-gray-900">
                                                {payment.transaction_id}
                                            </span>
                                        </div>
                                    )}
                                    {payment.payment_date && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700">
                                                Date de paiement
                                            </span>
                                            <span className="text-gray-900">
                                                {new Date(
                                                    payment.payment_date,
                                                ).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {payment.order && (
                                        <Link
                                            href={orders.show(payment.order.id)}
                                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            Voir la commande
                                        </Link>
                                    )}
                                    <Link
                                        href={orders.index()}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Mes commandes
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </PublicLayout>
        </>
    );
}