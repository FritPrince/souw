import { type ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    children?: ReactNode;
}

export default function StatsCard({
    title,
    value,
    icon,
    trend,
    className = '',
    children,
}: StatsCardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>
                {icon && (
                    <div className="bg-primary/10 rounded-full p-3">
                        <i className={`${icon} text-primary text-2xl`}></i>
                    </div>
                )}
            </div>

            {trend && (
                <div
                    className={`flex items-center gap-1 text-sm ${
                        trend.isPositive
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}
                >
                    <i
                        className={`las ${
                            trend.isPositive
                                ? 'la-arrow-up'
                                : 'la-arrow-down'
                        }`}
                    ></i>
                    <span>{Math.abs(trend.value)}%</span>
                    <span className="text-gray-500">vs mois dernier</span>
                </div>
            )}

            {children}
        </div>
    );
}


