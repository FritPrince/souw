import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { ServiceCard, DestinationCard } from '@/components/public';
import services from '@/routes/services';
import destinations from '@/routes/destinations';
import tourism from '@/routes/tourism';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';
import Testimonials from '@/components/public/Testimonials';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

type InfoSection = {
    image?: string;
    title: string;
    description: string;
    icon: string;
    badge?: string;
};

interface HomeProps {
    featuredServices?: Array<{
        id: number;
        name: string;
        slug: string;
        description?: string;
        price: number;
        category?: {
            name: string;
            icon?: string;
        };
        image_path?: string;
        video_path?: string;
        media_type?: 'image' | 'video';
    }>;
    featuredDestinations?: Array<{
        id: number;
        name: string;
        slug: string;
        flag_emoji?: string;
        continent?: string;
        image_path?: string;
        video_path?: string;
        media_type?: 'image' | 'video';
        services_count?: number;
    }>;
    heroMedia?: {
        image_path?: string;
        video_path?: string;
        media_type?: 'image' | 'video';
    } | null;
    infoSections?: {
        section1: InfoSection;
        section2: InfoSection;
        section3: InfoSection;
    } | null;
    testimonials?: Array<{
        id: number;
        name: string;
        role?: string;
        avatar_path?: string;
        rating?: number;
        content: string;
    }>;
    events?: Array<{
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
    }>;
}

// Composant carrousel d'événements avec défilement automatique continu
function EventsCarousel({ events }: { events: HomeProps['events'] }) {
    const [isPaused, setIsPaused] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const translateXRef = useRef<number>(0);

    useEffect(() => {
        if (!events || events.length === 0) return;

        // Ne pas défilier s'il n'y a qu'un seul événement
        if (events.length === 1) return;

        // Réinitialiser la position
        translateXRef.current = 0;

        const scrollSpeed = 0.5; // pixels par frame (vitesse de défilement)
        const cardWidth = 320; // Largeur d'une carte + gap (300px + 24px)
        const totalOriginalWidth = cardWidth * events.length;

        const animate = () => {
            if (contentRef.current) {
                if (!isPaused) {
                    translateXRef.current -= scrollSpeed;
                    
                    // Boucle infinie : réinitialiser quand on atteint la fin de la première série
                    if (Math.abs(translateXRef.current) >= totalOriginalWidth) {
                        translateXRef.current = translateXRef.current + totalOriginalWidth;
                    }
                }
                
                contentRef.current.style.transform = `translateX(${translateXRef.current}px)`;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Démarrer l'animation après un court délai pour s'assurer que le DOM est prêt
        const startTimeout = setTimeout(() => {
            animationFrameRef.current = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(startTimeout);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [events, isPaused]);

    if (!events || events.length === 0) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Dupliquer les événements pour une boucle infinie seulement si on a plus d'un événement
    const displayEvents = events.length > 1 ? [...events, ...events] : events;

    return (
        <div className="relative overflow-hidden w-full">
            <div
                ref={contentRef}
                className="flex gap-6"
                style={{ willChange: 'transform' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                    {displayEvents.map((event, index) => (
                        <div
                            key={events.length > 1 ? `${event.id}-${index}` : event.id}
                            className="flex-shrink-0 w-[300px]"
                        >
                        <Link
                            href={`/events/${event.slug}`}
                            className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-800/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                        >
                        <div className="relative h-48 overflow-hidden">
                            {event.image_path ? (
                                <img
                                    src={event.image_path}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-cyan-600 flex items-center justify-center">
                                    <Calendar className="w-16 h-16 text-white opacity-50" />
                                </div>
                            )}
                            {event.is_featured && (
                                <div className="absolute top-3 right-3 bg-[var(--secondary)] text-[var(--secondary-foreground)] px-3 py-1 rounded-full text-xs font-semibold">
                                    À la une
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                                {event.name}
                            </h3>
                            {event.short_description && (
                                <p className="text-[var(--foreground)]/70 text-sm mb-4 line-clamp-2">
                                    {event.short_description}
                                </p>
                            )}
                            <div className="space-y-2 mb-4">
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.location}{event.country && `, ${event.country}`}</span>
                                    </div>
                                )}
                                {event.start_date && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/70">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(event.start_date)}{event.end_date && ` - ${formatDate(event.end_date)}`}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                {event.active_packs_count > 0 && (
                                    <span className="text-sm text-[var(--primary)] font-semibold">
                                        {event.active_packs_count} pack{event.active_packs_count > 1 ? 's' : ''}
                                    </span>
                                )}
                                <ArrowRight className="w-5 h-5 text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                            </Link>
                        </div>
                    ))}
                </div>
        </div>
    );
}

export default function Home({
    featuredServices = [],
    featuredDestinations = [],
    heroMedia = null,
    infoSections = null,
    testimonials = [],
    events = [],
}: HomeProps) {
    const [currentWord, setCurrentWord] = useState(0);
    const words = [
        'Visa',
        'Immigration',
        'Séjour',
        'Documents',
        'Tourisme',
        'Aventures',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const infoCards: InfoSection[] = infoSections
        ? [infoSections.section1, infoSections.section2, infoSections.section3]
        : [
              {
                  title: 'Vous ne voyagerez jamais seul',
                  description: 'Notre équipe vous accompagne à chaque étape de votre voyage',
                  icon: 'las la-bullhorn',
                  badge: 'Support dédié',
              },
              {
                  title: 'Un monde de choix - à tout moment, partout',
                  description: "Accédez à nos services depuis n'importe où dans le monde",
                  icon: 'las la-globe',
                  badge: '24/7',
              },
              {
                  title: "Tranquillité d'esprit, où que vous alliez",
                  description: 'Des services fiables et sécurisés pour votre tranquillité',
                  icon: 'las la-thumbs-up',
                  badge: '100% sécurisé',
              },
          ];

    return (
        <PublicLayout>
            <Head title="Accueil - SouwTravel" />

            {/* Hero Section with Animated Background */}
            <section className="relative min-h-[500px] md:min-h-[640px] flex items-center justify-center overflow-hidden py-12 md:py-0">
                {/* Background Image or Video */}
                {heroMedia?.media_type === 'video' && heroMedia.video_path ? (
                    <video
                        src={heroMedia.video_path}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : heroMedia?.image_path ? (
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat scale-105 will-change-transform transition-transform duration-700"
                        style={{
                            backgroundImage: `url(${heroMedia.image_path})`,
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 brand-gradient"></div>
                )}

                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,16,28,0.25),rgba(0,16,28,0.55))]"></div>

                {/* Animated Accents */}
                <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(closest-side,#f9d121,transparent)' }}></div>
                <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(closest-side,#00508b,transparent)' }}></div>

                <div className="container mx-auto px-4 relative z-20 w-full">
                    <ScrollReveal animation="fade-up">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="mb-6 md:mb-8">
                                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 md:mb-5 drop-shadow-xl leading-tight">
                                    Des Services{' '}
                                    <span className="relative inline-block">
                                        <span
                                            key={currentWord}
                                            className="inline-block text-[var(--secondary)] animate-fade-in"
                                        >
                                            {words[currentWord]}
                                        </span>
                                    </span>
                                    <br />
                                    Exceptionnels Vous Attendent
                                </h1>
                            </div>
                            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
                                Votre partenaire de confiance pour tous vos besoins de voyage, visa, immigration et documents administratifs
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                                <ScrollReveal animation="fade-up" delay={80}>
                                    <Link
                                        href={services.index()}
                                        className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-xl font-semibold shadow-[0_10px_30px_rgba(249,209,33,0.35)] hover:shadow-[0_12px_34px_rgba(249,209,33,0.5)] transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Découvrir nos services
                                    </Link>
                                </ScrollReveal>
                                <ScrollReveal animation="fade-up" delay={160}>
                                    <Link
                                        href={destinations.index()}
                                        className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white/10 text-white rounded-xl font-semibold ring-1 ring-white/30 hover:bg-white/15 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Explorer les destinations
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* SVG Wave at bottom */}
                <svg
                    className="absolute bottom-0 left-0 w-full h-20"
                    viewBox="0 0 500 150"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M-31.31,170.22 C164.50,33.05 334.36,-32.06 547.11,196.88 L500.00,150.00 L0.00,150.00 Z"
                        className="fill-white dark:fill-gray-900"
                    />
                </svg>
            </section>

            {/* Info Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {infoCards.map((section, index) => {
                            const hasImage = Boolean(section.image);
                            const textColor = hasImage ? 'text-white' : 'text-[var(--foreground)]';
                            const descriptionColor = hasImage ? 'text-white/85' : 'text-[var(--foreground)]/80';

                            return (
                                <div key={`${section.title}-${index}`} className="group relative overflow-hidden rounded-2xl shadow-xl dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-800">
                                    {hasImage ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={section.image}
                                                alt={section.title}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,16,28,0.55)] via-[rgba(0,16,28,0.35)] to-[rgba(0,16,28,0.1)]"></div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-white dark:from-gray-800 via-white dark:via-gray-800 to-[var(--primary)]/10 dark:to-[var(--primary)]/20"></div>
                                    )}

                                    <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 dark:bg-gray-800/85 px-3 py-1 text-xs font-semibold text-[var(--primary)] shadow-md ring-1 ring-black/5 dark:ring-gray-700">
                                                <i className={`${section.icon} text-sm`}></i>
                                                {section.badge && <span>{section.badge}</span>}
                                            </div>
                                        </div>
                                        <div className={`flex flex-col gap-3 ${textColor}`}>
                                            <h3 className="text-xl font-semibold leading-tight">
                                                {section.title}
                                            </h3>
                                            <p className={`text-sm leading-relaxed ${descriptionColor}`}>
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Services Section */}
            {featuredServices.length > 0 && (
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <ScrollReveal animation="fade-up">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                                    Services Populaires
                                </h2>
                                <p className="text-[var(--foreground)]/70 max-w-2xl mx-auto text-lg">
                                    Découvrez nos services les plus demandés
                                </p>
                            </div>
                        </ScrollReveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredServices.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link
                                href={services.index()}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold shadow-[0_8px_22px_rgba(0,80,139,0.25)] hover:bg-[var(--primary)]/90 transition-colors"
                            >
                                Voir tous les services
                                <i className="las la-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Section Les Valeurs du Cabinet */}
            <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-[var(--primary)]/5 dark:from-gray-900 dark:via-gray-900 dark:to-[var(--primary)]/10">
                <div className="container mx-auto px-4">
                    <ScrollReveal animation="fade-up">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
                                Ensemble Nous avançons mieux
                            </h2>
                            <h3 className="text-xl md:text-2xl font-semibold text-[var(--primary)] mb-6 uppercase tracking-wider">
                                Les Valeurs du Cabinet
                            </h3>
                            <p className="text-[var(--foreground)]/80 max-w-3xl mx-auto text-lg leading-relaxed">
                                Avec nos experts, tout est dans les détails. Nous travaillons en étroite collaboration avec vous pour vous fournir le meilleur service et la meilleure solution pour vos besoins.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Confiance & Humanité */}
                        <ScrollReveal animation="fade-up" delay={100}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-cyan-600 text-white shadow-lg">
                                        <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Main gauche */}
                                            <path d="M18 30C18 26 20 24 24 24C26 24 28 25 28 27L28 38C28 40 26 42 24 42C22 42 20 40 20 38L20 32L18 30Z" fill="currentColor"/>
                                            <path d="M22 26C20.895 26 20 26.895 20 28V32H22V28C22 27.448 22.448 27 23 27C23.552 27 24 27.448 24 28V32H26V28C26 26.343 24.657 25 23 25C21.343 25 20 26.343 20 28L22 30L22 32Z" fill="currentColor" opacity="0.6"/>
                                            {/* Main droite */}
                                            <path d="M46 30C46 26 44 24 40 24C38 24 36 25 36 27L36 38C36 40 38 42 40 42C42 42 44 40 44 38L44 32L46 30Z" fill="currentColor"/>
                                            <path d="M42 26C43.105 26 44 26.895 44 28V32H42V28C42 27.448 41.552 27 41 27C40.448 27 40 27.448 40 28V32H38V28C38 26.343 39.343 25 41 25C42.657 25 44 26.343 44 28L42 30L42 32Z" fill="currentColor" opacity="0.6"/>
                                            {/* Point de rencontre */}
                                            <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.9"/>
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                                    Confiance & Humanité
                                </h3>
                                <p className="text-[var(--foreground)]/70 leading-relaxed">
                                    La confiance est au cœur de nos valeurs. Le cabinet établit une relation de confiance avec ses clients dans le traitement de leurs affaires. Le Cabinet saura vous accompagner, vous conseiller et vous soutenir dans toutes les étapes de votre procédure en veillant à une bonne compréhension des enjeux.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Transparence */}
                        <ScrollReveal animation="fade-up" delay={200}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                                        <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Cadre externe */}
                                            <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="3" fill="none"/>
                                            {/* Lignes de transparence horizontales */}
                                            <line x1="12" y1="20" x2="52" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                                            <line x1="12" y1="28" x2="52" y2="28" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                                            <line x1="12" y1="36" x2="52" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                                            <line x1="12" y1="44" x2="52" y2="44" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                                            {/* Cercle de transparence */}
                                            <circle cx="32" cy="32" r="12" fill="currentColor" opacity="0.2"/>
                                            <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.4"/>
                                            <circle cx="32" cy="32" r="4" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                                    Transparence
                                </h3>
                                <p className="text-[var(--foreground)]/70 leading-relaxed">
                                    Le Cabinet s'engage à une totale transparence concernant l'état des dossiers et des chances de succès des recours. La convention d'honoraire est fixée à l'avance et en accord avec le client sans mauvaise surprise.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Disponibilité */}
                        <ScrollReveal animation="fade-up" delay={300}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                                        <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Cercle de l'horloge */}
                                            <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="3" fill="none"/>
                                            {/* Centre */}
                                            <circle cx="32" cy="32" r="2" fill="currentColor"/>
                                            {/* Aiguille des heures */}
                                            <line x1="32" y1="32" x2="32" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                            {/* Aiguille des minutes */}
                                            <line x1="32" y1="32" x2="40" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                            {/* Marques des heures */}
                                            <line x1="32" y1="12" x2="32" y2="16" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="52" y1="32" x2="48" y2="32" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="32" y1="52" x2="32" y2="48" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="12" y1="32" x2="16" y2="32" stroke="currentColor" strokeWidth="2"/>
                                            {/* Badge 24/7 */}
                                            <circle cx="48" cy="16" r="7" fill="currentColor" opacity="0.95"/>
                                            <circle cx="48" cy="16" r="6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                                    Disponibilité
                                </h3>
                                <p className="text-[var(--foreground)]/70 leading-relaxed">
                                    Le Cabinet est réactif et disponible pour tous ses clients, et principalement en cas d'urgence, pour des clients uniques et des solutions personnalisées. Il s'engage à répondre dans les 48heures à compter de la réception de la demande.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Section Nos Dernières Aventures */}
            {events.length > 0 && (
                <section className="py-20 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <ScrollReveal animation="fade-up">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
                                    Vivons le meilleur ensemble
                                </h2>
                                <h3 className="text-xl md:text-2xl font-semibold text-[var(--primary)] mb-6 uppercase tracking-wider">
                                    Nos Dernières Aventures
                                </h3>
                                <p className="text-[var(--foreground)]/80 max-w-3xl mx-auto text-lg leading-relaxed">
                                    Avec nos experts, tout est dans les détails. Nous travaillons en étroite collaboration avec vous pour vous fournir le meilleur service et la meilleure solution pour vos besoins.
                                </p>
                            </div>
                        </ScrollReveal>

                        <EventsCarousel events={events} />
                    </div>
                </section>
            )}

            {/* Featured Destinations Section */}
            {featuredDestinations.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <ScrollReveal animation="fade-up">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                                        Destinations Populaires
                                    </h2>
                                    <p className="text-[var(--foreground)]/70 max-w-2xl">
                                        Explorez les destinations les plus prisées pour vos aventures
                                    </p>
                                </div>
                                <Link
                                    href={destinations.index()}
                                    className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-700 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80"
                                >
                                    Voir toutes
                                    <i className="las la-arrow-right"></i>
                                </Link>
                            </div>
                        </ScrollReveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredDestinations.map((destination) => (
                                <DestinationCard key={destination.id} destination={destination} />
                            ))}
                        </div>
                        <div className="lg:hidden text-center mt-10">
                            <Link
                                href={destinations.index()}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold shadow-[0_8px_22px_rgba(0,80,139,0.25)] hover:bg-[var(--primary)]/90 transition-colors"
                            >
                                Voir toutes les destinations
                                <i className="las la-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <Testimonials testimonials={testimonials} />

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/storage/front/images/cta-bg-3.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,16,28,0.45),rgba(0,16,28,0.65))]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <ScrollReveal animation="fade-up">
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <h2 className="text-4xl font-extrabold mb-4 drop-shadow">
                                Prêt à commencer votre voyage ?
                            </h2>
                            <p className="text-lg mb-8 text-white/85">
                                Contactez-nous dès aujourd'hui pour obtenir de l'aide avec vos besoins de voyage et d'immigration
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <ScrollReveal animation="fade-up" delay={100}>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[var(--primary)] rounded-xl font-semibold shadow-[0_8px_22px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-all"
                                    >
                                        Nous contacter
                                        <i className="las la-envelope"></i>
                                    </Link>
                                </ScrollReveal>
                                <ScrollReveal animation="fade-up" delay={180}>
                                    <Link
                                        href={tourism.index()}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                                    >
                                        Découvrir le tourisme Bénin
                                        <i className="las la-compass"></i>
                                    </Link>
                                </ScrollReveal>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </PublicLayout>
    );
}
