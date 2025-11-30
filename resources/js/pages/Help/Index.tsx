import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { useState } from 'react';

interface Props {
    company: {
        name?: string;
    } | null;
}

const helpCategories = [
    {
        id: 'account',
        title: 'Compte utilisateur',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        topics: [
            { title: 'Comment créer un compte ?', content: 'Pour créer un compte, cliquez sur le bouton "Inscription" dans le header, remplissez le formulaire avec vos informations et validez.' },
            { title: 'J\'ai oublié mon mot de passe', content: 'Utilisez le lien "Mot de passe oublié ?" sur la page de connexion pour réinitialiser votre mot de passe par email.' },
            { title: 'Comment modifier mes informations ?', content: 'Une fois connecté, accédez à votre profil via le menu utilisateur pour modifier vos informations personnelles.' },
        ],
    },
    {
        id: 'services',
        title: 'Services et commandes',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        topics: [
            { title: 'Comment passer une commande ?', content: 'Naviguez vers la page "Services", sélectionnez le service qui vous intéresse, puis suivez les étapes pour créer votre commande.' },
            { title: 'Quels documents dois-je fournir ?', content: 'Les documents requis varient selon le service choisi. Ils sont listés sur la page de détails de chaque service.' },
            { title: 'Comment suivre ma commande ?', content: 'Connectez-vous à votre compte, puis allez dans "Mes commandes" pour voir le statut de toutes vos commandes.' },
        ],
    },
    {
        id: 'payments',
        title: 'Paiements',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        topics: [
            { title: 'Quels modes de paiement sont acceptés ?', content: 'Nous acceptons les paiements via FedaPay (Mobile Money). Tous les paiements sont sécurisés.' },
            { title: 'Que faire si mon paiement échoue ?', content: 'Vérifiez que votre compte Mobile Money dispose de fonds suffisants et réessayez. Si le problème persiste, contactez-nous.' },
            { title: 'Quand recevrai-je ma facture ?', content: 'Une fois le paiement confirmé, vous recevrez automatiquement une facture par email à l\'adresse associée à votre compte.' },
        ],
    },
    {
        id: 'consultation',
        title: 'Consultations et rendez-vous',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        topics: [
            { title: 'Comment prendre un rendez-vous ?', content: 'Accédez à la page "Consultation" depuis le menu, choisissez une date et un créneau horaire disponible, puis confirmez votre rendez-vous.' },
            { title: 'Puis-je annuler ou modifier mon rendez-vous ?', content: 'Oui, vous pouvez annuler ou modifier votre rendez-vous depuis la section "Mes rendez-vous" de votre compte.' },
            { title: 'Quels sont les horaires de consultation ?', content: 'Les créneaux de consultation sont affichés sur la page de prise de rendez-vous. Choisissez celui qui vous convient le mieux.' },
        ],
    },
];

export default function HelpIndex({ company }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    const toggleTopic = (categoryId: string, topicIndex: number) => {
        const key = `${categoryId}-${topicIndex}`;
        setExpandedTopics(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <PublicLayout>
            <Head title={`Centre d'aide - ${company?.name ?? 'SouwTravel'}`} />

            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Centre d'aide
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Trouvez rapidement des réponses à vos questions ou contactez notre équipe pour obtenir de l'aide personnalisée.
                            </p>
                        </div>

                        {/* Recherche rapide */}
                        <div className="mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Rechercher dans le centre d'aide..."
                                            className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <Link
                                        href="/contact"
                                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary)]/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Nous contacter
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Catégories d'aide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {helpCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                            {category.icon}
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {category.title}
                                        </h2>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {category.topics.length} sujets disponibles
                                    </p>
                                    {selectedCategory === category.id && (
                                        <div className="mt-4 space-y-3 border-t pt-4">
                                            {category.topics.map((topic, index) => {
                                                const key = `${category.id}-${index}`;
                                                const isExpanded = expandedTopics[key];
                                                return (
                                                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleTopic(category.id, index);
                                                            }}
                                                            className="w-full text-left flex items-center justify-between gap-4 py-2 hover:text-[var(--primary)] transition-colors"
                                                        >
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {topic.title}
                                                            </span>
                                                            <svg
                                                                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="mt-2 text-gray-600 dark:text-gray-400 pl-2">
                                                                {topic.content}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Contact rapide */}
                        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 rounded-lg shadow-lg p-8 text-center text-white">
                            <h2 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h2>
                            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                                Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou assistance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="px-6 py-3 bg-white text-[var(--primary)] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Contacter le support
                                </Link>
                                <Link
                                    href="/faq"
                                    className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors border-2 border-white"
                                >
                                    Voir les FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
