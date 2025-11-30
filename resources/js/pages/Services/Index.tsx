import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ServiceCard } from '@/components/public';
import servicesRoutes from '@/routes/services';
import { type PaginatedData } from '@/types';

interface Service {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    category?: {
        id: number;
        name: string;
        icon?: string;
    };
    image?: string;
    destinations?: Array<{
        id: number;
        name: string;
        flag_emoji?: string;
    }>;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

interface Destination {
    id: number;
    name: string;
    slug: string;
    flag_emoji?: string;
}

interface ServicesIndexProps {
    services: PaginatedData<Service>;
    categories: Category[];
    destinations: Destination[];
    destination?: Destination;
    filters?: {
        destination?: number;
        search?: string;
    };
    heroImage?: string;
}

export default function ServicesIndex({
    services,
    categories,
    destinations,
    destination,
    filters = {},
    heroImage = '/storage/front/images/hero-bg3.jpg',
}: ServicesIndexProps) {
    const activeDestinationId =
        destination?.id ?? (filters.destination ? Number(filters.destination) : null);

    const handleFilterChange = (newDestination?: number | null) => {
        const query: Record<string, string> = {};

        if (newDestination) {
            query.destination = String(newDestination);
        }

        // Preserve search if exists
        if (filters.search) {
            query.search = filters.search;
        }

        router.get(servicesRoutes.index.url(), query, {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        const query: Record<string, string> = {};
        if (filters.search) {
            query.search = filters.search;
        }
        router.get(servicesRoutes.index.url(), query, {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    };

    return (
        <PublicLayout>
            <Head title="Services - SouwTravel" />

            {/* Hero Section */}
            <section 
                className="relative text-white py-20 md:py-24 bg-cover bg-center bg-no-repeat"
                style={heroImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`
                } : {
                    background: 'linear-gradient(to right, var(--primary), var(--primary)/80)'
                }}
            >
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Nos Services</h1>
                    <p className="text-white/90">
                        {destination
                            ? `Services pour: ${destination.name}`
                            : 'Découvrez tous nos services de voyage et d\'immigration'}
                    </p>
                    {activeDestinationId && (
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="text-sm text-white/80 hover:text-white underline"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Filters Section */}
            <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4">
                    {/* Nos procédures Section */}
                    <div className="py-8 border-b">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Nos procédures</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Nos conseillers de voyage expérimentés répondent à vos questions et vous offrent des conseils personnalisés pour des destinations exotiques, séjours de luxe, vacances en famille ou voyages d'affaires.
                        </p>
                    </div>

                    {/* Destination Tabs */}
                    {destinations.length > 0 && (
                        <div className="py-4">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange(null)}
                                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                                        !activeDestinationId
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    Toutes les destinations
                                </button>

                                {destinations.map((dest) => {
                                    const isActive = activeDestinationId === dest.id;

                                    return (
                                        <button
                                            key={dest.id}
                                            type="button"
                                            onClick={() => handleFilterChange(dest.id)}
                                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                                                isActive
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="mr-1">
                                                {dest.flag_emoji ?? '🌍'}
                                            </span>
                                            {dest.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    {services.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.data.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {services.links && services.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex gap-2">
                                        {services.links.map((link, index) => (
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
                        <div className="text-center py-12">
                            <i className="las la-search text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucun service trouvé
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {activeDestinationId
                                    ? 'Aucun service ne correspond à vos critères de filtrage.'
                                    : 'Aucun service n\'est disponible pour le moment.'}
                            </p>
                            {activeDestinationId && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Envoi de colis */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Envoi de colis
                            </h2>
                            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
                                Nous comprenons l'importance de l'envoi de colis en toute confiance et sans tracas. Chez MYST EXPERT, nous avons créé un service d'expédition de colis fiable, pratique et accessible. Voici pourquoi vous devriez choisir notre service d'envoi de colis
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Expédition Simplifiée */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="mb-6 flex justify-center">
                                    <svg
                                        viewBox="0 0 200 200"
                                        className="w-32 h-32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Colis détaillé avec ruban */}
                                        <rect x="50" y="60" width="100" height="80" rx="4" fill="#10B981" />
                                        {/* Ruban horizontal */}
                                        <rect x="50" y="95" width="100" height="10" fill="white" />
                                        {/* Ruban vertical */}
                                        <rect x="95" y="60" width="10" height="80" fill="white" />
                                        {/* Étiquettes */}
                                        <rect x="60" y="70" width="30" height="20" rx="2" fill="white" opacity="0.9" />
                                        <rect x="110" y="70" width="30" height="20" rx="2" fill="white" opacity="0.9" />
                                        {/* Lignes d'adresse */}
                                        <line x1="65" y1="75" x2="85" y2="75" stroke="#10B981" strokeWidth="1.5" />
                                        <line x1="65" y1="82" x2="85" y2="82" stroke="#10B981" strokeWidth="1.5" />
                                        {/* Flèche de mouvement */}
                                        <path
                                            d="M160 100 L185 100 M180 95 L185 100 L180 105"
                                            stroke="#059669"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                        {/* Lignes de trajectoire */}
                                        <path
                                            d="M155 100 Q170 90 185 100"
                                            stroke="#34D399"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeDasharray="4,4"
                                            opacity="0.6"
                                        />
                                        {/* Camion de livraison simplifié */}
                                        <g transform="translate(180, 85)">
                                            <rect x="0" y="0" width="15" height="12" rx="2" fill="#059669" />
                                            <circle cx="4" cy="15" r="3" fill="#1F2937" />
                                            <circle cx="11" cy="15" r="3" fill="#1F2937" />
                                        </g>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Expédition Simplifiée
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Nous avons simplifié l'envoi de colis pour vous faire gagner du temps. Pour des envois locaux ou internationaux, notre équipe expérimentée s'occupe de tout, de la collecte à la livraison.
                                </p>
                            </div>

                            {/* Emballage de Qualité */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="mb-6 flex justify-center">
                                    <svg
                                        viewBox="0 0 200 200"
                                        className="w-32 h-32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Colis principal avec protection */}
                                        <rect x="50" y="50" width="100" height="100" rx="6" fill="#3B82F6" />
                                        {/* Ruban de qualité */}
                                        <rect x="50" y="95" width="100" height="12" fill="#FCD34D" />
                                        <rect x="95" y="50" width="12" height="100" fill="#FCD34D" />
                                        {/* Bulles de protection (simulation mousse) */}
                                        <circle cx="70" cy="70" r="4" fill="white" opacity="0.6" />
                                        <circle cx="90" cy="75" r="3" fill="white" opacity="0.6" />
                                        <circle cx="110" cy="70" r="4" fill="white" opacity="0.6" />
                                        <circle cx="130" cy="75" r="3" fill="white" opacity="0.6" />
                                        <circle cx="70" cy="130" r="4" fill="white" opacity="0.6" />
                                        <circle cx="90" cy="125" r="3" fill="white" opacity="0.6" />
                                        <circle cx="110" cy="130" r="4" fill="white" opacity="0.6" />
                                        <circle cx="130" cy="125" r="3" fill="white" opacity="0.6" />
                                        {/* Étiquette "FRAGILE" */}
                                        <rect x="65" y="65" width="70" height="25" rx="3" fill="white" />
                                        <text x="100" y="82" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">FRAGILE</text>
                                        {/* Étoiles de qualité */}
                                        <path
                                            d="M40 40 L41.5 44.5 L46 45.5 L42.5 48.5 L43.5 53 L40 50.5 L36.5 53 L37.5 48.5 L34 45.5 L38.5 44.5 Z"
                                            fill="#FCD34D"
                                        />
                                        <path
                                            d="M160 40 L161.5 44.5 L166 45.5 L162.5 48.5 L163.5 53 L160 50.5 L156.5 53 L157.5 48.5 L154 45.5 L158.5 44.5 Z"
                                            fill="#FCD34D"
                                        />
                                        <path
                                            d="M40 160 L41.5 164.5 L46 165.5 L42.5 168.5 L43.5 173 L40 170.5 L36.5 173 L37.5 168.5 L34 165.5 L38.5 164.5 Z"
                                            fill="#FCD34D"
                                        />
                                        <path
                                            d="M160 160 L161.5 164.5 L166 165.5 L162.5 168.5 L163.5 173 L160 170.5 L156.5 173 L157.5 168.5 L154 165.5 L158.5 164.5 Z"
                                            fill="#FCD34D"
                                        />
                                        {/* Bouclier de protection */}
                                        <path
                                            d="M100 30 L110 35 L110 45 L100 50 L90 45 L90 35 Z"
                                            fill="#10B981"
                                            opacity="0.8"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Emballage de Qualité
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Votre colis est en sécurité avec MYST EXPERT. Nous utilisons des emballages de haute qualité pour protéger vos envois, qu'il s'agisse de documents, de cadeaux ou de marchandises.
                                </p>
                            </div>

                            {/* Suivi en Temps Réel */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="mb-6 flex justify-center">
                                    <svg
                                        viewBox="0 0 200 200"
                                        className="w-32 h-32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Colis au centre */}
                                        <rect x="70" y="80" width="60" height="50" rx="4" fill="#8B5CF6" />
                                        <rect x="75" y="85" width="20" height="15" fill="white" opacity="0.8" />
                                        <rect x="100" y="85" width="20" height="15" fill="white" opacity="0.8" />
                                        <rect x="75" y="105" width="45" height="20" fill="white" opacity="0.8" />
                                        
                                        {/* Radar/Sonar avec cercles concentriques */}
                                        <circle cx="100" cy="105" r="55" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.6" />
                                        <circle cx="100" cy="105" r="40" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.7" />
                                        <circle cx="100" cy="105" r="25" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.8" />
                                        
                                        {/* Lignes de balayage radar */}
                                        <line
                                            x1="100"
                                            y1="105"
                                            x2="145"
                                            y2="75"
                                            stroke="#8B5CF6"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        <line
                                            x1="100"
                                            y1="105"
                                            x2="55"
                                            y2="135"
                                            stroke="#C4B5FD"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            opacity="0.6"
                                        />
                                        
                                        {/* Points de localisation GPS */}
                                        <g transform="translate(145, 75)">
                                            <circle cx="0" cy="0" r="6" fill="#10B981" />
                                            <circle cx="0" cy="0" r="6" fill="#10B981" opacity="0.3">
                                                <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        </g>
                                        
                                        {/* Icône de téléphone/suivi */}
                                        <g transform="translate(30, 30)">
                                            <rect x="0" y="0" width="25" height="40" rx="4" fill="#8B5CF6" />
                                            <rect x="3" y="5" width="19" height="12" rx="1" fill="white" opacity="0.9" />
                                            <circle cx="12.5" cy="30" r="3" fill="white" />
                                        </g>
                                        
                                        {/* Icône de carte mondiale */}
                                        <g transform="translate(145, 30)">
                                            <circle cx="12" cy="12" r="10" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                                            <path d="M12 2 Q8 8 4 12 Q8 16 12 22 Q16 16 20 12 Q16 8 12 2" fill="#8B5CF6" opacity="0.3" />
                                            <circle cx="12" cy="12" r="2" fill="#10B981" />
                                        </g>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Suivi en Temps Réel
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Restez informé de l'emplacement de votre colis grâce à notre suivi en temps réel. Vous saurez toujours où se trouve votre envoi, qu'il soit en ville ou à l'autre bout du monde.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Réservation de billets d'avions et d'accommodations */}
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Image Illustration */}
                            <div className="order-2 md:order-1">
                                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                                    <img
                                        src="/storage/front/images/hero-bg2.jpg"
                                        alt="Réservation de billets d'avions et d'accommodations"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="order-1 md:order-2">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                    Réservation de billets d'avions et d'accommodations
                                </h2>
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    La réservation de vos vols, hôtels, locations de voiture et autres besoins de voyage est simple et rapide grâce aux dernières technologies. Nous tenons compte de vos préférences et de votre budget.
                                </p>
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    Nous offrons un service personnalisé pour répondre à vos besoins spécifiques, que ce soit pour des vols nationaux ou internationaux.
                                </p>
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    Que ce soit pour une escapade de dernière minute, des vacances en famille, ou un voyage d'affaires important, notre équipe dédiée est prête à vous aider à trouver les billets d'avion parfaits.
                                </p>
                                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                    Détendez-vous, nous nous occupons de tout, de la recherche des meilleures offres à la réservation de votre siège.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}


