import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { update as updateCompanyRoute, edit as editCompanyRoute } from '@/routes/admin/company';

interface CompanyInfo {
	name?: string;
	address?: string;
	phone_primary?: string;
	phone_secondary?: string;
	email?: string;
	appointment_price?: number;
	rccm?: string;
	ifu?: string;
	whatsapp_number?: string;
	logo_path?: string | null;
	hero_media_type?: 'image' | 'video' | null;
	hero_image_path?: string | null;
	hero_video_path?: string | null;
	info_section1_image?: string | null;
	info_section2_image?: string | null;
	info_section3_image?: string | null;
	info_section1_badge?: string | null;
	info_section2_badge?: string | null;
	info_section3_badge?: string | null;
	social_media?: Record<string, string> | null;
}

export default function CompanyInfoPage({ companyInfo }: { companyInfo: CompanyInfo | null }) {
	const original = useRef<CompanyInfo | null>(companyInfo);

	const [logoPreview, setLogoPreview] = useState<string | null>(companyInfo?.logo_path ?? null);
	const [heroImagePreview, setHeroImagePreview] = useState<string | null>(companyInfo?.hero_image_path ?? null);
	const [heroVideoPreview, setHeroVideoPreview] = useState<string | null>(companyInfo?.hero_video_path ?? null);
	const [infoPreviews, setInfoPreviews] = useState<Array<string | null>>([
		companyInfo?.info_section1_image ?? null,
		companyInfo?.info_section2_image ?? null,
		companyInfo?.info_section3_image ?? null,
	]);

	useEffect(() => {
		return () => {
			if (logoPreview?.startsWith('blob:')) {
				URL.revokeObjectURL(logoPreview);
			}
			if (heroImagePreview?.startsWith('blob:')) {
				URL.revokeObjectURL(heroImagePreview);
			}
			if (heroVideoPreview?.startsWith('blob:')) {
				URL.revokeObjectURL(heroVideoPreview);
			}
			infoPreviews.forEach((preview) => {
				if (preview?.startsWith('blob:')) {
					URL.revokeObjectURL(preview);
				}
			});
		};
	}, [logoPreview, heroImagePreview, heroVideoPreview, infoPreviews]);

	const { data, setData, processing, errors } = useForm({
		name: companyInfo?.name ?? '',
		address: companyInfo?.address ?? '',
		phone_primary: companyInfo?.phone_primary ?? '',
		phone_secondary: companyInfo?.phone_secondary ?? '',
		email: companyInfo?.email ?? '',
		appointment_price: companyInfo?.appointment_price ?? 0,
		rccm: companyInfo?.rccm ?? '',
		ifu: companyInfo?.ifu ?? '',
		whatsapp_number: companyInfo?.whatsapp_number ?? '',
		logo: null as File | null,
		hero_media_type: (companyInfo?.hero_media_type as 'image' | 'video' | null) ?? 'image',
		hero_image: null as File | null,
		hero_video: null as File | null,
		info_section1_image: null as File | null,
		info_section2_image: null as File | null,
		info_section3_image: null as File | null,
		info_section1_badge: companyInfo?.info_section1_badge ?? '',
		info_section2_badge: companyInfo?.info_section2_badge ?? '',
		info_section3_badge: companyInfo?.info_section3_badge ?? '',
	});

	const originalBadges = useMemo(() => ({
		info_section1_badge: companyInfo?.info_section1_badge ?? '',
		info_section2_badge: companyInfo?.info_section2_badge ?? '',
		info_section3_badge: companyInfo?.info_section3_badge ?? '',
	}), [companyInfo]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const payload = new FormData();
		payload.append('_method', 'put');

		const appendIfChanged = (key: keyof CompanyInfo, value: string | null | undefined) => {
			const originalValue = original.current?.[key] ?? '';
			if (value !== undefined && value !== null) {
				if (value !== originalValue) {
					payload.append(key, value);
				}
			}
		};

		appendIfChanged('name', data.name);
		appendIfChanged('address', data.address);
		appendIfChanged('phone_primary', data.phone_primary);
		appendIfChanged('phone_secondary', data.phone_secondary);
		appendIfChanged('email', data.email);
		appendIfChanged('rccm', data.rccm);
		appendIfChanged('ifu', data.ifu);
		appendIfChanged('whatsapp_number', data.whatsapp_number);
		
		// Toujours envoyer le prix du rendez-vous
		payload.append('appointment_price', String(data.appointment_price));

		if (data.logo instanceof File) {
			payload.append('logo', data.logo);
		}

		const originalHeroType = original.current?.hero_media_type ?? 'image';
		const currentHeroType = data.hero_media_type ?? 'image';

		if (currentHeroType !== originalHeroType) {
			payload.append('hero_media_type', currentHeroType);
		}

		if (currentHeroType === 'image' && data.hero_image instanceof File) {
			payload.append('hero_image', data.hero_image);
		}

		if (currentHeroType === 'video' && data.hero_video instanceof File) {
			payload.append('hero_video', data.hero_video);
		}

		([1, 2, 3] as const).forEach((idx) => {
			const key = `info_section${idx}_image` as const;
			const file = data[key];
			if (file instanceof File) {
				payload.append(key, file);
			}

			const badgeKey = `info_section${idx}_badge` as const;
			const badgeValue = data[badgeKey];
			if (badgeValue !== originalBadges[badgeKey]) {
				payload.append(badgeKey, badgeValue ?? '');
			}
		});

		router.post(updateCompanyRoute.url(), payload, { forceFormData: true });
	};

	return (
		<AppSidebarLayout breadcrumbs={[{ title: 'Paramètres', href: editCompanyRoute.url() }, { title: 'Infos société', href: editCompanyRoute.url() }]}>
			<div className="p-6">
				<Head title="Informations de l'entreprise" />
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold">Informations de l'entreprise</h1>
					<Link href="/admin/dashboard" className="text-[var(--primary)] hover:underline">Retour</Link>
				</div>

				<form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8 space-y-10">
					<section>
						<h2 className="text-lg font-semibold mb-4">Identité</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-800">Nom *</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
									value={data.name} onChange={(e) => setData('name', e.target.value)} />
								{errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">Email</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.email} onChange={(e) => setData('email', e.target.value)} />
								{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-800">Prix des rendez-vous (FCFA)</label>
								<p className="text-xs text-gray-500 mb-2">Ce montant sera facturé pour chaque consultation/rendez-vous. Le mode de tarification se configure par service.</p>
								<input 
									type="number"
									min="0"
									step="100"
									className="mt-1 block w-full md:w-1/2 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.appointment_price} 
									onChange={(e) => setData('appointment_price', Number(e.target.value))} 
								/>
								{errors.appointment_price && <p className="text-red-600 text-xs mt-1">{errors.appointment_price}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">Téléphone (principal)</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.phone_primary} onChange={(e) => setData('phone_primary', e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">Téléphone (secondaire)</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.phone_secondary} onChange={(e) => setData('phone_secondary', e.target.value)} />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-800">Adresse</label>
								<textarea rows={3} className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.address} onChange={(e) => setData('address', e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">RCCM</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.rccm} onChange={(e) => setData('rccm', e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">IFU</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.ifu} onChange={(e) => setData('ifu', e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">WhatsApp</label>
								<input className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.whatsapp_number} onChange={(e) => setData('whatsapp_number', e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-800">Logo</label>
								<div className="mt-2 flex items-center gap-4">
									<div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
										{logoPreview ? <img src={logoPreview} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">Aucun</span>}
									</div>
									<input type="file" accept="image/*"
										className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
										onChange={(e) => {
											const file = e.currentTarget.files?.[0] ?? null;
											setData('logo', file);
											if (logoPreview?.startsWith('blob:')) {
												URL.revokeObjectURL(logoPreview);
											}
											setLogoPreview(file ? URL.createObjectURL(file) : original.current?.logo_path ?? null);
										}} />
								</div>
								{errors.logo && <p className="text-red-600 text-xs mt-1">{errors.logo}</p>}
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold mb-4">Hero</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-800">Type de média</label>
								<select
									className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
									value={data.hero_media_type ?? 'image'}
									onChange={(e) => setData('hero_media_type', e.target.value as 'image' | 'video')}
								>
									<option value="image">Image</option>
									<option value="video">Vidéo</option>
								</select>
							</div>
							{(data.hero_media_type ?? 'image') === 'image' ? (
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-800">Image</label>
									<div className="mt-2 flex items-center gap-4">
										<div className="h-20 w-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
											{heroImagePreview ? <img src={heroImagePreview} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">Aucune</span>}
										</div>
										<input type="file" accept="image/*"
											className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
											onChange={(e) => {
												const file = e.currentTarget.files?.[0] ?? null;
												setData('hero_image', file);
												if (heroImagePreview?.startsWith('blob:')) {
													URL.revokeObjectURL(heroImagePreview);
												}
												setHeroImagePreview(file ? URL.createObjectURL(file) : original.current?.hero_image_path ?? null);
											}} />
									</div>
									{errors.hero_image && <p className="text-red-600 text-xs mt-1">{errors.hero_image}</p>}
								</div>
							) : (
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-800">Vidéo (mp4/webm/ogg)</label>
									<div className="mt-2 flex items-center gap-4">
										<div className="h-20 w-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
											{heroVideoPreview ? <video className="h-full w-full object-cover" controls src={heroVideoPreview} /> : <span className="text-xs text-gray-400">Aucune</span>}
										</div>
										<input type="file" accept="video/mp4,video/webm,video/ogg"
											className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
											onChange={(e) => {
												const file = e.currentTarget.files?.[0] ?? null;
												setData('hero_video', file);
												if (heroVideoPreview?.startsWith('blob:')) {
													URL.revokeObjectURL(heroVideoPreview);
												}
												setHeroVideoPreview(file ? URL.createObjectURL(file) : original.current?.hero_video_path ?? null);
											}} />
									</div>
									{errors.hero_video && <p className="text-red-600 text-xs mt-1">{errors.hero_video}</p>}
								</div>
							)}
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold mb-4">Sections d'info</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="space-y-3">
									<label className="block text-sm font-medium text-gray-800">Image {i}</label>
									<div className="flex items-center gap-4">
										<div className="h-16 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
											{infoPreviews[i - 1] ? (
												<img src={infoPreviews[i - 1] ?? undefined} className="h-full w-full object-cover" />
											) : <span className="text-xs text-gray-400">Aucune</span>}
										</div>
										<input type="file" accept="image/*"
											className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-white hover:file:opacity-95"
											onChange={(e) => {
												const file = e.currentTarget.files?.[0] ?? null;
												setData(`info_section${i}_image` as any, file);
												setInfoPreviews((prev) => {
													const next = [...prev];
													const currentPreview = next[i - 1];
													if (currentPreview?.startsWith('blob:')) {
														URL.revokeObjectURL(currentPreview);
													}
													next[i - 1] = file ? URL.createObjectURL(file) : (original.current as any)?.[`info_section${i}_image`] ?? null;
													return next;
												});
											}} />
									</div>
									<label className="block text-sm font-medium text-gray-800">Badge {i}</label>
									<input className="block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm"
										value={(data as any)[`info_section${i}_badge`] ?? ''}
										onChange={(e) => setData(`info_section${i}_badge` as any, e.target.value)} />
								</div>
							))}
						</div>
					</section>

					<div className="flex items-center justify-end gap-3">
						<Link href="/admin/dashboard" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">Annuler</Link>
						<button type="submit" disabled={processing} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white shadow hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/30 disabled:opacity-60">
							{processing ? 'Mise à jour...' : 'Enregistrer'}
						</button>
					</div>
				</form>
			</div>
		</AppSidebarLayout>
	);
}


