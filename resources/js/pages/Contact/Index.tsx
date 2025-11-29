import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Send, CheckCircle2, Info } from 'lucide-react';

interface Company {
    email?: string;
    phone_primary?: string;
    phone_secondary?: string;
    whatsapp_number?: string;
    address?: string;
    name?: string;
}

interface Props {
    company: Company | null;
    heroImage?: string;
}

const subjectOptions = [
    'Procédure de voyage',
    'Achats de billets d\'avion',
    'Envoie de colis',
];

// Illustrations SVG
const ContactIllustration = () => (
    <svg viewBox="0 0 300 200" className="w-full h-auto max-w-md">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.8 }} />
            </linearGradient>
        </defs>
        {/* Envelope - style minimaliste */}
        <rect x="60" y="60" width="180" height="120" rx="4" fill="white" stroke="url(#grad1)" strokeWidth="2.5" />
        <path d="M60 60 L150 125 L240 60" fill="none" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Letter lines */}
        <line x1="85" y1="110" x2="215" y2="110" stroke="url(#grad1)" strokeWidth="2" opacity="0.4" />
        <line x1="85" y1="135" x2="215" y2="135" stroke="url(#grad1)" strokeWidth="2" opacity="0.4" />
        <line x1="85" y1="155" x2="190" y2="155" stroke="url(#grad1)" strokeWidth="2" opacity="0.4" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <circle cx="19" cy="5" r="1" fill="currentColor" />
    </svg>
);

const LocationIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const MessageIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export default function ContactIndex({ company, heroImage = '/storage/front/images/hero-bg7.jpg' }: Props) {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    return (
        <PublicLayout>
            <Head title="Contact - SouwTravel" />

            {/* Header avec illustration */}
            <section 
                className="relative text-white py-20 md:py-24 overflow-hidden bg-cover bg-center bg-no-repeat"
                style={heroImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`
                } : {
                    background: 'linear-gradient(to right, var(--primary), #06b6d4)'
                }}
            >
                {/* Background decoration subtile */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="absolute top-0 right-0 w-64 h-64" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="80" fill="white" />
                        <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="2" />
                        <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1" />
                    </svg>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
                            <p className="text-lg text-white/90 mb-2">
                                Nous vous assurons une <strong>réponse rapide</strong>
                            </p>
                            <p className="text-white/80">
                                Écrivez-nous en remplissant le formulaire ci-dessous. Appelez-nous ou faites-vous rappeler.
                            </p>
                        </div>
                        <div className="hidden lg:flex lg:items-center lg:justify-center opacity-80">
                            <ContactIllustration />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 md:py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Formulaire */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                        <MessageIcon />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Contactez-nous</h2>
                                </div>

                                {showSuccess && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-green-800 font-medium">Message envoyé avec succès !</p>
                                            <p className="text-green-700 text-sm mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom & Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                                required
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Sujet du message *
                                        </label>
                                        <select
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all bg-white"
                                            required
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            {subjectOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subject && (
                                            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none transition-all"
                                            required
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-cyan-600 text-white rounded-lg font-semibold hover:from-[var(--primary)]/90 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Soumettre
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Informations de contact avec illustrations */}
                        <div className="space-y-6">
                            {/* Bon à savoir */}
                            <div className="bg-gradient-to-br from-[var(--primary)]/10 to-cyan-50 rounded-xl p-6 border border-[var(--primary)]/20">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                        <Info className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Bon à savoir</h3>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Que vous ayez des questions sur nos services, besoin de conseils pour vos démarches administratives de voyage, ou simplement envie de discuter de votre prochaine aventure, nous sommes là pour vous.
                                </p>
                            </div>

                            {/* Informations de contact */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Informations de contact</h3>
                                
                                <div className="space-y-6">
                                    {/* Email */}
                                    {company?.email && (
                                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                                            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                                <EmailIcon />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                                                <a
                                                    href={`mailto:${company.email}`}
                                                    className="text-[var(--primary)] hover:underline text-sm break-all"
                                                >
                                                    {company.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Téléphone */}
                                    {(company?.phone_primary || company?.phone_secondary || company?.whatsapp_number) && (
                                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-all">
                                            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                                <PhoneIcon />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-2">Téléphone</h4>
                                                <div className="space-y-1">
                                                    {company.phone_primary && (
                                                        <a
                                                            href={`tel:${company.phone_primary.replace(/\s/g, '').replace(/[^0-9+]/g, '')}`}
                                                            className="block text-[var(--primary)] hover:underline text-sm"
                                                        >
                                                            {company.phone_primary}
                                                        </a>
                                                    )}
                                                    {company.phone_secondary && (
                                                        <a
                                                            href={`tel:${company.phone_secondary.replace(/\s/g, '').replace(/[^0-9+]/g, '')}`}
                                                            className="block text-[var(--primary)] hover:underline text-sm"
                                                        >
                                                            {company.phone_secondary}
                                                        </a>
                                                    )}
                                                    {company.whatsapp_number && (
                                                        <a
                                                            href={`https://wa.me/${company.whatsapp_number.replace(/\s/g, '').replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-green-600 hover:underline text-sm font-medium"
                                                        >
                                                            {company.whatsapp_number} (WhatsApp)
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Adresse */}
                                    {company?.address && (
                                        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                                            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                                <LocationIcon />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-2">Adresse</h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {company.address}
                                                </p>
                                                <p className="text-gray-600 text-xs mt-2 italic">
                                                    Nous sommes facilement accessibles par les transports en commun et les principales routes. Notre emplacement central rend votre visite rapide et pratique.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
