import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user?: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface CompanyInfoShared {
    name?: string;
    address?: string;
    phone_primary?: string;
    phone_secondary?: string;
    email?: string;
    whatsapp_number?: string;
    logo_path?: string | null;
    hero_media_type?: 'image' | 'video' | null;
    hero_image_path?: string | null;
    hero_video_path?: string | null;
    info_section_badges?: {
        first?: string | null;
        second?: string | null;
        third?: string | null;
    };
    social_media?: Record<string, string> | null;
    [key: string]: unknown;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth?: Auth;
    sidebarOpen: boolean;
    company?: CompanyInfoShared | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedData<T> {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
