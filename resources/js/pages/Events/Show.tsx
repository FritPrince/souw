import { Head, useForm, router } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Calendar, MapPin, X, Check, Users, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface Pack {
    id: number;
    name: string;
    description?: string;
    features?: string[];
    price: number;
    currency: string;
    max_participants?: number;
    current_participants: number;
    is_active: boolean;
}

interface Event {
    id: number;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    image_path?: string;
    location?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    active_packs: Pack[];
}

interface Props {
    event: Event;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function EventShow({ event }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
    const [success, setSuccess] = useState(false);
    const [reference, setReference] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        event_pack_id: null as number | null,
        full_name: '',
        gender: '' as 'male' | 'female' | '',
        birth_date: '',
        birth_place: '',
        birth_country: '',
        nationality: '',
        profession: '',
        address: '',
        residence_country: '',
        email: '',
        phone: '',
    });

    const openModal = (pack: Pack) => {
        setSelectedPack(pack);
        setData('event_pack_id', pack.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPack(null);
        reset();
        if (success) {
            setSuccess(false);
            setReference('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/events/${event.slug}/register`, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const flash = page.props?.flash;
                if (flash?.success) {
                    const refMatch = flash.success.match(/référence\s*:\s*(\S+)/i);
                    if (refMatch) {
                        setReference(refMatch[1]);
                    }
                    setSuccess(true);
                }
            },
        });
    };

    return (
        <PublicLayout>
            <Head title={`${event.name} - SouwTravel`} />

            {/* Hero Section avec image de l'événement */}
            <section 
                className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
                style={{
                    backgroundImage: event.image_path 
                        ? `url(${event.image_path})` 
                        : 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white py-20">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-[#f9d121]" />
                        <span className="text-sm font-medium">Événement exclusif</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        {event.name}
                    </h1>
                    
                    {event.short_description && (
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                            {event.short_description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                        {(event.location || event.country) && (
                            <div className="flex items-center gap-2 text-white/90">
                                <MapPin className="w-5 h-5" />
                                <span>{[event.location, event.country].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                        {event.start_date && (
                            <div className="flex items-center gap-2 text-white/90">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {formatDate(event.start_date)}
                                    {event.end_date && event.end_date !== event.start_date && (
                                        <> - {formatDate(event.end_date)}</>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#f9d121] text-gray-900 font-bold rounded-full hover:bg-[#f9d121]/90 transition-all shadow-lg shadow-[#f9d121]/30"
                    >
                        Réservez votre pack
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Packs disponibles */}
            <section id="packs" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
                        Choisissez votre pack
                    </h2>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                        Sélectionnez la formule qui correspond le mieux à vos attentes
                    </p>

                    {event.active_packs && event.active_packs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {event.active_packs.map((pack, index) => {
                                const isAvailable = !pack.max_participants || pack.current_participants < pack.max_participants;
                                const remaining = pack.max_participants ? pack.max_participants - pack.current_participants : null;
                                const isPopular = index === 1; // Le deuxième pack est mis en avant

                                return (
                                    <div
                                        key={pack.id}
                                        className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                                            isPopular ? 'border-[var(--primary)] ring-4 ring-[var(--primary)]/10' : 'border-gray-100'
                                        }`}
                                    >
                                        {isPopular && (
                                            <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                                                POPULAIRE
                                            </div>
                                        )}
                                        
                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                                            {pack.description && (
                                                <p className="text-gray-600 text-sm mb-4">{pack.description}</p>
                                            )}
                                            
                                            <div className="mb-6">
                                                <span className="text-4xl font-bold text-[var(--primary)]">
                                                    {formatPrice(pack.price)}
                                                </span>
                                            </div>

                                            {pack.features && pack.features.length > 0 && (
                                                <ul className="space-y-3 mb-8">
                                                    {pack.features.map((feature, fIndex) => (
                                                        <li key={fIndex} className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                                            <span className="text-gray-700 text-sm">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {remaining !== null && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                                    <Users className="w-4 h-4" />
                                                    <span>{remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</span>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => isAvailable && openModal(pack)}
                                                disabled={!isAvailable}
                                                className={`w-full py-4 rounded-xl font-bold transition-all ${
                                                    isAvailable
                                                        ? isPopular
                                                            ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20'
                                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {isAvailable ? 'Réserver ce pack' : 'Complet'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl max-w-2xl mx-auto">
                            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Les packs seront bientôt disponibles.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Description complète */}
            {event.description && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de l'événement</h2>
                            <div className="prose prose-lg max-w-none text-gray-700">
                                {event.description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-cyan-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Réservez dès aujourd'hui !
                    </h2>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                        Ne manquez pas cette opportunité unique. Les places sont limitées.
                    </p>
                    <button
                        onClick={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl"
                    >
                        Voir les packs disponibles
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Modal de réservation */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        ></div>

                        <div className="relative bg-white rounded-2xl max-w-2xl w-full mx-auto shadow-2xl transform transition-all overflow-hidden">
                            {/* Header du modal */}
                            <div className="bg-gradient-to-r from-[var(--primary)] to-cyan-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {success ? 'Inscription confirmée !' : 'Finaliser votre réservation'}
                                        </h3>
                                        {!success && selectedPack && (
                                            <p className="text-white/80 text-sm">
                                                Pack {selectedPack.name} - {formatPrice(selectedPack.price)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenu du modal */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                {success ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Check className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre inscription !</h4>
                                        <p className="text-gray-600 mb-4">
                                            Votre demande a été enregistrée avec succès. Notre équipe vous contactera très bientôt.
                                        </p>
                                        {reference && (
                                            <div className="bg-gray-100 rounded-lg p-4 inline-block">
                                                <p className="text-sm text-gray-500">Votre référence</p>
                                                <p className="text-2xl font-bold text-[var(--primary)]">{reference}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={closeModal}
                                            className="mt-6 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nom complet <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.full_name}
                                                    onChange={(e) => setData('full_name', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sexe <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.gender}
                                                    onChange={(e) => setData('gender', e.target.value as 'male' | 'female')}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Sélectionner</option>
                                                    <option value="male">Masculin</option>
                                                    <option value="female">Féminin</option>
                                                </select>
                                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Date de naissance <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.birth_date}
                                                    onChange={(e) => setData('birth_date', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Lieu de naissance <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.birth_place}
                                                    onChange={(e) => setData('birth_place', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.birth_place && <p className="text-red-500 text-xs mt-1">{errors.birth_place}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pays de naissance <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.birth_country}
                                                    onChange={(e) => setData('birth_country', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.birth_country && <p className="text-red-500 text-xs mt-1">{errors.birth_country}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nationalité actuelle <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nationality}
                                                    onChange={(e) => setData('nationality', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Profession / Activité principale
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.profession}
                                                    onChange={(e) => setData('profession', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Adresse complète de résidence <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Pays de résidence <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.residence_country}
                                                    onChange={(e) => setData('residence_country', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.residence_country && <p className="text-red-500 text-xs mt-1">{errors.residence_country}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Adresse email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    required
                                                />
                                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Numéro de téléphone <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    placeholder="+229 XX XX XX XX"
                                                    required
                                                />
                                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Envoi en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        Envoyer ma demande
                                                        <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-500 text-center mt-3">
                                                En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}

