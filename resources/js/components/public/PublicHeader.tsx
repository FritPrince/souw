import { Link, usePage, router } from '@inertiajs/react';
import { type ReactNode, useState, useEffect, useRef } from 'react';
import { login, register } from '@/routes';
import type { SharedData } from '@/types';

interface PublicHeaderProps {
    phone?: string;
    email?: string;
    logo?: string;
    children?: ReactNode;
}

export default function PublicHeader({
    phone,
    email,
    logo,
    children,
}: PublicHeaderProps) {
    const { props } = usePage<SharedData>();
    const company = props.company;
    const user = props.auth?.user;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const resolvedPhone = phone ?? company?.phone_primary ?? company?.whatsapp_number ?? '(123) 123-456';
    const resolvedEmail = email ?? company?.email ?? 'contact@example.com';
    const resolvedLogo = logo ?? company?.logo_path ?? '/storage/front/images/logo.png';
    const companyName = company?.name ?? 'SouwTravel';

    // Fermer le menu en cliquant en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            {/* Top Bar */}
            <div className="bg-white/30 supports-[backdrop-filter]:bg-white/10 border-b border-white/30">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between text-sm text-[var(--foreground)]/80">
                        <div className="flex items-center gap-6">
                            <a
                                href={`tel:${resolvedPhone}`}
                                className="flex items-center gap-1 transition-colors hover:text-[var(--primary)]"
                            >
                                <i className="las la-phone"></i>
                                {resolvedPhone}
                            </a>
                            <a
                                href={`mailto:${resolvedEmail}`}
                                className="flex items-center gap-1 transition-colors hover:text-[var(--primary)]"
                            >
                                <i className="las la-envelope"></i>
                                {resolvedEmail}
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] bg-white/70 rounded-lg ring-1 ring-[var(--primary)]/20 hover:bg-white transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6 text-[var(--primary)]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        <span className="hidden sm:inline">
                                            {user.name}
                                        </span>
                                    </button>
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50">
                                            <Link
                                                href="/orders"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="las la-shopping-cart mr-2"></i>
                                                Mes commandes
                                            </Link>
                                            <Link
                                                href="/payments"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="las la-credit-card mr-2"></i>
                                                Mes paiements
                                            </Link>
                                            <Link
                                                href="/appointments"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="las la-calendar mr-2"></i>
                                                Mes rendez-vous
                                            </Link>
                                            <Link
                                                href="/appointments"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="las la-ticket-alt mr-2"></i>
                                                Mes événements
                                            </Link>
                                            <Link
                                                href="/tourism/my-bookings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="las la-map-marked-alt mr-2"></i>
                                                Mes réservations
                                            </Link>
                                            <div className="border-t my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <i className="las la-sign-out-alt mr-2"></i>
                                                Déconnexion
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={login.url()}
                                        className="px-4 py-1.5 text-sm font-medium text-[var(--foreground)] bg-white/70 rounded-lg ring-1 ring-[var(--primary)]/20 hover:bg-white transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                                    >
                                        Inscription
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src={resolvedLogo}
                            alt={companyName}
                            className="h-10 w-auto"
                        />
                        <span className="text-xl font-bold text-[var(--foreground)]">
                            {companyName}
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            Accueil
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/services"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            Services
                        </Link>
                        <Link
                            href="/tourism"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            Tourisme
                        </Link>
                        <Link
                            href="/events"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            Événements
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--primary)] transition-colors"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/consultation"
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 rounded-full shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Consultation
                        </Link>
                    </nav>

                    {children}
                </div>
            </div>
        </header>
    );
}
