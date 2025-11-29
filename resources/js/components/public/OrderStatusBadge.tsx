interface OrderStatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<
    string,
    { label: string; className: string }
> = {
    pending: {
        label: 'En attente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    confirmed: {
        label: 'Confirmée',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    paid: {
        label: 'Payée',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    processing: {
        label: 'En traitement',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    completed: {
        label: 'Terminé',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    cancelled: {
        label: 'Annulé',
        className: 'bg-red-100 text-red-800 border-red-200',
    },
};

export default function OrderStatusBadge({
    status,
    className = '',
}: OrderStatusBadgeProps) {
    const config =
        statusConfig[status.toLowerCase()] ||
        statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
        >
            {config.label}
        </span>
    );
}


