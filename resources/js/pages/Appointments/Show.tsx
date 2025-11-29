import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { OrderStatusBadge } from '@/components/public';
import { Button } from '@/components/ui/button';
import appointments from '@/routes/appointments';

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
    user?: {
        name: string;
        email: string;
    };
}

interface AppointmentsShowProps {
    appointment: Appointment;
}

export default function AppointmentsShow({
    appointment,
}: AppointmentsShowProps) {
    const canCancel = ['scheduled', 'confirmed'].includes(
        appointment.status,
    );

    const handleCancel = () => {
        if (
            confirm(
                'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
            )
        ) {
            router.post(
                appointments.cancel.url(appointment.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <PublicLayout>
            <Head title="Détails du rendez-vous - SouwTravel" />

            {/* Breadcrumb */}
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href={appointments.index()}
                            className="text-gray-600 hover:text-primary"
                        >
                            Mes rendez-vous
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        <span className="text-gray-900 font-medium">
                            Détails
                        </span>
                    </nav>
                </div>
            </section>

            {/* Appointment Details */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Rendez-vous
                                    </h1>
                                    {appointment.service && (
                                        <p className="text-lg text-gray-600">
                                            {appointment.service.name}
                                        </p>
                                    )}
                                </div>
                                <OrderStatusBadge status={appointment.status} />
                            </div>

                            <div className="space-y-6">
                                {appointment.appointment_slot && (
                                    <div className="border-t pt-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            Informations du rendez-vous
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                                <i className="las la-calendar text-primary text-2xl"></i>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Date
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(
                                                            appointment
                                                                .appointment_slot
                                                                .date,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                            {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                                <i className="las la-clock text-primary text-2xl"></i>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Heure
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            appointment
                                                                .appointment_slot
                                                                .start_time
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            appointment
                                                                .appointment_slot
                                                                .end_time
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {appointment.order && (
                                    <div className="border-t pt-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            Commande associée
                                        </h2>
                                        <Link
                                            href={`/orders/${appointment.order.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <i className="las la-shopping-cart"></i>
                                            <span>
                                                {
                                                    appointment.order
                                                        .order_number
                                                }
                                            </span>
                                        </Link>
                                    </div>
                                )}

                                {appointment.notes && (
                                    <div className="border-t pt-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                            Notes
                                        </h2>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                            {appointment.notes}
                                        </p>
                                    </div>
                                )}

                                {canCancel && (
                                    <div className="border-t pt-6">
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="w-full"
                                        >
                                            <i className="las la-times mr-2"></i>
                                            Annuler le rendez-vous
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

