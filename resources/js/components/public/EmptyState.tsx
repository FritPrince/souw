import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
    children?: ReactNode;
}

export default function EmptyState({
    icon = 'las la-inbox',
    title,
    description,
    action,
    className = '',
    children,
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
        >
            <div className="bg-gray-100 rounded-full p-6 mb-4">
                <i className={`${icon} text-4xl text-gray-400`}></i>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-600 max-w-md mb-6">{description}</p>
            )}

            {action && (
                <div>
                    {action.href ? (
                        <Link href={action.href}>
                            <Button>{action.label}</Button>
                        </Link>
                    ) : (
                        <Button onClick={action.onClick}>
                            {action.label}
                        </Button>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}


