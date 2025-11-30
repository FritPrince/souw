import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

interface Props {
    company: {
        name?: string;
    } | null;
}

export default function TermsIndex({ company }: Props) {
    const companyName = company?.name ?? 'SouwTravel';

    return (
        <PublicLayout>
            <Head title={`Conditions d'utilisation - ${companyName}`} />

            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 lg:p-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Conditions d'utilisation
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
                                        1. Acceptation des conditions
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        En accédant et en utilisant le site web de {companyName}, vous acceptez d'être lié par ces conditions d'utilisation. 
                                        Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        2. Description des services
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        {companyName} fournit des services de consultation en immigration, visa, tourisme et autres services liés aux voyages. 
                                        Nous nous efforçons de fournir des informations précises, mais nous ne garantissons pas l'exactitude, 
                                        l'exhaustivité ou l'actualité des informations sur ce site.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        3. Utilisation du site
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Vous vous engagez à utiliser notre site uniquement à des fins légales et d'une manière qui ne porte pas atteinte 
                                        aux droits d'autrui ou qui ne restreint pas l'utilisation du site par d'autres utilisateurs.
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Il est interdit d'utiliser ce site pour :
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                                        <li>Transmettre des virus, chevaux de Troie ou tout autre code malveillant</li>
                                        <li>Tenter d'accéder de manière non autorisée à des zones restreintes du site</li>
                                        <li>Reproduire, copier ou revendre tout ou partie du contenu sans autorisation</li>
                                        <li>Utiliser le site de manière à violer les lois applicables</li>
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        4. Propriété intellectuelle
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Tout le contenu de ce site, y compris les textes, graphiques, logos, icônes, images et logiciels, 
                                        est la propriété de {companyName} ou de ses fournisseurs de contenu et est protégé par les lois sur 
                                        la propriété intellectuelle.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        5. Limitations de responsabilité
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        {companyName} ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou 
                                        consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser ce site ou ses services.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        6. Modifications des conditions
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
                                        Les modifications prendront effet dès leur publication sur cette page. 
                                        Nous vous encourageons à consulter régulièrement cette page pour prendre connaissance des conditions en vigueur.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        7. Droit applicable
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Ces conditions d'utilisation sont régies par les lois en vigueur. 
                                        Tout litige sera soumis à la juridiction exclusive des tribunaux compétents.
                                    </p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        8. Contact
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via notre 
                                        page de <a href="/contact" className="text-[var(--primary)] hover:underline">contact</a>.
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
