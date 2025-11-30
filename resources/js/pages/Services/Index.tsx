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
            <section className="py-12">
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
        </PublicLayout>
    );
}


