import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { OrderStatusBadge, PriceDisplay, EmptyState } from '@/components/public';
import tourism from '@/routes/tourism';
import { type PaginatedData } from '@/types';

interface TourismPackage {
    id: number;
    name: string;
    slug: string;
    duration_days: number;
    price: number;
}

interface TourismBooking {
    id: number;
    start_date: string;
    end_date: string;
    number_of_people: number;
    total_amount: number;
    status: string;
    created_at: string;
    start_date_formatted?: string | null;
    end_date_formatted?: string | null;
    tourism_package?: TourismPackage;
}

interface TourismMyBookingsProps {
    bookings: PaginatedData<TourismBooking>;
}

export default function TourismMyBookings({
    bookings,
}: TourismMyBookingsProps) {
    return (
        <PublicLayout>
            <Head title="Mes Réservations Tourisme - SouwTravel" />

            {/* Header */}
            <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">
                        Mes Réservations Tourisme
                    </h1>
                    <p className="text-white/90">
                        Gérez toutes vos réservations de tourisme
                    </p>
                </div>
            </section>

            {/* Bookings List */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {bookings.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {bookings.data.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="bg-primary/10 rounded-full p-3">
                                                        <i className="las la-map-marked-alt text-primary text-2xl"></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {booking.tourism_package
                                                                ?.name ||
                                                                'Package touristique'}
                                                        </h3>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <p className="flex items-center gap-2">
                                                                <i className="las la-calendar"></i>
                                                                Du{' '}
                                                                {booking.start_date_formatted ??
                                                                    new Date(
                                                                        booking.start_date,
                                                                    ).toLocaleDateString(
                                                                        'fr-FR',
                                                                    )}{' '}
                                                                au{' '}
                                                                {booking.end_date_formatted ??
                                                                    new Date(
                                                                        booking.end_date,
                                                                    ).toLocaleDateString(
                                                                        'fr-FR',
                                                                    )}
                                                            </p>
                                                            <p className="flex items-center gap-2">
                                                                <i className="las la-users"></i>
                                                                {booking.number_of_people}{' '}
                                                                personne
                                                                {booking.number_of_people >
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                            </p>
                                                            {booking.tourism_package && (
                                                                <p className="flex items-center gap-2">
                                                                    <i className="las la-clock"></i>
                                                                    {
                                                                        booking
                                                                            .tourism_package
                                                                            .duration_days
                                                                    }{' '}
                                                                    jour
                                                                    {booking
                                                                        .tourism_package
                                                                        .duration_days >
                                                                    1
                                                                        ? 's'
                                                                        : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Montant total
                                                        </p>
                                                        <PriceDisplay
                                                            amount={
                                                                booking.total_amount
                                                            }
                                                        />
                                                    </div>
                                                    <OrderStatusBadge
                                                        status={booking.status}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {bookings.links && bookings.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex gap-2">
                                        {bookings.links.map((link, index) => (
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
                            title="Aucune réservation"
                            description="Vous n'avez pas encore de réservations de tourisme."
                            action={{
                                label: 'Découvrir les packages',
                                href: tourism.index(),
                            }}
                        />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}


