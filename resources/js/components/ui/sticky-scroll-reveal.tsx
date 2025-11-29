import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

export interface StickyItem {
    title: string;
    description: string;
    content: ReactNode;
    href?: string;
    ctaLabel?: string;
}

interface StickyScrollProps {
    content?: StickyItem[];
    className?: string;
    stickyOffset?: number;
}

export function StickyScroll({ content = [], className = '', stickyOffset = 120 }: StickyScrollProps) {
    const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [userScrolled, setUserScrolled] = useState(false);

    const items = useMemo(() => (content ?? []).filter(Boolean), [content]);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 0 && !userScrolled) {
                setUserScrolled(true);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [userScrolled]);

    useEffect(() => {
        if (!items.length) return;

        const observers: IntersectionObserver[] = [];
        sectionsRef.current = sectionsRef.current.slice(0, items.length);

        items.forEach((_, index) => {
            const node = sectionsRef.current[index];
            if (!node) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (!userScrolled) return; // do not auto-advance on load
                    if (entry.isIntersecting) setActiveIndex(index);
                },
                {
                    threshold: 0.55,
                    rootMargin: '-25% 0px -35% 0px',
                },
            );

            observer.observe(node);
            observers.push(observer);
        });

        return () => observers.forEach((observer) => observer.disconnect());
    }, [items, userScrolled]);

    if (!items.length) return null;

    const activeItem = items[activeIndex] ?? items[0];

    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                <div className="lg:w-1/2">
                    <div className="sticky" style={{ top: `${stickyOffset}px` }}>
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10 bg-white">
                            <div className="h-[360px] w-full">{activeItem?.content}</div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/55 to-transparent px-6 pb-8 pt-10 text-white">
                                <p className="text-sm uppercase tracking-[0.3em] text-white/60">Catégorie</p>
                                <h3 className="mt-2 text-2xl font-bold leading-tight">{activeItem?.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-white/80">{activeItem?.description}</p>
                                {activeItem?.href && activeItem?.ctaLabel && (
                                    <Link href={activeItem.href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-white">
                                        {activeItem.ctaLabel}
                                        <i className="las la-arrow-right"></i>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 space-y-6">
                    {items.map((item, index) => {
                        const isActive = index === activeIndex;
                        const sharedClasses = `rounded-2xl border transition-colors duration-300 scroll-mt-32 ${
                            isActive ? 'border-[var(--primary)] bg-white shadow-xl' : 'border-transparent bg-white/80 shadow-md hover:shadow-lg'
                        }`;

                        const Wrapper: any = item.href ? Link : 'div';
                        const wrapperProps = item.href ? { href: item.href, className: `block ${sharedClasses}` } : { className: sharedClasses };

                        return (
                            <div key={`${item.title}-${index}`} ref={(el) => (sectionsRef.current[index] = el)} className="cursor-pointer">
                                <Wrapper {...wrapperProps} onClick={() => setActiveIndex(index)}>
                                    <div className="p-8 min-h-[140px] flex items-start">
                                        <div className="flex w-full items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h4 className="text-lg font-semibold text-[var(--foreground)] truncate">{item.title}</h4>
                                                <p className="mt-2 text-sm text-[var(--foreground)]/70 leading-relaxed line-clamp-3">{item.description}</p>
                                            </div>
                                            <span className={`mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full transition ${isActive ? 'bg-[var(--primary)] shadow-[0_0_0_6px_rgba(0,80,139,0.15)]' : 'bg-[var(--primary)]/30'}`}></span>
                                        </div>
                                    </div>
                                </Wrapper>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
