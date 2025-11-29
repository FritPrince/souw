interface PaymentStatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<
    string,
    { label: string; className: string; icon: string }
> = {
    pending: {
        label: 'En attente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'las la-clock',
    },
    completed: {
        label: 'Payé',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: 'las la-check-circle',
    },
    failed: {
        label: 'Échoué',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: 'las la-times-circle',
    },
    refunded: {
        label: 'Remboursé',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'las la-undo',
    },
};

export default function PaymentStatusBadge({
    status,
    className = '',
}: PaymentStatusBadgeProps) {
    const config =
        statusConfig[status.toLowerCase()] ||
        statusConfig.pending;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
        >
            <i className={config.icon}></i>
            {config.label}
        </span>
    );
}


