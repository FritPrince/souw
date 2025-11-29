import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { AdminNotifications } from '@/components/admin-notifications';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItemType[];
    notificationCounts?: {
        new_orders?: number;
        new_payments?: number;
        new_users?: number;
    };
}

export function AppSidebarHeader({
    breadcrumbs = [],
    notificationCounts,
}: AppSidebarHeaderProps) {
    const page = usePage<SharedData>();
    const counts = notificationCounts || page.props.notificationCounts;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-4 md:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="min-w-0 flex-1 hidden sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <AdminNotifications counts={counts} />
            </div>
        </header>
    );
}
