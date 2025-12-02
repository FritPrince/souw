import ScrollReveal from '@/components/animations/ScrollReveal';

interface Testimonial {
    id: number;
    name: string;
    role?: string;
    avatar_path?: string;
    rating?: number;
    content: string;
}

interface TestimonialsProps {
    testimonials?: Testimonial[];
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
    if (!testimonials.length) return null;

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <ScrollReveal animation="fade-up">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                            Témoignages
                        </h2>
                        <p className="text-[var(--foreground)]/70 max-w-2xl mx-auto">
                            Ce que nos clients disent de nous
                        </p>
                    </div>
                </ScrollReveal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <ScrollReveal key={t.id} animation="fade-up" delay={i * 80}>
                            <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg dark:shadow-gray-800/50 ring-1 ring-black/5 dark:ring-gray-700 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--primary)]/10 flex items-center justify-center">
                                        {t.avatar_path ? (
                                            <img src={t.avatar_path} alt={t.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <i className="las la-user text-[var(--primary)] text-xl"></i>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[var(--foreground)] truncate">{t.name}</p>
                                        {t.role && (
                                            <p className="text-sm text-[var(--foreground)]/60 truncate">{t.role}</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[var(--foreground)]/80 leading-relaxed mb-4 flex-1">{t.content}</p>
                                {typeof t.rating === 'number' && (
                                    <div className="flex items-center gap-1 text-[#f9d121]">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <i
                                                key={idx}
                                                className={`las ${idx < (t.rating || 0) ? 'la-star' : 'la-star-o'}`}
                                            ></i>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
