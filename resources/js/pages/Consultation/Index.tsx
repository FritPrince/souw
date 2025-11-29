import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Mail, MessageSquare, CheckCircle2, ArrowRight, ArrowLeft, Wallet, Timer, Handshake } from 'lucide-react';

interface Slot {
    id: number;
    start_time: string;
    end_time: string;
}

interface Props {
    availableDates: string[];
    slotsByDate: Record<string, Slot[]>;
    appointmentPrice: number;
}

type Step = 'calendar' | 'time' | 'form' | 'success';

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export default function ConsultationIndex({ availableDates, slotsByDate, appointmentPrice }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [step, setStep] = useState<Step>('calendar');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
        appointment_slot_id: null as number | null,
        accept_terms: false,
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
        
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const days: Array<{ date: Date | null; dateString: string; isAvailable: boolean; isToday: boolean; isPast: boolean }> = [];
        
        // Jours vides avant le 1er du mois
        for (let i = 0; i < startPadding; i++) {
            days.push({ date: null, dateString: '', isAvailable: false, isToday: false, isPast: false });
        }
        
        // Jours du mois
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateString = formatDateString(year, month, day);
            const isPast = dateString < todayString;
            const isToday = dateString === todayString;
            const isAvailable = !isPast && availableDates.includes(dateString);
            
            days.push({ date, dateString, isAvailable, isToday, isPast });
        }
        
        return days;
    }, [currentMonth, availableDates]);

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const prevMonth = () => {
        const today = new Date();
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setCurrentMonth(newMonth);
        }
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (dateString: string) => {
        setSelectedDate(dateString);
        setSelectedSlot(null);
        setStep('time');
    };

    const handleSlotSelect = (slot: Slot) => {
        setSelectedSlot(slot);
        setData('appointment_slot_id', slot.id);
        setStep('form');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultation', {
            preserveScroll: true,
            onSuccess: () => {
                setStep('success');
            },
        });
    };

    const goBack = () => {
        if (step === 'time') {
            setStep('calendar');
            setSelectedDate(null);
        } else if (step === 'form') {
            setStep('time');
            setSelectedSlot(null);
        }
    };

    const formatSelectedDate = () => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate);
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const slots = selectedDate ? (slotsByDate[selectedDate] || []) : [];

    return (
        <PublicLayout>
            <Head title="Consultation - Prise de rendez-vous" />

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Image de fond */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/storage/front/images/hero-bg3.jpg')" }}
                ></div>
                {/* Overlay sombre */}
                <div className="absolute inset-0 bg-black/60"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                            <Calendar className="w-4 h-4 text-white" />
                            <span className="text-white/90 text-sm font-medium">Planifiez votre consultation</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Prise de <span className="text-[#f9d121]">rendez-vous</span>
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Nous savons que votre temps est précieux. Réservez facilement un créneau pour une consultation personnalisée avec notre équipe d'experts.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
            </section>

            {/* Info Cards */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20 relative z-20">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4">
                                <Wallet className="w-6 h-6 text-[var(--primary)]" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Rendez-vous payant</h3>
                            <p className="text-sm text-gray-600">
                                {appointmentPrice > 0 ? (
                                    <>Tarif : <span className="font-semibold text-[var(--primary)]">{formatPrice(appointmentPrice)}</span></>
                                ) : (
                                    'Le paiement garantit votre réservation et la qualité du service fourni.'
                                )}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Timer className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Ponctualité</h3>
                            <p className="text-sm text-gray-600">Arrivez à l'heure pour respecter le planning et optimiser votre expérience.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Handshake className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Courtoisie</h3>
                            <p className="text-sm text-gray-600">Nous valorisons les interactions respectueuses pour une expérience positive.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-12">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 ${step === 'calendar' || step === 'time' || step === 'form' || step === 'success' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'calendar' ? 'bg-[var(--primary)] text-white' : step === 'time' || step === 'form' || step === 'success' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-gray-200 text-gray-500'}`}>
                                        1
                                    </div>
                                    <span className="hidden sm:inline font-medium">Date</span>
                                </div>
                                <div className={`w-8 h-0.5 ${step === 'time' || step === 'form' || step === 'success' ? 'bg-[var(--primary)]' : 'bg-gray-200'}`}></div>
                                <div className={`flex items-center gap-2 ${step === 'time' || step === 'form' || step === 'success' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'time' ? 'bg-[var(--primary)] text-white' : step === 'form' || step === 'success' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-gray-200 text-gray-500'}`}>
                                        2
                                    </div>
                                    <span className="hidden sm:inline font-medium">Heure</span>
                                </div>
                                <div className={`w-8 h-0.5 ${step === 'form' || step === 'success' ? 'bg-[var(--primary)]' : 'bg-gray-200'}`}></div>
                                <div className={`flex items-center gap-2 ${step === 'form' || step === 'success' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 'form' ? 'bg-[var(--primary)] text-white' : step === 'success' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-gray-200 text-gray-500'}`}>
                                        3
                                    </div>
                                    <span className="hidden sm:inline font-medium">Confirmation</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Step */}
                        {step === 'calendar' && (
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="bg-[var(--primary)] p-6">
                                    <h2 className="text-2xl font-bold text-white text-center">Choisissez une date</h2>
                                    <p className="text-white/80 text-center mt-2">Sélectionnez un jour disponible sur le calendrier</p>
                                </div>
                                
                                <div className="p-6 md:p-8">
                                    {/* Month Navigation */}
                                    <div className="flex items-center justify-between mb-6">
                                        <button
                                            onClick={prevMonth}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                                        </button>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </h3>
                                        <button
                                            onClick={nextMonth}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        {dayNames.map(day => (
                                            <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {calendarDays.map((day, index) => (
                                            <div key={index} className="aspect-square">
                                                {day.date ? (
                                                    <button
                                                        onClick={() => day.isAvailable && handleDateSelect(day.dateString)}
                                                        disabled={!day.isAvailable}
                                                        className={`w-full h-full rounded-xl flex items-center justify-center font-medium transition-all duration-200 ${
                                                            day.isAvailable
                                                                ? 'bg-[var(--primary)] text-white hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/30 cursor-pointer'
                                                                : day.isPast
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                                        } ${day.isToday ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''}`}
                                                    >
                                                        {day.date.getDate()}
                                                    </button>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-[var(--primary)]"></div>
                                            <span className="text-sm text-gray-600">Disponible</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-gray-200"></div>
                                            <span className="text-sm text-gray-600">Non disponible</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Time Step */}
                        {step === 'time' && (
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="bg-[var(--primary)] p-6">
                                    <h2 className="text-2xl font-bold text-white text-center">Choisissez une heure</h2>
                                    <p className="text-white/80 text-center mt-2 capitalize">{formatSelectedDate()}</p>
                                </div>
                                
                                <div className="p-6 md:p-8">
                                    <button
                                        onClick={goBack}
                                        className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary)] mb-6 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Retour au calendrier
                                    </button>

                                    {slots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => handleSlotSelect(slot)}
                                                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary)]" />
                                                        <span className="font-semibold text-gray-900 group-hover:text-[var(--primary)]">
                                                            {slot.start_time}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        jusqu'à {slot.end_time}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Clock className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-600">Aucun créneau disponible pour cette date.</p>
                                            <button
                                                onClick={goBack}
                                                className="mt-4 text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium"
                                            >
                                                Choisir une autre date
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Form Step */}
                        {step === 'form' && selectedSlot && (
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="bg-[var(--primary)] p-6">
                                    <h2 className="text-2xl font-bold text-white text-center">Indiquez vos informations</h2>
                                    <p className="text-white/80 text-center mt-2">
                                        {formatSelectedDate()} • {selectedSlot.start_time} - {selectedSlot.end_time}
                                    </p>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary)] mb-6 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Modifier l'heure
                                    </button>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <User className="w-4 h-4" />
                                                Nom <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-0 transition-colors"
                                                placeholder="Votre nom complet"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <Mail className="w-4 h-4" />
                                                E-mail <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-0 transition-colors"
                                                placeholder="votre@email.com"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Message (optionnel)
                                            </label>
                                            <textarea
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-0 transition-colors resize-none"
                                                placeholder="Veuillez partager tout ce qui pourra être utile à la préparation de notre réunion..."
                                            />
                                        </div>

                                        {appointmentPrice > 0 && (
                                            <div className="bg-[var(--primary)]/5 rounded-xl p-4 border border-[var(--primary)]/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">Frais de consultation</span>
                                                    <span className="text-xl font-bold text-[var(--primary)]">{formatPrice(appointmentPrice)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="accept_terms"
                                                checked={data.accept_terms}
                                                onChange={e => setData('accept_terms', e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                                                required
                                            />
                                            <label htmlFor="accept_terms" className="text-sm text-gray-600">
                                                En poursuivant, vous confirmez que vous avez lu et accepté les{' '}
                                                <a href="/terms" className="text-[var(--primary)] hover:underline">Conditions d'utilisation</a>
                                                {' '}et{' '}
                                                <a href="/privacy" className="text-[var(--primary)] hover:underline">Avis de confidentialité</a>.
                                            </label>
                                        </div>
                                        {errors.accept_terms && <p className="text-red-500 text-sm">{errors.accept_terms}</p>}

                                        <button
                                            type="submit"
                                            disabled={processing || !data.accept_terms}
                                            className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmer l'événement
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Success Step */}
                        {step === 'success' && (
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="p-8 md:p-12 text-center">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Demande envoyée !</h2>
                                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                                        Votre demande de consultation a été envoyée avec succès. Notre équipe vous contactera bientôt pour confirmer votre rendez-vous.
                                    </p>
                                    <div className="bg-[var(--primary)]/5 rounded-xl p-6 max-w-sm mx-auto border border-[var(--primary)]/10">
                                        <div className="text-sm text-[var(--primary)] font-medium mb-2">Récapitulatif</div>
                                        <div className="text-gray-900 font-semibold capitalize">{formatSelectedDate()}</div>
                                        <div className="text-gray-600">{selectedSlot?.start_time} - {selectedSlot?.end_time}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            reset();
                                            setSelectedDate(null);
                                            setSelectedSlot(null);
                                            setStep('calendar');
                                        }}
                                        className="mt-8 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Prendre un autre rendez-vous
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

