import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ServiceCard } from '@/components/public';
import destinations from '@/routes/destinations';
import services from '@/routes/services';

interface Service {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    category?: {
        name: string;
        icon?: string;
    };
}

interface Destination {
    id: number;
    name: string;
    slug: string;
    description?: string;
    flag_emoji?: string;
    continent?: string;
    services?: Service[];
}

interface DestinationsShowProps {
    destination: Destination;
}

export default function DestinationsShow({
    destination,
}: DestinationsShowProps) {
    return (
        <PublicLayout>
            <Head title={`${destination.name} - SouwTravel`} />

            {/* Breadcrumb */}
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={destinations.index()}
                            className="text-gray-600 hover:text-primary"
                        >
                            Destinations
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        <span className="text-gray-900 font-medium">
                            {destination.name}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Destination Header */}
            <section className="py-12 bg-gradient-to-r from-primary to-primary/80 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        {destination.flag_emoji && (
                            <span className="text-6xl">
                                {destination.flag_emoji}
                            </span>
                        )}
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {destination.name}
                            </h1>
                            {destination.continent && (
                                <p className="text-xl text-white/90">
                                    {destination.continent}
                                </p>
                            )}
                        </div>
                    </div>
                    {destination.description && (
                        <p className="text-white/90 max-w-3xl">
                            {destination.description}
                        </p>
                    )}
                </div>
            </section>

            {/* Services Available */}
            {destination.services && destination.services.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Services disponibles pour {destination.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {destination.services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {(!destination.services ||
                destination.services.length === 0) && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center py-12">
                            <i className="las la-briefcase text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucun service disponible
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Les services pour cette destination seront
                                bientôt disponibles
                            </p>
                            <Link
                                href={services.index()}
                                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Voir tous les services
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}


