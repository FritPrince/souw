import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { DestinationCard } from '@/components/public';
import destinations from '@/routes/destinations';

interface Destination {
    id: number;
    name: string;
    slug: string;
    description?: string;
    flag_emoji?: string;
    continent?: string;
    image?: string;
}

interface DestinationsIndexProps {
    destinations: Destination[];
    heroImage?: string;
}

export default function DestinationsIndex({
    destinations,
    heroImage = '/storage/front/images/hero-bg4.jpg',
}: DestinationsIndexProps) {
    return (
        <PublicLayout>
            <Head title="Destinations - SouwTravel" />

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
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Nos Destinations
                    </h1>
                    <p className="text-white/90">
                        Découvrez toutes les destinations où nous proposons
                        nos services
                    </p>
                </div>
            </section>

            {/* Destinations Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {destinations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {destinations.map((destination) => (
                                <DestinationCard
                                    key={destination.id}
                                    destination={destination}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <i className="las la-globe text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Aucune destination disponible
                            </h3>
                            <p className="text-gray-600">
                                Les destinations seront bientôt disponibles
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}


