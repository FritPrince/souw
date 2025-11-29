import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { OrderStatusBadge, EmptyState } from '@/components/public';
import appointments, { show as appointmentShow } from '@/routes/appointments';
import { type PaginatedData } from '@/types';
import { Calendar, Clock, MapPin, Package, Eye, Ticket, CalendarCheck } from 'lucide-react';

interface AppointmentSlot {
    date: string;
    start_time: string;
    end_time: string;
}

interface Appointment {
    id: number;
    status: string;
    notes?: string;
    created_at: string;
    appointment_slot?: AppointmentSlot;
    service?: {
        id: number;
        name: string;
        slug: string;
    };
    order?: {
        id: number;
        order_number: string;
    };
}

interface EventRegistration {
    id: number;
    reference: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
    event?: {
        id: number;
        name: string;
        slug: string;
        image_path?: string;
        location?: string;
        country?: string;
        start_date?: string;
        end_date?: string;
    };
    pack?: {
        id: number;
        name: string;
        price: number;
    };
}

interface AppointmentsIndexProps {
    appointments: PaginatedData<Appointment>;
    eventRegistrations?: EventRegistration[];
}

const statusConfig = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
    completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-800' },
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export default function AppointmentsIndex({
    appointments,
    eventRegistrations = [],
}: AppointmentsIndexProps) {
    return (
        <PublicLayout>
            <Head title="Mes Réservations - SouwTravel" />

            {/* Header */}
            <section className="bg-gradient-to-r from-[var(--primary)] to-cyan-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Mes Réservations</h1>
                    <p className="text-white/90">
                        Gérez tous vos rendez-vous et inscriptions aux événements
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12 space-y-12">
                {/* Section Rendez-vous */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                            <CalendarCheck className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h2>
                    </div>

                    {appointments.data.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {appointments.data.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="bg-[var(--primary)]/10 rounded-full p-3">
                                                        <CalendarCheck className="w-6 h-6 text-[var(--primary)]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {appointment.service?.name || 'Rendez-vous'}
                                                        </h3>
                                                        {appointment.appointment_slot && (
                                                            <div className="space-y-1 text-sm text-gray-600">
                                                                <p className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {new Date(appointment.appointment_slot.date).toLocaleDateString('fr-FR', {
                                                                            weekday: 'long',
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric',
                                                                    })}
                                                                </p>
                                                                <p className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4" />
                                                                    {appointment.appointment_slot.start_time} - {appointment.appointment_slot.end_time}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {appointment.order && (
                                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Commande: </span>
                                                            {appointment.order.order_number}
                                                        </p>
                                                    </div>
                                                )}

                                                {appointment.notes && (
                                                    <p className="text-sm text-gray-600 mb-4">{appointment.notes}</p>
                                                )}

                                                <OrderStatusBadge status={appointment.status} />
                                            </div>

                                            <Link
                                                href={appointmentShow.url(appointment.id)}
                                                className="ml-4 p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {appointments.links && appointments.links.length > 3 && (
                                    <div className="mt-8 flex justify-center">
                                        <nav className="flex gap-2">
                                        {appointments.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`px-4 py-2 rounded-lg ${
                                                            link.active
                                                        ? 'bg-[var(--primary)] text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                        ))}
                                        </nav>
                                    </div>
                                )}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
                            <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
                            <p className="text-gray-600">Vous n'avez pas encore de rendez-vous programmés.</p>
                        </div>
                    )}
                </section>

                {/* Section Inscriptions aux événements */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Ticket className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Mes Inscriptions aux Événements</h2>
                    </div>

                    {eventRegistrations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {eventRegistrations.map((registration) => (
                                <div
                                    key={registration.id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
                                >
                                    {/* Image de l'événement */}
                                    {registration.event?.image_path && (
                                        <div 
                                            className="h-32 bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${registration.event.image_path})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-3 left-4 right-4">
                                                <h3 className="text-lg font-bold text-white truncate">
                                                    {registration.event.name}
                                                </h3>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-5">
                                        {!registration.event?.image_path && registration.event && (
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">
                                                {registration.event.name}
                                            </h3>
                                        )}

                                        <div className="space-y-2 mb-4">
                                            {/* Référence */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Référence</span>
                                                <span className="font-mono text-sm font-semibold text-[var(--primary)]">
                                                    {registration.reference}
                                                </span>
                                            </div>

                                            {/* Pack */}
                                            {registration.pack && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Package className="w-4 h-4" />
                                                        Pack
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {registration.pack.name}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Prix */}
                                            {registration.pack && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Prix</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(registration.pack.price)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Lieu */}
                                            {registration.event && (registration.event.location || registration.event.country) && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        Lieu
                                                    </span>
                                                    <span className="text-sm text-gray-700">
                                                        {[registration.event.location, registration.event.country].filter(Boolean).join(', ')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Date de l'événement */}
                                            {registration.event?.start_date && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Date
                                                    </span>
                                                    <span className="text-sm text-gray-700">
                                                        {formatDate(registration.event.start_date)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Statut et Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[registration.status].color}`}>
                                                {statusConfig[registration.status].label}
                                            </span>
                                            {registration.event && (
                                                <Link
                                                    href={`/events/${registration.event.slug}`}
                                                    className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                                                >
                                                    Voir l'événement
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
                            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune inscription</h3>
                            <p className="text-gray-600 mb-4">Vous n'êtes inscrit à aucun événement pour le moment.</p>
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Découvrir les événements
                            </Link>
                </div>
                    )}
            </section>
            </div>
        </PublicLayout>
    );
}
