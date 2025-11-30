import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

interface Props {
    company: {
        name?: string;
    } | null;
}

export default function PrivacyIndex({ company }: Props) {
    const companyName = company?.name ?? 'SouwTravel';

    return (
        <PublicLayout>
            <Head title={`Politique de confidentialité - ${companyName}`} />

            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 lg:p-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Politique de confidentialité
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>

                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        1. Introduction
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        {companyName} s'engage à protéger votre vie privée. Cette politique de confidentialité explique 
                                        comment nous collectons, utilisons, partageons et protégeons vos informations personnelles lorsque 
                                        vous utilisez notre site web et nos services.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        2. Informations que nous collectons
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous collectons les types d'informations suivants :
                                    </p>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
                                        2.1. Informations que vous nous fournissez directement
                                    </h3>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Nom et prénom</li>
                                        <li>Adresse email</li>
                                        <li>Numéro de téléphone</li>
                                        <li>Adresse postale</li>
                                        <li>Informations sur vos demandes de services</li>
                                        <li>Documents que vous nous transmettez</li>
                                    </ul>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">
                                        2.2. Informations collectées automatiquement
                                    </h3>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Adresse IP</li>
                                        <li>Type de navigateur et système d'exploitation</li>
                                        <li>Pages visitées et temps passé sur le site</li>
                                        <li>Référent (site web d'origine)</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        3. Utilisation des informations
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous utilisons vos informations personnelles pour :
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Fournir, maintenir et améliorer nos services</li>
                                        <li>Traiter vos demandes et commandes</li>
                                        <li>Vous contacter concernant nos services</li>
                                        <li>Vous envoyer des informations importantes sur votre compte</li>
                                        <li>Personnaliser votre expérience sur notre site</li>
                                        <li>Détecter et prévenir les fraudes et abus</li>
                                        <li>Respecter nos obligations légales</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        4. Partage des informations
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
                                        Nous pouvons partager vos informations uniquement dans les cas suivants :
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Avec votre consentement explicite</li>
                                        <li>Avec nos prestataires de services de confiance qui nous aident à exploiter notre site</li>
                                        <li>Pour respecter une obligation légale ou répondre à une demande gouvernementale</li>
                                        <li>Pour protéger nos droits, votre sécurité ou celle d'autrui</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        5. Sécurité des données
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour 
                                        protéger vos informations personnelles contre l'accès non autorisé, la modification, la divulgation 
                                        ou la destruction.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        6. Conservation des données
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services 
                                        et respecter nos obligations légales. Lorsque nous n'avons plus besoin de vos données, nous les 
                                        supprimons de manière sécurisée.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        7. Vos droits
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Vous avez le droit de :
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Accéder à vos informations personnelles</li>
                                        <li>Demander la correction de vos informations inexactes</li>
                                        <li>Demander la suppression de vos informations</li>
                                        <li>Vous opposer au traitement de vos données</li>
                                        <li>Demander la portabilité de vos données</li>
                                        <li>Retirer votre consentement à tout moment</li>
                                    </ul>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Pour exercer ces droits, veuillez nous contacter via notre page de{' '}
                                        <a href="/contact" className="text-[var(--primary)] hover:underline">contact</a>.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        8. Cookies
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Notre site utilise des cookies pour améliorer votre expérience. Les cookies sont de petits fichiers 
                                        texte stockés sur votre appareil. Vous pouvez configurer votre navigateur pour refuser les cookies, 
                                        mais cela peut affecter certaines fonctionnalités du site.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        9. Modifications de cette politique
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                                        Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        10. Contact
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via 
                                        notre page de <a href="/contact" className="text-[var(--primary)] hover:underline">contact</a>.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
