import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in';
    delay?: number;
    threshold?: number;
    once?: boolean;
}

export default function ScrollReveal({
    children,
    className = '',
    animation = 'fade-up',
    delay = 0,
    threshold = 0.25,
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [once, threshold]);

    return (
        <div
            ref={ref}
            className={`sr-base sr-${animation} ${isVisible ? 'sr-active' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
