import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<SharedData>();
    const company = props.company;
    const logo = company?.logo_path;
    const name = company?.name ?? 'SouwTravel';

    return (
        <>
            {logo ? (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary/20">
                    <img src={logo} alt={name} className="h-8 w-8 rounded-md object-cover" />
                </div>
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
