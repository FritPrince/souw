import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay, EmptyState } from '@/components/public';
import tourism from '@/routes/tourism';
import { show as tourismShow } from '@/routes/tourism';
import { type PaginatedData } from '@/types';

interface TourismPackage {
    id: number;
    name: string;
    slug: string;
    description?: string;
    duration_days: number;
    price: number;
    includes?: string[];
    itinerary?: Array<
        | string
        | {
              day?: number;
              title?: string;
              description?: string;
          }
    >;
    image_path?: string | null;
    image_url?: string | null;
}

interface TourismIndexProps {
    packages: PaginatedData<TourismPackage>;
    filters?: {
        duration?: number;
        max_price?: number;
    };
    heroImage?: string;
}

export default function TourismIndex({
    packages,
    filters = {},
    heroImage = '/storage/front/images/hero-bg5.jpg',
}: TourismIndexProps) {
    const { data, setData, get } = useForm({
        duration: filters.duration || '',
        max_price: filters.max_price || '',
    });

    const handleFilter = () => {
        get(tourism.index(), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout>
            <Head title="Tourisme Bénin - SouwTravel" />

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
                        Tourisme au Bénin
                    </h1>
                    <p className="text-white/90">
                        Découvrez les merveilles du Bénin avec nos packages
                        touristiques
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="py-8 bg-gray-50 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durée maximale (jours)
                            </label>
                            <input
                                type="number"
                                value={data.duration}
                                onChange={(e) =>
                                    setData('duration', e.target.value)
                                }
                                placeholder="Ex: 7"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix maximum
                            </label>
                            <input
                                type="number"
                                value={data.max_price}
                                onChange={(e) =>
                                    setData('max_price', e.target.value)
                                }
                                placeholder="Ex: 50000"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                            >
                                Filtrer
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packages Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {packages.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.data.map((pkg) => (
                                    <Link
                                        key={pkg.id}
                                        href={tourismShow({ slug: pkg.slug })}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                                    >
                                        {(pkg.image_url || pkg.image_path) && (
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={pkg.image_url ?? pkg.image_path ?? ''}
                                                    alt={pkg.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {pkg.duration_days} jour
                                                        {pkg.duration_days > 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {pkg.name}
                                            </h3>
                                            {pkg.description && (
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                    {pkg.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <PriceDisplay amount={pkg.price} />
                                                <span className="text-sm text-gray-500">
                                                    Par personne
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {packages.links && packages.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex gap-2">
                                        {packages.links.map((link, index) => (
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
                            icon="las la-map-marked-alt"
                            title="Aucun package disponible"
                            description="Les packages touristiques seront bientôt disponibles."
                        />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

