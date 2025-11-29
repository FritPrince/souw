import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { PriceDisplay } from '@/components/public';
import { Button } from '@/components/ui/button';
import services from '@/routes/services';
import { store as appointmentStore } from '@/routes/appointments';
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface SubService {
    id: number;
    name: string;
    description?: string;
    price: number;
}

interface RequiredDocument {
    id: number;
    name: string;
    description?: string;
    is_required: boolean;
}

interface ProcessingTime {
    id: number;
    duration_label: string;
    duration_hours: number;
    price_multiplier: number;
}

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
    destinations?: Array<{
        id: number;
        name: string;
        flag_emoji?: string;
    }>;
    sub_services?: SubService[];
    required_documents?: RequiredDocument[];
    processing_times?: ProcessingTime[];
    requires_appointment: boolean;
    appointment_pricing_mode?: 'service_plus_appointment' | 'appointment_only';
}

interface Slot {
    id: number;
    start_time: string;
    end_time: string;
    available: boolean;
}

interface BookAppointmentProps {
    service: Service;
    availableDates: string[];
    slotsByDate: Record<string, Slot[]>;
    appointmentPrice: number;
}

type Step = 'calendar' | 'time' | 'confirm';

export default function BookAppointment({
    service,
    availableDates,
    slotsByDate,
    appointmentPrice,
}: BookAppointmentProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [step, setStep] = useState<Step>('calendar');

    const { data, setData, post, processing, errors } = useForm({
        service_id: service.id,
        appointment_slot_id: null as number | null,
        sub_service_id: null as number | null,
        destination_id: null as number | null,
        processing_time_id: null as number | null,
        notes: '',
    });

    // Fonction pour formater une date en YYYY-MM-DD sans problème de timezone
    const formatDateString = (year: number, month: number, day: number): string => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    // Générer les jours du calendrier
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        
        const days: Array<{ date: Date; dateString: string; isCurrentMonth: boolean; isAvailable: boolean }> = [];
        
        // Jours du mois précédent
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const dateString = formatDateString(prevYear, prevMonth, day);
            days.push({
                date: new Date(prevYear, prevMonth, day),
                dateString,
                isCurrentMonth: false,
                isAvailable: availableDates.includes(dateString),
            });
        }
        
        // Jours du mois courant
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateString = formatDateString(year, month, day);
            days.push({
                date: new Date(year, month, day),
                dateString,
                isCurrentMonth: true,
                isAvailable: availableDates.includes(dateString),
            });
        }
        
        // Jours du mois suivant
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            const dateString = formatDateString(nextYear, nextMonth, day);
            days.push({
                date: new Date(nextYear, nextMonth, day),
                dateString,
                isCurrentMonth: false,
                isAvailable: availableDates.includes(dateString),
            });
        }
        
        return days;
    }, [currentMonth, availableDates]);

    const handleDateSelect = (dateString: string, isAvailable: boolean) => {
        if (!isAvailable) return;
        setSelectedDate(dateString);
        setSelectedSlot(null);
        setData('appointment_slot_id', null);
        setStep('time');
    };

    const handleSlotSelect = (slot: Slot) => {
        if (!slot.available) return;
        setSelectedSlot(slot);
        setData('appointment_slot_id', slot.id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;
        
        post(appointmentStore.url(), {
            preserveScroll: true,
        });
    };

    const calculatePrice = () => {
        const pricingMode = service.appointment_pricing_mode || 'service_plus_appointment';
        
        if (pricingMode === 'appointment_only') {
            return appointmentPrice;
        }
        
        let basePrice = service.price;
        const subService = service.sub_services?.find((s) => s.id === data.sub_service_id);
        if (subService) {
            basePrice = subService.price;
        }
        const processingTime = service.processing_times?.find((pt) => pt.id === data.processing_time_id);
        if (processingTime) {
            basePrice *= processingTime.price_multiplier;
        }
        return basePrice + appointmentPrice;
    };

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    };

    const formatDisplayDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const slotsForSelectedDate = selectedDate ? (slotsByDate[selectedDate] || []) : [];

    return (
        <PublicLayout>
            <Head title={`Réserver un rendez-vous - ${service.name} - SouwTravel`} />

            {/* Breadcrumb */}
            <section className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href={services.index()} className="text-gray-600 hover:text-primary">
                            Services
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        {service.category && (
                            <>
                                <Link
                                    href={services.index({ query: { category: service.category.id } })}
                                    className="text-gray-600 hover:text-primary"
                                >
                                    {service.category.name}
                                </Link>
                                <i className="las la-angle-right text-gray-400"></i>
                            </>
                        )}
                        <Link href={services.show.url(service.id)} className="text-gray-600 hover:text-primary">
                            {service.name}
                        </Link>
                        <i className="las la-angle-right text-gray-400"></i>
                        <span className="text-gray-900 font-medium">Réserver un rendez-vous</span>
                    </nav>
                </div>
            </section>

            {/* Booking Section */}
            <section className="py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Réserver un rendez-vous
                            </h1>
                            <p className="text-gray-600">{service.name}</p>
                            <div className="mt-4 inline-flex items-center gap-2 bg-[var(--primary)]/10 rounded-full px-4 py-2">
                                <span className="text-[var(--primary)] font-semibold">
                                    {formatPrice(calculatePrice())}
                                </span>
                                {service.appointment_pricing_mode === 'appointment_only' ? (
                                    <span className="text-xs text-gray-500">(frais de rendez-vous)</span>
                                ) : appointmentPrice > 0 && (
                                    <span className="text-xs text-gray-500">(service + rendez-vous)</span>
                                )}
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className={`flex items-center gap-2 ${step === 'calendar' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'calendar' ? 'bg-[var(--primary)] text-white' : selectedDate ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                    {selectedDate ? '✓' : '1'}
                                </div>
                                <span className="font-medium hidden sm:inline">Date</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-200"></div>
                            <div className={`flex items-center gap-2 ${step === 'time' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'time' ? 'bg-[var(--primary)] text-white' : selectedSlot ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                    {selectedSlot ? '✓' : '2'}
                                </div>
                                <span className="font-medium hidden sm:inline">Heure</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-200"></div>
                            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-[var(--primary)] text-white' : 'bg-gray-200'}`}>
                                    3
                                </div>
                                <span className="font-medium hidden sm:inline">Confirmer</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                            {/* Step 1: Calendar */}
                            {step === 'calendar' && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Choisissez une date</h2>
                                            <p className="text-sm text-gray-500">Les jours disponibles sont en surbrillance</p>
                                        </div>
                                    </div>

                                    {/* Service Options */}
                                    {(service.destinations?.length || service.sub_services?.length || service.processing_times?.length) && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                            {service.destinations && service.destinations.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Destination
                                                    </label>
                                                    <select
                                                        value={data.destination_id || ''}
                                                        onChange={(e) => setData('destination_id', e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
                                                    >
                                                        <option value="">Sélectionner</option>
                                                        {service.destinations.map((dest) => (
                                                            <option key={dest.id} value={dest.id}>
                                                                {dest.flag_emoji} {dest.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {service.sub_services && service.sub_services.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Sous-service
                                                    </label>
                                                    <select
                                                        value={data.sub_service_id || ''}
                                                        onChange={(e) => setData('sub_service_id', e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
                                                    >
                                                        <option value="">Sélectionner</option>
                                                        {service.sub_services.map((sub) => (
                                                            <option key={sub.id} value={sub.id}>
                                                                {sub.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {service.processing_times && service.processing_times.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Délai
                                                    </label>
                                                    <select
                                                        value={data.processing_time_id || ''}
                                                        onChange={(e) => setData('processing_time_id', e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
                                                    >
                                                        <option value="">Sélectionner</option>
                                                        {service.processing_times.map((pt) => (
                                                            <option key={pt.id} value={pt.id}>
                                                                {pt.duration_label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Calendar */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        {/* Month Navigation */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Day Headers */}
                                        <div className="grid grid-cols-7 bg-gray-50 border-b">
                                            {dayNames.map((day) => (
                                                <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="grid grid-cols-7">
                                            {calendarDays.map((day, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleDateSelect(day.dateString, day.isAvailable)}
                                                    disabled={!day.isAvailable}
                                                    className={`
                                                        aspect-square p-2 border-b border-r border-gray-100 flex items-center justify-center text-sm transition-all
                                                        ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                                                        ${day.isAvailable 
                                                            ? 'cursor-pointer hover:bg-[var(--primary)]/10 text-gray-900 font-medium' 
                                                            : 'cursor-not-allowed text-gray-300'}
                                                        ${selectedDate === day.dateString 
                                                            ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]' 
                                                            : day.isAvailable && day.isCurrentMonth ? 'bg-[var(--primary)]/5' : ''}
                                                    `}
                                                >
                                                    {day.date.getDate()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-[var(--primary)]/5 rounded"></div>
                                            <span>Disponible</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-100 rounded"></div>
                                            <span>Non disponible</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Time Selection */}
                            {step === 'time' && selectedDate && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep('calendar')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Choisissez une heure</h2>
                                            <p className="text-sm text-gray-500 capitalize">{formatDisplayDate(selectedDate)}</p>
                                        </div>
                                    </div>

                                    {slotsForSelectedDate.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {slotsForSelectedDate.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    onClick={() => handleSlotSelect(slot)}
                                                    disabled={!slot.available}
                                                    className={`
                                                        p-4 rounded-xl border-2 text-center transition-all
                                                        ${selectedSlot?.id === slot.id 
                                                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white' 
                                                            : slot.available 
                                                                ? 'border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5' 
                                                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}
                                                    `}
                                                >
                                                    <div className="text-lg font-bold">{formatTime(slot.start_time)}</div>
                                                    <div className="text-xs opacity-75">- {formatTime(slot.end_time)}</div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Aucun créneau disponible pour cette date</p>
                                        </div>
                                    )}

                                    {selectedSlot && (
                                        <div className="mt-6 flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => setStep('confirm')}
                                                className="flex items-center gap-2"
                                            >
                                                Continuer
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Confirmation */}
                            {step === 'confirm' && selectedDate && selectedSlot && (
                                <form onSubmit={handleSubmit}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep('time')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Confirmez votre rendez-vous</h2>
                                            <p className="text-sm text-gray-500">Vérifiez les détails et ajoutez des notes si nécessaire</p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Service</span>
                                                <span className="font-medium">{service.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date</span>
                                                <span className="font-medium capitalize">{formatDisplayDate(selectedDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Heure</span>
                                                <span className="font-medium">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between">
                                                <span className="text-gray-900 font-semibold">Total</span>
                                                <span className="text-xl font-bold text-[var(--primary)]">{formatPrice(calculatePrice())}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (optionnel)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                            placeholder="Ajoutez des informations supplémentaires..."
                                        />
                                    </div>

                                    {errors.appointment_slot_id && (
                                        <p className="text-red-500 text-sm mb-4">{errors.appointment_slot_id}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 text-lg"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                                Traitement...
                                            </>
                                        ) : (
                                            'Confirmer le rendez-vous'
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
