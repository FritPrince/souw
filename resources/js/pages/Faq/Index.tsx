import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { useState } from 'react';

interface Props {
    company: {
        name?: string;
    } | null;
}

const faqItems = [
    {
        category: 'Général',
        questions: [
            {
                question: 'Quels services propose SouwTravel ?',
                answer: 'SouwTravel propose une gamme complète de services incluant l\'assistance pour les visas et l\'immigration, les services de séjour et logistique, les documents administratifs, ainsi que le tourisme au Bénin. Nous accompagnons nos clients dans toutes les étapes de leurs démarches.',
            },
            {
                question: 'Comment puis-je contacter SouwTravel ?',
                answer: 'Vous pouvez nous contacter via notre page de contact, par téléphone, email ou WhatsApp. Toutes nos coordonnées sont disponibles dans le header et le footer du site.',
            },
            {
                question: 'Dans quels pays SouwTravel opère-t-elle ?',
                answer: 'Nous sommes spécialisés dans les services de visa et d\'immigration pour plusieurs destinations, avec un accent particulier sur le tourisme et les services au Bénin. Contactez-nous pour connaître les destinations spécifiques qui vous intéressent.',
            },
        ],
    },
    {
        category: 'Services et commandes',
        questions: [
            {
                question: 'Comment passer une commande de service ?',
                answer: 'Pour passer une commande : 1) Naviguez vers la page "Services", 2) Sélectionnez le service qui vous intéresse, 3) Remplissez le formulaire de commande avec vos informations, 4) Effectuez le paiement. Vous recevrez une confirmation par email.',
            },
            {
                question: 'Quels documents sont nécessaires pour une demande de visa ?',
                answer: 'Les documents requis varient selon le type de visa et la destination. Une liste complète des documents nécessaires est fournie sur la page de détails de chaque service de visa. En général, vous aurez besoin de votre passeport, photos d\'identité, justificatifs de ressources, et autres documents spécifiques selon le pays de destination.',
            },
            {
                question: 'Combien de temps prend le traitement d\'une demande ?',
                answer: 'Les délais de traitement varient selon le type de service et la complexité de votre dossier. Les délais estimés sont indiqués sur chaque page de service. Nous nous efforçons de traiter toutes les demandes dans les plus brefs délais tout en garantissant la qualité.',
            },
            {
                question: 'Puis-je suivre l\'avancement de ma commande ?',
                answer: 'Oui, une fois connecté à votre compte, vous pouvez accéder à la section "Mes commandes" pour voir le statut en temps réel de toutes vos commandes. Vous recevrez également des notifications par email lors des mises à jour importantes.',
            },
        ],
    },
    {
        category: 'Paiements',
        questions: [
            {
                question: 'Quels modes de paiement sont acceptés ?',
                answer: 'Nous acceptons les paiements via FedaPay (Mobile Money). Les paiements sont sécurisés et cryptés pour protéger vos informations financières.',
            },
            {
                question: 'Quand serai-je facturé ?',
                answer: 'Vous serez facturé au moment de la confirmation de votre commande. Le paiement doit être effectué avant que nous ne commencions le traitement de votre demande. Une fois le paiement confirmé, vous recevrez automatiquement une facture par email.',
            },
            {
                question: 'Que se passe-t-il si mon paiement échoue ?',
                answer: 'Si votre paiement échoue, veuillez vérifier que votre compte Mobile Money dispose de fonds suffisants et réessayez. Si le problème persiste, contactez notre service client qui pourra vous aider à résoudre le problème.',
            },
            {
                question: 'Puis-je obtenir un remboursement ?',
                answer: 'Les politiques de remboursement varient selon le type de service. Certains services peuvent être remboursables avant le début du traitement, tandis que d\'autres ne le sont pas une fois le processus initié. Contactez-nous pour connaître les conditions spécifiques à votre situation.',
            },
        ],
    },
    {
        category: 'Compte utilisateur',
        questions: [
            {
                question: 'Comment créer un compte ?',
                answer: 'Cliquez sur le bouton "Inscription" dans le header du site, remplissez le formulaire avec vos informations (nom, email, mot de passe), puis validez. Vous recevrez un email de confirmation pour activer votre compte.',
            },
            {
                question: 'J\'ai oublié mon mot de passe, que faire ?',
                answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?" et entrez votre adresse email. Vous recevrez un lien par email pour réinitialiser votre mot de passe.',
            },
            {
                question: 'Comment modifier mes informations personnelles ?',
                answer: 'Connectez-vous à votre compte et accédez à votre profil via le menu utilisateur (icône en haut à droite). Vous pourrez alors modifier vos informations personnelles, adresse, numéro de téléphone, etc.',
            },
        ],
    },
    {
        category: 'Consultations et rendez-vous',
        questions: [
            {
                question: 'Comment prendre rendez-vous pour une consultation ?',
                answer: 'Accédez à la page "Consultation" depuis le menu principal, choisissez une date disponible, sélectionnez un créneau horaire, puis confirmez votre rendez-vous. Vous recevrez une confirmation par email.',
            },
            {
                question: 'Puis-je annuler ou modifier mon rendez-vous ?',
                answer: 'Oui, vous pouvez annuler ou modifier votre rendez-vous depuis votre compte, dans la section "Mes rendez-vous". Nous vous demandons de nous prévenir au moins 24h à l\'avance pour les modifications.',
            },
            {
                question: 'Les consultations sont-elles payantes ?',
                answer: 'Les consultations peuvent être payantes selon le type de service. Le tarif est indiqué lors de la prise de rendez-vous. Les consultations initiales peuvent parfois être gratuites pour certains services.',
            },
        ],
    },
    {
        category: 'Tourisme et événements',
        questions: [
            {
                question: 'Proposez-vous des packages touristiques ?',
                answer: 'Oui, nous proposons une variété de packages touristiques pour découvrir le Bénin. Consultez notre section "Tourisme" pour découvrir nos offres, qui incluent des visites de sites historiques, des circuits culturels, et bien plus encore.',
            },
            {
                question: 'Comment participer à un événement organisé par SouwTravel ?',
                answer: 'Naviguez vers la page "Événements" pour voir tous nos événements à venir. Sélectionnez l\'événement qui vous intéresse, choisissez un pack (si applicable), remplissez le formulaire d\'inscription et effectuez le paiement. Vous recevrez une confirmation d\'inscription.',
            },
            {
                question: 'Les événements peuvent-ils être annulés ?',
                answer: 'En cas d\'annulation d\'un événement de notre part, vous serez intégralement remboursé. Si vous devez annuler votre participation, veuillez nous contacter. Les conditions de remboursement varient selon l\'événement et sont précisées lors de l\'inscription.',
            },
        ],
    },
];

export default function FaqIndex({ company }: Props) {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const filteredCategories = selectedCategory
        ? faqItems.filter(cat => cat.category === selectedCategory)
        : faqItems;

    const categories = Array.from(new Set(faqItems.map(item => item.category)));

    return (
        <PublicLayout>
            <Head title={`FAQ - ${company?.name ?? 'SouwTravel'}`} />

            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Questions fréquemment posées
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Trouvez rapidement des réponses aux questions les plus courantes sur nos services.
                            </p>
                        </div>

                        {/* Filtres par catégorie */}
                        <div className="mb-8 flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === null
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                Toutes les catégories
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedCategory === category
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Liste des FAQ */}
                        <div className="space-y-6">
                            {filteredCategories.map((category, categoryIndex) => (
                                <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                    <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {category.category}
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {category.questions.map((faq, questionIndex) => {
                                            const key = `${categoryIndex}-${questionIndex}`;
                                            const isExpanded = expandedItems[key];
                                            return (
                                                <div key={questionIndex} className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                                                        className="w-full text-left flex items-start justify-between gap-4 group"
                                                    >
                                                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-[var(--primary)] transition-colors flex-1">
                                                            {faq.question}
                                                        </span>
                                                        <svg
                                                            className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Section contact */}
                        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Vous ne trouvez pas la réponse ?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Notre équipe est disponible pour répondre à toutes vos questions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary)]/90 transition-colors"
                                >
                                    Nous contacter
                                </Link>
                                <Link
                                    href="/help"
                                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Centre d'aide
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}



