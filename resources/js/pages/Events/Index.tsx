import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Calendar, MapPin, ArrowRight, Sparkles, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
    id: number;
    name: string;
    slug: string;
    short_description?: string;
    image_path?: string;
    location?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    is_featured: boolean;
    active_packs_count: number;
}

interface Testimonial {
    id: number;
    name: string;
    role?: string;
    avatar_path?: string;
    rating?: number;
    content: string;
}

interface Props {
    events: {
        data: Event[];
        current_page: number;
        last_page: number;
        total: number;
    };
    testimonials?: Testimonial[];
    heroImage?: string;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Composant du carrousel de témoignages
function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            checkScrollButtons();
            return () => container.removeEventListener('scroll', checkScrollButtons);
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft >= scrollWidth - clientWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!testimonials.length) return null;

    return (
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Quote className="w-4 h-4 text-[#f9d121]" />
                        <span className="text-white/90 text-sm font-medium">Ils nous font confiance</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ce que disent nos <span className="text-[#f9d121]">clients</span>
                    </h2>
                    <p className="text-white/70 max-w-2xl mx-auto">
                        Découvrez les expériences de ceux qui nous ont fait confiance pour leurs voyages
                    </p>
                </div>

                <div className="relative">
                    {/* Bouton gauche */}
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all ${
                            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Bouton droite */}
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all ${
                            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Carrousel */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 -mx-2 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-none w-[300px] md:w-[350px] snap-start"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-cyan-500 flex items-center justify-center">
                                            {testimonial.avatar_path ? (
                                                <img
                                                    src={testimonial.avatar_path}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-lg font-bold">
                                                    {testimonial.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                            {testimonial.role && (
                                                <p className="text-sm text-white/60">{testimonial.role}</p>
                                            )}
                                        </div>
                                    </div>

                                    {typeof testimonial.rating === 'number' && (
                                        <div className="flex items-center gap-1 mb-3">
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className={`w-4 h-4 ${
                                                        idx < testimonial.rating!
                                                            ? 'text-[#f9d121] fill-[#f9d121]'
                                                            : 'text-white/30'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
                                        "{testimonial.content}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function EventsIndex({ events, testimonials = [], heroImage = '/storage/front/images/hero-bg6.jpg' }: Props) {
    const featuredEvent = events.data.find(e => e.is_featured);
    const otherEvents = events.data.filter(e => !e.is_featured || e.id !== featuredEvent?.id);

    const steps = [
        {
            number: 1,
            title: 'Choisissez votre pack',
            description: 'Sélectionnez la formule qui vous convient : hébergement, transport, billetterie, excursions… tout est modulable selon vos envies et votre budget.',
        },
        {
            number: 2,
            title: 'Confirmez votre réservation',
            description: 'Réservez en ligne ou contactez notre équipe. Nous vous envoyons une confirmation et tous les détails de votre séjour.',
        },
        {
            number: 3,
            title: 'Vivez l\'expérience !',
            description: 'Arrivez sur place, on s\'occupe de tout : accueil à l\'aéroport, transferts, activités et accompagnement 24h/24.',
        },
    ];

    return (
        <PublicLayout>
            <Head title="Événements - SouwTravel" />

            {/* Hero Section */}
            <section 
                className="relative py-20 md:py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
                style={heroImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`
                } : {
                    background: 'linear-gradient(to right, var(--primary), var(--primary)/80)'
                }}
            >
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4 text-[#f9d121]" />
                            <span className="text-white/90 text-sm font-medium">Expériences uniques</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Nos <span className="text-[#f9d121]">Événements</span>
                        </h1>
                        <p className="text-lg text-white/80">
                            Découvrez nos événements exclusifs et vivez des moments inoubliables
                        </p>
                    </div>
                </div>
            </section>

            {/* Comment ça marche ? */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
                        Comment ça marche ?
                    </h2>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                        Un processus simple et rapide pour vivre une expérience inoubliable
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={step.number} className="relative">
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/30"></div>
                                )}
                                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--primary)]/20">
                                        <span className="text-2xl font-bold text-white">{step.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Événement à la une */}
            {featuredEvent && (
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-[#f9d121]" />
                            <h2 className="text-xl font-bold text-gray-900">À la une</h2>
                        </div>
                        <Link
                            href={`/events/${featuredEvent.slug}`}
                            className="block group"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <div 
                                    className="aspect-[21/9] bg-cover bg-center"
                                    style={{
                                        backgroundImage: featuredEvent.image_path 
                                            ? `url(${featuredEvent.image_path})` 
                                            : 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="max-w-2xl">
                                        <span className="inline-block px-3 py-1 bg-[#f9d121] text-gray-900 text-xs font-bold rounded-full mb-4">
                                            ÉVÉNEMENT À LA UNE
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-[#f9d121] transition-colors">
                                            {featuredEvent.name}
                                        </h3>
                                        {featuredEvent.short_description && (
                                            <p className="text-white/80 text-lg mb-4 line-clamp-2">
                                                {featuredEvent.short_description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-white/70">
                                            {(featuredEvent.location || featuredEvent.country) && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{[featuredEvent.location, featuredEvent.country].filter(Boolean).join(', ')}</span>
                                                </div>
                                            )}
                                            {featuredEvent.start_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(featuredEvent.start_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full p-3 group-hover:bg-[var(--primary)] transition-colors">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            )}

            {/* Liste des événements */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    {events.data.length > (featuredEvent ? 1 : 0) && (
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            {featuredEvent ? 'Autres événements' : 'Tous les événements'}
                        </h2>
                    )}

                    {otherEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div 
                                        className="aspect-video bg-cover bg-center relative"
                                        style={{
                                            backgroundImage: event.image_path 
                                                ? `url(${event.image_path})` 
                                                : 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        {event.active_packs_count > 0 && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {event.active_packs_count} pack{event.active_packs_count > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                                            {event.name}
                                        </h3>
                                        {event.short_description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {event.short_description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                            {(event.location || event.country) && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{[event.location, event.country].filter(Boolean).join(', ')}</span>
                                                </div>
                                            )}
                                            {event.start_date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(event.start_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : !featuredEvent && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow">
                            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement pour le moment</h3>
                            <p className="text-gray-600">De nouveaux événements seront bientôt disponibles.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {events.last_page > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`/events?page=${page}`}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        page === events.current_page
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Carrousel de témoignages */}
            <TestimonialsCarousel testimonials={testimonials} />

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-cyan-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Prêt pour l'aventure ?
                    </h2>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                        Ne manquez aucun événement ! Consultez nos offres et réservez dès maintenant.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl"
                    >
                        Nous contacter
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
