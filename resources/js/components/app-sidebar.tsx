import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, MessageSquare, Building2, Tags, Layers, MapPin, ShoppingCart, CalendarDays, PlaneTakeoff, ListChecks, CreditCard, BarChart3, Bell, PartyPopper } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Témoignages',
        href: '/admin/testimonials',
        icon: MessageSquare,
    },
    {
        title: 'Infos société',
        href: '/admin/settings/company',
        icon: Building2,
    },
    {
        title: 'Rappels automatiques',
        href: '/admin/settings/appointment-reminders',
        icon: Bell,
    },
    {
        title: 'FedaPay',
        href: '/admin/fedapay',
        icon: CreditCard,
    },
    {
        title: 'Catégories',
        href: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'Services',
        href: '/admin/services',
        icon: Layers,
    },
    {
        title: 'Destinations',
        href: '/admin/destinations',
        icon: MapPin,
    },
    {
        title: 'Commandes',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Rendez-vous',
        href: '/admin/appointments',
        icon: CalendarDays,
    },
    {
        title: 'Événements',
        href: '/admin/events',
        icon: PartyPopper,
    },
    {
        title: 'Tourisme - Packages',
        href: '/admin/tourism/packages',
        icon: PlaneTakeoff,
    },
    {
        title: 'Tourisme - Réservations',
        href: '/admin/tourism/bookings',
        icon: ListChecks,
    },
    {
        title: 'Rapports',
        href: '/admin/reports',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
