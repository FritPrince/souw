import { Head, Link, router, useForm } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface Testimonial {
    id: number;
    name: string;
    role?: string;
    avatar_path?: string;
    rating?: number;
    content: string;
    is_active: boolean;
}

interface Props {
    testimonial: Testimonial;
}

export default function Edit({ testimonial }: Props) {
    const { data, setData, processing, errors } = useForm({
        name: testimonial.name || '',
        role: testimonial.role || '',
        avatar: null as File | null,
        avatar_path: testimonial.avatar_path || '',
        rating: testimonial.rating || 5,
        content: testimonial.content || '',
        is_active: testimonial.is_active,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: data.name,
            role: data.role,
            avatar: data.avatar,
            avatar_path: data.avatar_path,
            rating: data.rating,
            content: data.content,
            is_active: data.is_active,
            _method: 'put',
        };

        router.post(`/admin/testimonials/${testimonial.id}`, payload, {
            forceFormData: true,
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Témoignages', href: '/admin/testimonials' }, { title: 'Éditer', href: `/admin/testimonials/${testimonial.id}/edit` }]}>
		<div className="p-6">
            <Head title={`Éditer témoignage - ${testimonial.name}`} />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Éditer témoignage</h1>
				<Link href="/admin/testimonials" className="text-[var(--primary)] hover:underline">Retour</Link>
            </div>

			<form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
						<input
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
							value={data.name}
							onChange={(e) => setData('name', e.target.value)}
							aria-invalid={!!errors.name}
							aria-describedby={errors.name ? 'name-error' : undefined}
						/>
						{errors.name && <p id="name-error" className="text-red-600 text-xs mt-1">{errors.name}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-800">Rôle</label>
						<input
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
							value={data.role}
							onChange={(e) => setData('role', e.target.value)}
							aria-invalid={!!errors.role}
							aria-describedby={errors.role ? 'role-error' : undefined}
						/>
						{errors.role && <p id="role-error" className="text-red-600 text-xs mt-1">{errors.role}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-800">Avatar</label>
						<div className="mt-2 flex items-center gap-4">
							<div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
								{testimonial.avatar_path ? (
									<img src={testimonial.avatar_path} className="h-full w-full object-cover" />
								) : (
									<span className="text-xs text-gray-400">Aucun</span>
								)}
							</div>
							<input
								type="file"
								accept="image/*"
								className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
								onChange={(e) => {
									const file = e.currentTarget.files?.[0] ?? null;
									setData('avatar', file);
								}}
							/>
						</div>
						{errors.avatar && <p className="text-red-600 text-xs mt-1">{errors.avatar}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-800">Note</label>
						<input
							type="number"
							min={1}
							max={5}
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
							value={data.rating}
							onChange={(e) => setData('rating', Number(e.target.value))}
							aria-invalid={!!errors.rating}
							aria-describedby={errors.rating ? 'rating-error' : undefined}
						/>
						{errors.rating && <p id="rating-error" className="text-red-600 text-xs mt-1">{errors.rating}</p>}
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-800">Contenu</label>
						<textarea
							rows={5}
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
							value={data.content}
							onChange={(e) => setData('content', e.target.value)}
							aria-invalid={!!errors.content}
							aria-describedby={errors.content ? 'content-error' : undefined}
						/>
						{errors.content && <p id="content-error" className="text-red-600 text-xs mt-1">{errors.content}</p>}
					</div>

					<div className="md:col-span-2">
						<label className="inline-flex items-center gap-3">
							<input
								id="is_active"
								type="checkbox"
								className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
								checked={data.is_active}
								onChange={(e) => setData('is_active', e.target.checked)}
							/>
							<span className="text-sm text-gray-800">Actif</span>
						</label>
					</div>
				</div>

				<div className="mt-8 flex items-center justify-end gap-3">
					<Link href="/admin/testimonials" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
						Annuler
					</Link>
					<button
						type="submit"
						disabled={processing}
						className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/30 disabled:opacity-60"
					>
						{processing ? 'Mise à jour...' : 'Mettre à jour'}
					</button>
				</div>
			</form>
        </div>
        </AppSidebarLayout>
    );
}
