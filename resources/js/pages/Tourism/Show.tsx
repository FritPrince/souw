import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay } from '@/components/public';
import { Button } from '@/components/ui/button';
import tourism from '@/routes/tourism';
import { book as tourismBook } from '@/routes/tourism';

type ItineraryItem =
    | string
    | {
          day?: number;
          title?: string;
          description?: string;
      };

interface TourismPackage {
    id: number;
    name: string;
    slug: string;
    description?: string;
    duration_days: number;
    price: number;
    includes?: string[];
    itinerary?: ItineraryItem[];
    images?: string[];
    image_url?: string | null;
}

interface TourismShowProps {
    package: TourismPackage;
}

export default function TourismShow({ package: pkg }: TourismShowProps) {
    const { data, setData, post, processing } = useForm({
        tourism_package_id: pkg.id,
        start_date: '',
        end_date: '',
        number_of_people: 1,
    });

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        post(tourismBook.url());
    };

    const calculateTotal = () => {
        return pkg.price * data.number_of_people;
    };

    return (
        <PublicLayout>
            <Head title={`${pkg.name} - SouwTravel`} />

            {/* Breadcrumb */}
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={tourism.index()}
                            className="text-gray-600 hover:text-primary"
                        >
                            Tourisme
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        <span className="text-gray-900 font-medium">
                            {pkg.name}
                        </span>
                    </nav>
                </div>
            </section>

            {/* Package Details */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Package Header */}
                            <div className="bg-white rounded-lg shadow-md p-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {pkg.name}
                                </h1>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                        <i className="las la-clock"></i>
                                        {pkg.duration_days} jour
                                        {pkg.duration_days > 1 ? 's' : ''}
                                    </span>
                                    <PriceDisplay amount={pkg.price} />
                                    <span className="text-sm text-gray-500">
                                        par personne
                                    </span>
                                </div>

                                {pkg.image_url && (
                                    <div className="mb-6 rounded-lg overflow-hidden">
                                        <img
                                            src={pkg.image_url}
                                            alt={pkg.name}
                                            className="w-full h-64 md:h-80 object-cover"
                                        />
                                    </div>
                                )}

                                {pkg.description && (
                                    <div className="prose max-w-none mb-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {pkg.description}
                                        </p>
                                    </div>
                                )}

                                {pkg.includes && pkg.includes.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            Ce qui est inclus
                                        </h3>
                                        <ul className="space-y-2">
                                            {pkg.includes.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2"
                                                >
                                                    <i className="las la-check-circle text-green-500 mt-1"></i>
                                                    <span className="text-gray-700">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {pkg.itinerary && pkg.itinerary.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Itinéraire
                                        </h3>
                                        <div className="space-y-4">
                                            {pkg.itinerary.map((item, index) => {
                                                const isString =
                                                    typeof item === 'string';
                                                const dayNumber = isString
                                                    ? index + 1
                                                    : item.day ?? index + 1;
                                                const title = isString
                                                    ? item
                                                    : item.title ??
                                                      `Jour ${dayNumber}`;
                                                const description = isString
                                                    ? ''
                                                    : item.description ?? '';

                                                return (
                                                    <div
                                                        key={`${dayNumber}-${title}-${index}`}
                                                        className="border-l-4 border-primary pl-4"
                                                    >
                                                        <h4 className="font-semibold text-gray-900 mb-1">
                                                            {isString
                                                                ? title
                                                                : `Jour ${dayNumber}${
                                                                      title
                                                                          ? ` : ${title}`
                                                                          : ''
                                                                  }`}
                                                        </h4>
                                                        {description && (
                                                            <p className="text-gray-600 text-sm">
                                                                {description}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gallery */}
                            {(() => {
                                const galleryImages =
                                    pkg.images && pkg.images.length > 0
                                        ? pkg.images
                                        : pkg.image_url
                                            ? [pkg.image_url]
                                            : [];

                                if (galleryImages.length === 0) {
                                    return null;
                                }

                                return (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                                            Galerie photos
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {galleryImages.map(
                                                (image, index) => (
                                                    <img
                                                        key={`${image}-${index}`}
                                                        src={image}
                                                        alt={`${pkg.name} - Image ${index + 1}`}
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Booking Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Réserver ce package
                                </h2>

                                <form onSubmit={handleBooking} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                            min={new Date()
                                                .toISOString()
                                                .split('T')[0]}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date de fin
                                        </label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                            min={data.start_date || new Date()
                                                .toISOString()
                                                .split('T')[0]}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre de personnes
                                        </label>
                                        <input
                                            type="number"
                                            value={data.number_of_people}
                                            onChange={(e) =>
                                                setData(
                                                    'number_of_people',
                                                    Number(e.target.value),
                                                )
                                            }
                                            min={1}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Prix unitaire
                                                </span>
                                                <PriceDisplay
                                                    amount={pkg.price}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Nombre de personnes
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {data.number_of_people}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                                                <span className="text-gray-900">
                                                    Total
                                                </span>
                                                <PriceDisplay
                                                    amount={calculateTotal()}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            {processing
                                                ? 'Traitement...'
                                                : 'Réserver maintenant'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

