import { Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

interface PublicFooterProps {
    logo?: string;
    companyInfo?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
}

export default function PublicFooter({
    logo,
    companyInfo,
}: PublicFooterProps) {
    const { props } = usePage<SharedData>();
    const sharedCompany = props.company;
    const resolvedLogo = logo ?? sharedCompany?.logo_path ?? '/storage/front/images/logo.png';
    const resolvedCompany = {
        name: companyInfo?.name ?? sharedCompany?.name ?? 'SouwTravel',
        address: companyInfo?.address ?? sharedCompany?.address,
        phone: companyInfo?.phone ?? sharedCompany?.phone_primary ?? sharedCompany?.whatsapp_number,
        email: companyInfo?.email ?? sharedCompany?.email,
    };

    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 pt-12 md:pt-16 pb-6 md:pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
                    {/* Company Info */}
                    <div>
                        <Link href="/" className="block mb-6">
                            <img
                                src={resolvedLogo}
                                alt={resolvedCompany.name}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 mb-4 text-sm">
                            Votre partenaire de confiance pour tous vos besoins
                            de voyage et d'immigration.
                        </p>
                        <ul className="space-y-2 text-sm">
                            {resolvedCompany.address && (
                                <li className="flex items-start gap-2 break-words">
                                    <i className="las la-map-marker-alt mt-1 flex-shrink-0"></i>
                                    <span className="break-words">{resolvedCompany.address}</span>
                                </li>
                            )}
                            {resolvedCompany.phone && (
                                <li className="flex items-center gap-2">
                                    <i className="las la-phone flex-shrink-0"></i>
                                    <a
                                        href={`tel:${resolvedCompany.phone}`}
                                        className="hover:text-white break-words"
                                    >
                                        {resolvedCompany.phone}
                                    </a>
                                </li>
                            )}
                            {resolvedCompany.email && (
                                <li className="flex items-center gap-2">
                                    <i className="las la-envelope flex-shrink-0"></i>
                                    <a
                                        href={`mailto:${resolvedCompany.email}`}
                                        className="hover:text-white break-all"
                                    >
                                        {resolvedCompany.email}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-lg">
                            Entreprise
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="hover:text-white transition-colors"
                                >
                                    À propos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="hover:text-white transition-colors"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-white transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help"
                                    className="hover:text-white transition-colors"
                                >
                                    Centre d'aide
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="hover:text-white transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-lg">
                            Services
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/services?category=visa"
                                    className="hover:text-white transition-colors"
                                >
                                    Visa & Immigration
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services?category=sejour"
                                    className="hover:text-white transition-colors"
                                >
                                    Séjour & Logistique
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services?category=documents"
                                    className="hover:text-white transition-colors"
                                >
                                    Documents Administratifs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tourism"
                                    className="hover:text-white transition-colors"
                                >
                                    Tourisme Bénin
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-lg">
                            Newsletter
                        </h4>
                        <p className="text-gray-400 mb-4 text-sm">
                            Abonnez-vous pour recevoir nos dernières
                            actualités et promotions
                        </p>
                        <form className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Votre email"
                                    className="w-full px-4 py-2 pr-20 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded text-white dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 md:px-4 py-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-xs md:text-sm whitespace-nowrap"
                                >
                                    S'abonner
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <i className="las la-lock"></i>
                                Vos informations sont sécurisées
                            </p>
                        </form>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 dark:border-gray-900 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <p className="text-gray-400 dark:text-gray-500 text-center md:text-left">
                            © {new Date().getFullYear()} {resolvedCompany.name}. Tous droits
                            réservés.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                            <Link
                                href="/terms"
                                className="hover:text-white transition-colors text-center"
                            >
                                Conditions d'utilisation
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-white transition-colors text-center"
                            >
                                Politique de confidentialité
                            </Link>
                            <Link
                                href="/help"
                                className="hover:text-white transition-colors text-center"
                            >
                                Centre d'aide
                            </Link>
                            <Link
                                href="/faq"
                                className="hover:text-white transition-colors text-center"
                            >
                                FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}


