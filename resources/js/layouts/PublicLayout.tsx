import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    headerProps?: {
        phone?: string;
        email?: string;
        logo?: string;
    };
    footerProps?: {
        logo?: string;
        companyInfo?: {
            name?: string;
            address?: string;
            phone?: string;
            email?: string;
        };
    };
}

export default function PublicLayout({
    children,
    headerProps,
    footerProps,
}: PublicLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <PublicHeader {...headerProps} />
            <main className="flex-1">{children}</main>
            <PublicFooter {...footerProps} />
        </div>
    );
}


