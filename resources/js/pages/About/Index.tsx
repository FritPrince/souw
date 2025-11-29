import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ServiceCard } from '@/components/public';
import { Users, Award, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Composant de compteur animé
const AnimatedCounter = ({ value, label, icon: Icon }: {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef || hasStartedRef.current) return;

        // Vérifier si l'élément est déjà visible au chargement
        const checkVisibility = () => {
            const rect = currentRef.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isInView && !hasStartedRef.current) {
                hasStartedRef.current = true;
                setIsVisible(true);
                return true;
            }
            return false;
        };

        // Observer les changements
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasStartedRef.current) {
                        hasStartedRef.current = true;
                        setIsVisible(true);
                        if (currentRef) {
                            observer.unobserve(currentRef);
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(currentRef);

        // Vérifier aussi immédiatement avec un petit délai pour permettre au DOM de se stabiliser
        const timeoutId = setTimeout(() => {
            if (!hasStartedRef.current && checkVisibility()) {
                observer.unobserve(currentRef);
            }
        }, 300);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        // Extraire le nombre de la valeur (gère les espaces)
        const cleanValue = value.replace(/\s/g, ''); // Supprimer tous les espaces
        const numericValue = parseInt(cleanValue.replace(/[^0-9]/g, '')) || 0;
        
        if (numericValue === 0) {
            setCount(0);
            return;
        }

        // Durée de l'animation (en ms)
        const duration = 2000;
        const startTime = Date.now();
        const startValue = 0;
        const endValue = numericValue;

        let animationFrameId: number | null = null;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fonction d'easing (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
            
            setCount(currentValue);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isVisible, value]);

    // Formater la valeur affichée
    const formatValue = () => {
        const hasPlus = value.includes('+');
        const hasPercent = value.includes('%');
        let formatted = count.toLocaleString('fr-FR');
        
        if (hasPlus && count > 0) formatted = '+ ' + formatted;
        if (hasPercent) formatted = formatted + ' %';
        
        return formatted;
    };

    const getInitialValue = () => {
        if (value.includes('%')) return '0 %';
        if (value.includes('+')) return '+ 0';
        return '0';
    };

    const displayValue = isVisible ? formatValue() : getInitialValue();

    return (
        <div
            ref={ref}
            className="bg-gradient-to-br from-[var(--primary)]/10 to-cyan-50 rounded-lg p-4 border border-[var(--primary)]/20 text-center"
        >
            <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-[var(--primary)]/10 rounded-full">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-1">
                {displayValue}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
};

// Illustration SVG d'avion pour la section "Nous faisons de vos rêves une réalité"
const AirplaneIllustration = () => (
    <svg viewBox="0 0 600 400" className="w-full h-auto">
        <defs>
            <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.9 }} />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        
        {/* Ciel */}
        <rect x="0" y="0" width="600" height="400" fill="url(#skyGrad)" />
        
        {/* Nuages */}
        <ellipse cx="150" cy="100" rx="40" ry="25" fill="white" opacity="0.6" />
        <ellipse cx="170" cy="90" rx="35" ry="30" fill="white" opacity="0.6" />
        <ellipse cx="130" cy="95" rx="30" ry="20" fill="white" opacity="0.6" />
        
        <ellipse cx="450" cy="120" rx="45" ry="30" fill="white" opacity="0.5" />
        <ellipse cx="470" cy="110" rx="40" ry="35" fill="white" opacity="0.5" />
        <ellipse cx="430" cy="115" rx="35" ry="25" fill="white" opacity="0.5" />
        
        {/* Avion */}
        <g transform="translate(300, 200)">
            {/* Corps principal de l'avion */}
            <ellipse cx="0" cy="0" rx="100" ry="20" fill="url(#planeGrad)" />
            
            {/* Ailes */}
            <path
                d="M-60 -10 L-100 -40 L-90 -50 L-50 -20 Z"
                fill="url(#planeGrad)"
                opacity="0.8"
            />
            <path
                d="M-60 10 L-100 40 L-90 50 L-50 20 Z"
                fill="url(#planeGrad)"
                opacity="0.8"
            />
            
            {/* Ailes arrière */}
            <path
                d="M60 -5 L80 -20 L75 -25 L55 -10 Z"
                fill="url(#planeGrad)"
                opacity="0.7"
            />
            <path
                d="M60 5 L80 20 L75 25 L55 10 Z"
                fill="url(#planeGrad)"
                opacity="0.7"
            />
            
            {/* Cockpit */}
            <circle cx="-70" cy="0" r="12" fill="white" opacity="0.3" />
            <path
                d="M-70 -12 L-85 -25 L-80 -30 L-65 -15 Z"
                fill="url(#planeGrad)"
                opacity="0.6"
            />
            
            {/* Fenêtres */}
            <circle cx="-40" cy="-8" r="4" fill="white" opacity="0.5" />
            <circle cx="-20" cy="-8" r="4" fill="white" opacity="0.5" />
            <circle cx="0" cy="-8" r="4" fill="white" opacity="0.5" />
            <circle cx="20" cy="-8" r="4" fill="white" opacity="0.5" />
        </g>
        
        {/* Lignes de vol */}
        <path
            d="M50 250 Q300 200 550 250"
            fill="none"
            stroke="url(#planeGrad)"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.3"
        />
        
        {/* Ombres/sol */}
        <ellipse cx="300" cy="380" rx="250" ry="30" fill="#94a3b8" opacity="0.2" />
    </svg>
);

interface Company {
    name?: string;
}

interface Service {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    image_path?: string;
    video_path?: string;
    media_type?: 'image' | 'video';
    category?: {
        name: string;
        icon?: string;
    };
    destinations?: Array<{
        id: number;
        name: string;
        flag_emoji?: string;
    }>;
}

interface Props {
    company: Company | null;
    heroImage?: string;
    illustrationImage?: string;
    ctaBackgroundImage?: string;
    services: Service[];
}

export default function AboutIndex({ company, heroImage, illustrationImage, ctaBackgroundImage, services }: Props) {
    const companyName = company?.name || 'Notre entreprise';

    // Statistiques avec valeurs cibles
    const stats = [
        {
            label: 'personnes accompagnées',
            value: '+1000',
            icon: Users,
        },
        {
            label: 'experts en immigration',
            value: '+50',
            icon: Award,
        },
        {
            label: 'de satisfaction',
            value: '98%',
            icon: Heart,
        },
    ];

    return (
        <PublicLayout>
            <Head title="À propos - SouwTravel" />

            {/* Header avec image de fond */}
            <section 
                className="relative py-20 md:py-24 bg-cover bg-center bg-no-repeat"
                style={heroImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`
                } : {
                    background: 'linear-gradient(to right, var(--primary), #06b6d4)'
                }}
            >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">À propos</h1>
                    </div>
                </div>
            </section>

            {/* Section principale avec image à gauche et texte à droite */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                            Nous faisons de vos rêves une réalité
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                            {/* Image illustrative à gauche */}
                            <div className="order-2 lg:order-1">
                                {illustrationImage ? (
                                    <img
                                        src={illustrationImage}
                                        alt="Illustration"
                                        className="w-full h-auto rounded-xl shadow-lg object-cover"
                                    />
                                ) : (
                                    <AirplaneIllustration />
                                )}
                            </div>

                            {/* Paragraphe à droite */}
                            <div className="order-1 lg:order-2">
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                                        Bienvenue sur le site web de notre agence spécialisée dans la gestion des procédures de voyages ! Chez <strong className="text-[var(--primary)]">{companyName}</strong>, nous comprenons à quel point la planification et l'organisation de voyages peuvent être stressantes et chronophages.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                                        C'est pourquoi nous sommes là pour vous simplifier la vie et vous permettre de vivre des expériences de voyage inoubliables, sans les tracas habituels.
                                    </p>
                                </div>

                                {/* Statistiques en bas du paragraphe */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    {stats.map((stat, index) => (
                                        <AnimatedCounter
                                            key={index}
                                            value={stat.value}
                                            label={stat.label}
                                            icon={stat.icon}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section avec description supplémentaire */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                            Que vous soyez un voyageur individuel ou une entreprise cherchant à optimiser les déplacements de votre personnel
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            Nous prenons en charge l'ensemble du processus, depuis la réservation des billets d'avion, de train ou de ferry, jusqu'à la recherche d'hébergement, la planification d'itinéraires, et même la gestion des formalités administratives telles que les visas.
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Explorez notre site pour découvrir nos services détaillés et nos offres spéciales.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">N'hésitez pas à nous contacter pour discuter de vos projets de voyage.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Chez <strong>{companyName}</strong>, nous transformons vos rêves de voyage en réalité, en toute simplicité.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">Faites confiance à des professionnels, et préparez-vous à vivre des aventures extraordinaires.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section Nos accompagnements avec services en cards */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Construire votre avenir
                            </h2>
                            <h3 className="text-2xl md:text-3xl font-semibold text-[var(--primary)] mb-6">
                                Nos accompagnements
                            </h3>
                        </div>

                        {/* Services en cards */}
                        {services.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {services.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Aucun service disponible pour le moment.
                            </div>
                        )}

                        {/* Bouton Voir plus */}
                        <div className="text-center mt-8">
                            <Link
                                href="/services"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-cyan-600 text-white rounded-lg font-semibold hover:from-[var(--primary)]/90 hover:to-cyan-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Voir plus
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section CTA avec image en background */}
            <section 
                className="relative py-20 bg-cover bg-center bg-no-repeat"
                style={ctaBackgroundImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${ctaBackgroundImage})`
                } : {
                    background: 'linear-gradient(to right, var(--primary), #06b6d4)'
                }}
            >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Contactez-nous dès aujourd'hui pour obtenir une assistance experte et personnalisée
                        </h2>
                        <p className="text-lg text-white/90 mb-8">
                            Notre équipe d'experts est prête à vous accompagner dans toutes vos démarches de voyage
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary)] rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Nous contacter
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/services"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all"
                            >
                                Découvrir nos services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
