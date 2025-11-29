import { Head, Link, useForm } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

	export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        role: '',
        avatar: null as File | null,
        avatar_path: '',
        rating: 5,
        content: '',
        is_active: true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/testimonials', { forceFormData: true });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Témoignages', href: '/admin/testimonials' }, { title: 'Nouveau', href: '/admin/testimonials/create' }]}>
		<div className="p-6">
			<Head title="Nouveau témoignage" />
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Nouveau témoignage</h1>
				<Link href="/admin/testimonials" className="text-[var(--primary)] hover:underline">Retour</Link>
			</div>

			<form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-800">Nom <span className="text-red-500">*</span></label>
						<input
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
							placeholder="Ex: Jean Dupont"
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
							placeholder="Ex: Entrepreneur, Voyageur..."
							value={data.role}
							onChange={(e) => setData('role', e.target.value)}
							aria-invalid={!!errors.role}
							aria-describedby={errors.role ? 'role-error' : undefined}
						/>
						{errors.role && <p id="role-error" className="text-red-600 text-xs mt-1">{errors.role}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-800">Avatar</label>
						<input
							type="file"
							accept="image/*"
							className="mt-2 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
							onChange={(e) => {
                                const file = e.currentTarget.files?.[0] || null;
                                setData('avatar', file);
							}}
						/>
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
							placeholder="Racontez son expérience..."
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
						{processing ? 'Enregistrement...' : 'Enregistrer'}
					</button>
				</div>
			</form>
		</div>
        </AppSidebarLayout>
    );
}
