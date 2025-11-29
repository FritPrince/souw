import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import type { SharedData } from '@/types';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { props } = usePage<SharedData>();
    const company = props.company;
    const logo = company?.logo_path;
    const companyName = company?.name ?? 'SouwTravel';
    const defaultLogo = '/storage/front/images/logo.png';

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium hover:opacity-80 transition-opacity"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-md p-2 dark:bg-gray-800">
                                {logo ? (
                                    <img 
                                        src={logo} 
                                        alt={companyName} 
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = defaultLogo;
                                        }}
                                    />
                                ) : (
                                    <img 
                                        src={defaultLogo} 
                                        alt={companyName} 
                                        className="h-full w-full object-contain"
                                    />
                                )}
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {companyName}
                            </span>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center w-full">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-gray-800">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
