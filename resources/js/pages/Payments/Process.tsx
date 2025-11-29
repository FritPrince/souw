import { useCallback, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import PriceDisplay from '@/components/public/PriceDisplay';
import PaymentStatusBadge from '@/components/public/PaymentStatusBadge';
import { success as paymentSuccessRoute, failed as paymentFailedRoute, verify as paymentVerifyRoute } from '@/routes/payments';

declare global {
    interface Window {
        FedaPay?: {
            init: (options: {
                public_key: string;
                transaction: {
                    id?: string;
                    amount: number;
                    description: string;
                };
                currency?: {
                    iso: string;
                };
                customer?: {
                    email?: string;
                    firstname?: string;
                    lastname?: string;
                };
                container: string;
                onComplete?: (resp: any) => void;
            }) => void;
            DIALOG_DISMISSED?: string;
        };
    }
}

interface PaymentUser {
    name: string;
    email?: string;
    phone?: string | null;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_method: string;
    payment_status: string;
    transaction_id?: string;
    order?: {
        id: number;
        order_number: string;
        service?: {
            name: string;
        };
    };
    user?: PaymentUser;
}

interface FedaPayCustomer {
    name?: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
}

interface FedaPayData {
    public_key: string;
    amount: number;
    transaction_id?: string;
    callback_url: string;
    sandbox?: boolean;
    customer?: FedaPayCustomer;
    transaction_token?: string;
}

interface PaymentsProcessProps {
    payment: Payment;
    fedapay?: FedaPayData;
}

const escapeAttribute = (value: string): string => value.replace(/"/g, '&quot;');

const extractTransactionId = (payload: any): string | undefined => {
    if (!payload) {
        return undefined;
    }

    // Si c'est directement une string ou un number
    if (typeof payload === 'string' && payload.trim() !== '') {
        return payload.trim();
    }
    if (typeof payload === 'number') {
        return String(payload);
    }

    // Si c'est un objet, chercher dans différentes propriétés
    if (typeof payload === 'object') {
        const candidates = [
            'transactionId',
            'transaction_id',
            'id',
            'transaction',
            'reference',
            'transactionId',
        ];

        for (const key of candidates) {
            const value = payload[key];
            if (value !== null && value !== undefined) {
                if (typeof value === 'string' && value.trim() !== '') {
                    return value.trim();
                }
                if (typeof value === 'number') {
                    return String(value);
                }
                // Si c'est un objet avec un id
                if (typeof value === 'object' && value.id) {
                    return String(value.id);
                }
            }
        }

        // Chercher aussi dans data.transaction_id, etc.
        if (payload.data) {
            const fromData = extractTransactionId(payload.data);
            if (fromData) {
                return fromData;
            }
        }

        if (payload.transaction) {
            const fromTransaction = extractTransactionId(payload.transaction);
            if (fromTransaction) {
                return fromTransaction;
            }
        }
    }

    return undefined;
};

// Pas besoin de déclaration globale pour le composant web

export default function PaymentsProcess({
    payment,
    fedapay,
}: PaymentsProcessProps) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const retryCountRef = useRef(0);
    const widgetSuccessRef = useRef(false);
    const listenersRegisteredRef = useRef(false);
    const maxRetries = 20; // Maximum 4 secondes (20 * 200ms)

    const customerInfo = fedapay?.customer || {
        name: payment.user?.name,
        email: payment.user?.email,
        phone: payment.user?.phone ?? undefined,
    };

    const firstName = customerInfo?.first_name
        || customerInfo?.name?.split(' ')[0]
        || '';
    const lastName = customerInfo?.last_name
        || (customerInfo?.name?.split(' ').slice(1).join(' ') ?? '');

    const finalizePayment = useCallback(
        async ({ transactionId, force }: { transactionId?: string; force?: boolean } = {}, logContext: string = 'default') => {
            try {
                const query = new URLSearchParams();
                if (transactionId) {
                    query.set('transactionId', transactionId);
                }
                if (force) {
                    query.set('force', '1');
                }

                const baseUrl = paymentVerifyRoute.url(payment.id);
                const url = query.toString() ? `${baseUrl}?${query.toString()}` : baseUrl;

                const res = await fetch(url, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                // Vérifier si la réponse est OK
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('Erreur HTTP lors de la vérification du paiement', {
                        logContext,
                        url,
                        status: res.status,
                        statusText: res.statusText,
                        errorText,
                    });
                    
                    // Si c'est une erreur 500 et qu'on a force=true, essayer quand même de forcer la complétion
                    if (res.status === 500 && force) {
                        console.warn('Erreur 500 mais force=true, on continue quand même');
                        // Ne pas retourner null pour éviter de bloquer le processus
                        return { status: 'pending', verification_status: 'ERROR' };
                    }
                    
                    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                }

                const data = await res.json().catch((e) => {
                    console.error('Erreur lors du parsing JSON', {
                        logContext,
                        url,
                        error: e.message,
                    });
                    return { status: 'pending', verification_status: 'ERROR' };
                });

                console.log('Vérification paiement', {
                    logContext,
                    url,
                    status: data.status,
                    verification_status: data.verification_status,
                    message: data.message,
                });

                if (data.status === 'completed') {
                    router.visit(paymentSuccessRoute.url(payment.id));
                } else if (data.status === 'failed') {
                    router.visit(paymentFailedRoute.url(payment.id));
                }

                return data;
            } catch (error) {
                console.error('Erreur lors de la vérification du paiement', {
                    logContext,
                    error,
                });

                return null;
            }
        },
        [payment.id, router],
    );

    useEffect(() => {
         if (payment.payment_status !== 'pending') {
             return;
         }
 
         let cancelled = false;
         const transactionIdRef = { current: fedapay?.transaction_id || payment.transaction_id };

         const verify = async () => {
             if (cancelled) {
                 return;
             }
             try {
                // Utiliser le transactionId si disponible
                const verifyParams: { transactionId?: string; force?: boolean } = {};
                if (transactionIdRef.current) {
                    verifyParams.transactionId = transactionIdRef.current;
                }
                
                const data = await finalizePayment(verifyParams, 'polling');
                if (! data || cancelled) {
                    return;
                }

                // Si le transaction_id est retourné dans la réponse, le sauvegarder
                if (data.transaction_id && !transactionIdRef.current) {
                    transactionIdRef.current = data.transaction_id;
                }

                if (data.status === 'completed') {
                    cancelled = true;
                    router.visit(paymentSuccessRoute.url(payment.id));
                    return;
                }

                // Si le widget a indiqué le succès, forcer la vérification
                if (widgetSuccessRef.current && transactionIdRef.current) {
                    console.log('Widget a confirmé le succès, forçage de la vérification avec transactionId:', transactionIdRef.current);
                    const forced = await finalizePayment({ 
                        transactionId: transactionIdRef.current,
                        force: true 
                    }, 'polling-force');
                    if (forced && forced.status === 'completed') {
                        cancelled = true;
                        router.visit(paymentSuccessRoute.url(payment.id));
                        return;
                    }
                }

                if (data.verification_status === 'FAILED') {
                    // Pas de redirection automatique, l'utilisateur peut réessayer
                }
            } catch (e) {
                console.error('verify payment failed', e);
            }
        };
 
         const interval = setInterval(verify, 3000);
         verify();
 
         return () => {
             cancelled = true;
             clearInterval(interval);
         };
    }, [finalizePayment, payment.payment_status, fedapay?.transaction_id, payment.transaction_id]);

    useEffect(() => {
         if (
             fedapay &&
             payment.payment_method === 'fedapay' &&
             payment.payment_status === 'pending' &&
             widgetRef.current
         ) {
             const widgetContainer = widgetRef.current;
             let cancelled = false;
             let retryTimeout: ReturnType<typeof setTimeout> | null = null;

             const initializeFedaPay = () => {
                 if (cancelled || !widgetContainer || !fedapay) {
                     return;
                 }

                if (typeof window !== 'undefined' && window.FedaPay) {
                    try {
                        // Créer le conteneur pour le widget avec une hauteur suffisante pour afficher tout le formulaire
                        const containerId = `fedapay-container-${payment.id}`;
                        // Hauteur très grande pour permettre au widget FedaPay de s'afficher entièrement
                        widgetContainer.innerHTML = `<div id="${containerId}" style="width: 100%; min-height: 2000px; height: auto !important; max-height: none !important; display: block; padding: 1rem 0; overflow: visible !important; position: relative;"></div>`;

                        const container = document.getElementById(containerId);

                        if (container && window.FedaPay) {
                            console.log('Initialisation du widget FedaPay avec:', {
                                public_key: fedapay.public_key?.substring(0, 20) + '...',
                                transaction_id: fedapay.transaction_id,
                                amount: fedapay.amount,
                                container: `#${containerId}`,
                            });

                            // Préparer la configuration de la transaction
                            const transactionConfig: any = {};
                            
                            // Si on a déjà un transaction_id, l'utiliser directement
                            if (fedapay.transaction_id) {
                                transactionConfig.id = fedapay.transaction_id;
                            } else {
                                // Sinon, créer une nouvelle transaction avec amount et description
                                transactionConfig.amount = fedapay.amount;
                                transactionConfig.description = `Paiement pour la commande #${payment.order?.order_number || payment.id}`;
                            }

                            // Initialiser le widget FedaPay avec la configuration correcte
                            // Ajouter des styles CSS personnalisés pour que le widget s'affiche entièrement
                            const style = document.createElement('style');
                            style.textContent = `
                                #${containerId}, #${containerId} * {
                                    max-height: none !important;
                                    overflow: visible !important;
                                }
                                #${containerId} iframe {
                                    min-height: 2000px !important;
                                    height: auto !important;
                                    max-height: none !important;
                                }
                            `;
                            document.head.appendChild(style);

                            window.FedaPay.init({
                                public_key: fedapay.public_key,
                                transaction: transactionConfig,
                                currency: {
                                    iso: payment.currency || 'XOF',
                                },
                                customer: {
                                    email: customerInfo?.email || undefined,
                                    firstname: firstName || undefined,
                                    lastname: lastName || undefined,
                                },
                                container: `#${containerId}`,
                                onComplete: async (resp: any) => {
                                    console.log('FedaPay transaction terminée - Réponse complète:', resp);
                                    widgetSuccessRef.current = true;
                                    
                                    // Extraire le transaction_id de différentes façons possibles
                                    let transactionId: string | undefined = fedapay.transaction_id;
                                    
                                    // Essayer d'extraire depuis la réponse
                                    if (resp) {
                                        const extractedId = extractTransactionId(resp);
                                        if (extractedId) {
                                            transactionId = extractedId;
                                            console.log('Transaction ID extrait de la réponse:', extractedId);
                                        }
                                        
                                        // Essayer aussi depuis resp.transaction ou resp.data
                                        if (!transactionId && resp.transaction) {
                                            transactionId = extractTransactionId(resp.transaction) || 
                                                           (typeof resp.transaction === 'object' && resp.transaction.id ? String(resp.transaction.id) : undefined) ||
                                                           (typeof resp.transaction === 'string' ? resp.transaction : undefined);
                                        }
                                        
                                        if (!transactionId && resp.data) {
                                            transactionId = extractTransactionId(resp.data) || 
                                                           (typeof resp.data === 'object' && resp.data.id ? String(resp.data.id) : undefined);
                                        }
                                        
                                        // Si resp est directement l'ID
                                        if (!transactionId && typeof resp === 'string') {
                                            transactionId = resp;
                                        }
                                        if (!transactionId && typeof resp === 'number') {
                                            transactionId = String(resp);
                                        }
                                    }
                                    
                                    console.log('Transaction ID final utilisé:', transactionId || fedapay.transaction_id || payment.id);
                                    
                                    // Utiliser le transaction_id connu ou forcer la finalisation avec le payment.id
                                    const finalTransactionId = transactionId || fedapay.transaction_id;
                                    
                                    // Forcer la finalisation immédiatement
                                    try {
                                        const result = await finalizePayment({ 
                                            transactionId: finalTransactionId, 
                                            force: true 
                                        }, 'fedapay-complete');
                                        
                                        console.log('Résultat de finalizePayment:', result);
                                        
                                        // Si le paiement n'est toujours pas complété, attendre un peu et réessayer
                                        if (result && result.status !== 'completed') {
                                            console.log('Paiement pas encore complété, nouvelle tentative dans 2 secondes...');
                                            setTimeout(async () => {
                                                await finalizePayment({ 
                                                    transactionId: finalTransactionId, 
                                                    force: true 
                                                }, 'fedapay-complete-retry');
                                            }, 2000);
                                        }
                                    } catch (error) {
                                        console.error('Erreur lors de la finalisation du paiement:', error);
                                        // En cas d'erreur, le polling continuera à vérifier
                                    }
                                },
                            });
                            
                            console.log('Widget FedaPay initialisé');
                            
                            // Attendre un peu que le widget se charge puis ajuster la hauteur
                            setTimeout(() => {
                                const iframe = container.querySelector('iframe');
                                if (iframe) {
                                    iframe.style.minHeight = '2000px';
                                    iframe.style.height = 'auto';
                                    iframe.style.maxHeight = 'none';
                                    iframe.style.width = '100%';
                                    console.log('Styles appliqués à l\'iframe FedaPay');
                                }
                                
                                // Également ajuster le conteneur parent
                                const fedaPayWrapper = container.querySelector('[class*="fedapay"]') || container.querySelector('[id*="fedapay"]');
                                if (fedaPayWrapper) {
                                    (fedaPayWrapper as HTMLElement).style.minHeight = '2000px';
                                    (fedaPayWrapper as HTMLElement).style.maxHeight = 'none';
                                    console.log('Styles appliqués au wrapper FedaPay');
                                }
                            }, 1000);
                        }
                    } catch (error) {
                        console.error('Erreur lors de l\'initialisation de FedaPay', error);
                        if (widgetContainer) {
                            widgetContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded">
                                <p class="font-semibold">Erreur d'initialisation du paiement</p>
                                <p class="text-sm mt-2">${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
                                <p class="text-sm mt-2">Veuillez réessayer ou contacter le support.</p>
                            </div>`;
                        }
                    }
                 } else {
                     retryCountRef.current++;
                     if (retryCountRef.current < maxRetries) {
                         retryTimeout = setTimeout(initializeFedaPay, 200);
                     } else {
                         widgetContainer.innerHTML = '<div class="text-red-500">Erreur de chargement du widget de paiement. Veuillez rafraîchir la page.</div>';
                     }
                 }
             };

             const checkScript = () => {
                if (cancelled) {
                    return;
                }
                const scriptLoaded = document.querySelector('script[src*="fedapay"]');
                console.log('Vérification script FedaPay:', {
                    scriptLoaded: !!scriptLoaded,
                    windowFedaPay: !!window.FedaPay,
                    retryCount: retryCountRef.current,
                });
                
                if (scriptLoaded && window.FedaPay) {
                    console.log('Script FedaPay chargé, initialisation du widget...');
                    initializeFedaPay();
                } else {
                    retryCountRef.current++;
                    if (retryCountRef.current < maxRetries) {
                        retryTimeout = setTimeout(checkScript, 200);
                    } else {
                        console.error('Timeout: Script FedaPay non chargé après', maxRetries, 'tentatives');
                        if (widgetContainer) {
                            widgetContainer.innerHTML = `
                                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <i class="las la-exclamation-circle text-red-500 text-4xl mb-4"></i>
                                    <h3 class="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                                    <p class="text-sm text-red-700 mb-4">
                                        Impossible de charger le widget de paiement. Veuillez rafraîchir la page.
                                    </p>
                                    <button 
                                        onClick="window.location.reload()" 
                                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Rafraîchir la page
                                    </button>
                                </div>
                            `;
                        }
                    }
                }
            };

            // Attendre un peu que le DOM soit prêt
            setTimeout(checkScript, 100);

             return () => {
                 cancelled = true;
                 if (retryTimeout) {
                     clearTimeout(retryTimeout);
                 }
             };
         }
    }, [customerInfo?.email, customerInfo?.phone, fedapay, finalizePayment, firstName, lastName, payment]);

    return (
        <PublicLayout>
            <Head title="Paiement - SouwTravel" />

            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="mb-6">
                                <div className="bg-primary/10 rounded-full p-4 inline-block mb-4">
                                    <i className="las la-credit-card text-primary text-4xl"></i>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Paiement en cours
                                </h1>
                                {payment.order && (
                                    <p className="text-gray-600">
                                        Commande:{' '}
                                        {payment.order.order_number}
                                    </p>
                                )}
                            </div>

                            <div className="mb-8">
                                <p className="text-sm text-gray-600 mb-2">
                                    Montant à payer
                                </p>
                                <PriceDisplay
                                    amount={payment.amount}
                                    size="lg"
                                />
                            </div>

                            <PaymentStatusBadge
                                status={payment.payment_status}
                                className="mb-6"
                            />

                            {payment.payment_method === 'fedapay' &&
                                payment.payment_status === 'pending' && (
                                    <>
                                        {fedapay ? (
                                            <div className="space-y-4 w-full" style={{ overflow: 'visible' }}>
                                                <div 
                                                    ref={widgetRef} 
                                                    className="w-full py-4" 
                                                    style={{ 
                                                        minHeight: '2000px', 
                                                        maxHeight: 'none', 
                                                        height: 'auto',
                                                        overflow: 'visible',
                                                        display: 'block',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div className="text-gray-500 text-sm">
                                                        Chargement du widget de paiement...
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Utilisez le widget ci-dessus pour
                                                    effectuer votre paiement.
                                                </p>
                                                {/* Debug info - à retirer en production */}
                                                {process.env.NODE_ENV === 'development' && (
                                                    <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                                                        <p>Clé publique: {fedapay.public_key?.substring(0, 20)}...</p>
                                                        <p>Montant: {fedapay.amount} FCFA</p>
                                                        <p>Sandbox: {fedapay.sandbox ? 'Oui' : 'Non'}</p>
                                                        {fedapay.transaction_id && (
                                                            <p>Transaction ID: {fedapay.transaction_id}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <i className="las la-exclamation-triangle text-yellow-600 text-2xl"></i>
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <h3 className="text-sm font-medium text-yellow-800">
                                                                Configuration du paiement en cours
                                                            </h3>
                                                            <div className="mt-2 text-sm text-yellow-700">
                                                                <p>
                                                                    Veuillez patienter pendant que nous initialisons votre paiement.
                                                                </p>
                                                                <p className="mt-2">
                                                                    Si le problème persiste, veuillez réessayer depuis la page de votre commande.
                                                                </p>
                                                            </div>
                                                            <div className="mt-4">
                                                                <a
                                                                    href={payment.order ? `/orders/${payment.order.id}` : '/orders'}
                                                                    className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
                                                                >
                                                                    Retour à la commande →
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                            {payment.payment_status !== 'pending' && (
                                <div className="mt-6">
                                    <a
                                        href="/orders"
                                        className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                                    >
                                        Retour aux commandes
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}


