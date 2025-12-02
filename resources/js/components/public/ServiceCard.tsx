import { Link } from '@inertiajs/react';
import servicesRoutes from '@/routes/services';

interface ServiceCardProps {
    service: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        price: number;
        category?: {
            name: string;
            icon?: string;
        };
        destinations?: Array<{
            id: number;
            name: string;
            flag_emoji?: string;
        }>;
        image_path?: string;
        video_path?: string;
        media_type?: 'image' | 'video';
        is_active?: boolean;
    };
    className?: string;
}

export default function ServiceCard({
    service,
    className = '',
}: ServiceCardProps) {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-800/50 overflow-hidden transition-shadow duration-300 ${className}`}
        >
            {(service.image_path || service.video_path) && (
                <div className="relative h-48 overflow-hidden">
                    {service.media_type === 'video' && service.video_path ? (
                        <video
                            src={service.video_path}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    ) : service.image_path ? (
                        <img
                            src={service.image_path}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                    ) : null}
                    {service.category?.icon && (
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2">
                            <i className={`${service.category.icon} text-primary text-xl`}></i>
                        </div>
                    )}
                </div>
            )}

            <div className="p-6">
                {service.category && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        {service.category.icon && (
                            <i className={service.category.icon}></i>
                        )}
                        <span>{service.category.name}</span>
                    </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {service.name}
                </h3>

                {service.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                    </p>
                )}

                {service.destinations && service.destinations.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {service.destinations.slice(0, 3).map((destination) => (
                            <span
                                key={destination.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                            >
                                {destination.flag_emoji && (
                                    <span>{destination.flag_emoji}</span>
                                )}
                                <span className="truncate max-w-[80px]">
                                    {destination.name}
                                </span>
                            </span>
                        ))}
                        {service.destinations.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
                                +{service.destinations.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href={servicesRoutes.show.url({ service: service.slug })}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        Voir détails
                    </Link>
                </div>
            </div>
        </div>
    );
}


