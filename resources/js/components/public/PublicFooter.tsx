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
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
                                <li className="flex items-start gap-2">
                                    <i className="las la-map-marker-alt mt-1"></i>
                                    <span>{resolvedCompany.address}</span>
                                </li>
                            )}
                            {resolvedCompany.phone && (
                                <li className="flex items-center gap-2">
                                    <i className="las la-phone"></i>
                                    <a
                                        href={`tel:${resolvedCompany.phone}`}
                                        className="hover:text-white"
                                    >
                                        {resolvedCompany.phone}
                                    </a>
                                </li>
                            )}
                            {resolvedCompany.email && (
                                <li className="flex items-center gap-2">
                                    <i className="las la-envelope"></i>
                                    <a
                                        href={`mailto:${resolvedCompany.email}`}
                                        className="hover:text-white"
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
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm"
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
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} {resolvedCompany.name}. Tous droits
                            réservés.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/terms"
                                className="hover:text-white transition-colors"
                            >
                                Conditions d'utilisation
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-white transition-colors"
                            >
                                Politique de confidentialité
                            </Link>
                            <Link
                                href="/help"
                                className="hover:text-white transition-colors"
                            >
                                Centre d'aide
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}


