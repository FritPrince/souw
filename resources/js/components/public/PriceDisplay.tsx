interface PriceDisplayProps {
    amount: number;
    currency?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showSymbol?: boolean;
}

const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
};

export default function PriceDisplay({
    amount,
    currency = 'XOF',
    className = '',
    size = 'md',
    showSymbol = true,
}: PriceDisplayProps) {
    const formatted = new Intl.NumberFormat('fr-FR', {
        style: showSymbol ? 'currency' : 'decimal',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return (
        <span
            className={`font-bold text-primary ${sizeClasses[size]} ${className}`}
        >
            {formatted}
        </span>
    );
}


