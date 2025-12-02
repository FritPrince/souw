import { Link } from '@inertiajs/react';
import destinations from '@/routes/destinations';

interface DestinationCardProps {
    destination: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        flag_emoji?: string;
        continent?: string;
        image_path?: string;
        video_path?: string;
        media_type?: 'image' | 'video';
        services_count?: number;
    };
    className?: string;
}

export default function DestinationCard({
    destination,
    className = '',
}: DestinationCardProps) {
    return (
        <Link
            href={destinations.show({ destination: destination.slug }).url}
            className={`block bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-800/50 overflow-hidden transition-colors duration-300 ${className}`}
        >
            {(destination.image_path || destination.video_path) && (
                <div className="relative h-48 overflow-hidden">
                    {destination.media_type === 'video' && destination.video_path ? (
                        <video
                            src={destination.video_path}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    ) : destination.image_path ? (
                        <img
                            src={destination.image_path}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {destination.flag_emoji && (
                        <div className="absolute top-4 right-4 text-4xl">
                            {destination.flag_emoji}
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold mb-1">
                            {destination.name}
                        </h3>
                        {destination.continent && (
                            <p className="text-sm text-white/90">
                                {destination.continent}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {!destination.image_path && !destination.video_path && (
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        {destination.flag_emoji && (
                            <span className="text-3xl">
                                {destination.flag_emoji}
                            </span>
                        )}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {destination.name}
                            </h3>
                            {destination.continent && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {destination.continent}
                                </p>
                            )}
                        </div>
                    </div>

                    {destination.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {destination.description}
                        </p>
                    )}

                    {destination.services_count !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <i className="las la-briefcase"></i>
                            <span>
                                {destination.services_count} service
                                {destination.services_count > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </Link>
    );
}


