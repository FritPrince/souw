import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

interface FedaPayConfig {
    id?: number;
    public_key_live?: string;
    secret_key_live?: string;
    public_key_sandbox?: string;
    secret_key_sandbox?: string;
    is_sandbox: boolean;
}

interface Props {
    config: FedaPayConfig | null;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function FedaPay({ config, flash }: Props) {
    const [testing, setTesting] = useState<'live' | 'sandbox' | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const page = usePage();

    useEffect(() => {
        // Mettre à jour le formulaire si la config change
        if (config) {
            setData({
                public_key_live: config.public_key_live || '',
                secret_key_live: config.secret_key_live || '',
                public_key_sandbox: config.public_key_sandbox || '',
                secret_key_sandbox: config.secret_key_sandbox || '',
                is_sandbox: config.is_sandbox ?? true,
            });
        }
    }, [config]);

    useEffect(() => {
        // Vérifier les messages flash depuis les props de la page
        const pageFlash = (page.props as any)?.flash;
        if (pageFlash?.success) {
            setMessage({ type: 'success', text: pageFlash.success });
            setTimeout(() => setMessage(null), 5000);
        } else if (pageFlash?.error) {
            setMessage({ type: 'error', text: pageFlash.error });
            setTimeout(() => setMessage(null), 5000);
        }
        // Aussi vérifier les props directes
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setTimeout(() => setMessage(null), 5000);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setTimeout(() => setMessage(null), 5000);
        }
    }, [flash, page.props]);

    const { data, setData, put, processing, errors } = useForm({
        public_key_live: config?.public_key_live || '',
        secret_key_live: config?.secret_key_live || '',
        public_key_sandbox: config?.public_key_sandbox || '',
        secret_key_sandbox: config?.secret_key_sandbox || '',
        is_sandbox: config?.is_sandbox ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/fedapay', {
            preserveScroll: true,
        });
    };

    const testConnection = (mode: 'live' | 'sandbox') => {
        setTesting(mode);
        router.post(
            '/admin/fedapay/test',
            { mode },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setTesting(null);
                    const flash = (page.props as any)?.flash;
                    if (flash?.success) {
                        setMessage({ type: 'success', text: flash.success });
                        setTimeout(() => setMessage(null), 5000);
                    } else if (flash?.error) {
                        setMessage({ type: 'error', text: flash.error });
                        setTimeout(() => setMessage(null), 5000);
                    }
                },
                onError: (errors) => {
                    setTesting(null);
                    if (errors.message) {
                        setMessage({ type: 'error', text: errors.message });
                    } else {
                        setMessage({ type: 'error', text: 'Une erreur est survenue lors du test.' });
                    }
                    setTimeout(() => setMessage(null), 5000);
                },
                onFinish: () => {
                    setTesting(null);
                    router.reload({ only: ['flash', 'config'] });
                },
            }
        );
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'FedaPay', href: '/admin/fedapay' }]}>
            <div className="p-6">
                <Head title="Configuration FedaPay" />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Configuration FedaPay</h1>
                    <Link href="/admin" className="text-[var(--primary)] hover:underline">Retour</Link>
                </div>

                {/* Messages flash */}
                {message && (
                    <div
                        className={`mb-6 rounded-lg p-4 ${
                            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{message.text}</span>
                            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-6 md:p-8 space-y-8">
                    {/* Mode */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Mode d'utilisation</h2>
                        <div className="flex items-center gap-6">
                            <label className="inline-flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="mode"
                                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                                    checked={data.is_sandbox}
                                    onChange={() => setData('is_sandbox', true)}
                                />
                                <span className="text-sm text-gray-800">Sandbox (Test)</span>
                            </label>
                            <label className="inline-flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="mode"
                                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                                    checked={!data.is_sandbox}
                                    onChange={() => setData('is_sandbox', false)}
                                />
                                <span className="text-sm text-gray-800">Live (Production)</span>
                            </label>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Mode actuel :</span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${data.is_sandbox ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {data.is_sandbox ? '🔶 Sandbox (Test)' : '✅ Live (Production)'}
                            </span>
                        </div>
                    </section>

                    {/* Clés Sandbox */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Clés Sandbox (Test)</h2>
                            <button
                                type="button"
                                onClick={() => testConnection('sandbox')}
                                disabled={testing === 'sandbox' || !data.public_key_sandbox || !data.secret_key_sandbox}
                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing === 'sandbox' ? 'Test en cours...' : 'Tester Sandbox'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Clé publique Sandbox</label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="pk_sandbox_..."
                                    value={data.public_key_sandbox}
                                    onChange={(e) => setData('public_key_sandbox', e.target.value)}
                                    aria-invalid={!!errors.public_key_sandbox}
                                />
                                {errors.public_key_sandbox && <p className="text-red-600 text-xs mt-1">{errors.public_key_sandbox}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Clé secrète Sandbox</label>
                                <input
                                    type="password"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="sk_sandbox_..."
                                    value={data.secret_key_sandbox}
                                    onChange={(e) => setData('secret_key_sandbox', e.target.value)}
                                    aria-invalid={!!errors.secret_key_sandbox}
                                />
                                {errors.secret_key_sandbox && <p className="text-red-600 text-xs mt-1">{errors.secret_key_sandbox}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Clés Live */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Clés Live (Production)</h2>
                            <button
                                type="button"
                                onClick={() => testConnection('live')}
                                disabled={testing === 'live' || !data.public_key_live || !data.secret_key_live}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testing === 'live' ? 'Test en cours...' : 'Tester Live'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Clé publique Live</label>
                                <input
                                    type="text"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="pk_live_..."
                                    value={data.public_key_live}
                                    onChange={(e) => setData('public_key_live', e.target.value)}
                                    aria-invalid={!!errors.public_key_live}
                                />
                                {errors.public_key_live && <p className="text-red-600 text-xs mt-1">{errors.public_key_live}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Clé secrète Live</label>
                                <input
                                    type="password"
                                    className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                    placeholder="sk_live_..."
                                    value={data.secret_key_live}
                                    onChange={(e) => setData('secret_key_live', e.target.value)}
                                    aria-invalid={!!errors.secret_key_live}
                                />
                                {errors.secret_key_live && <p className="text-red-600 text-xs mt-1">{errors.secret_key_live}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Link href="/admin" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white text-gray-700 hover:bg-gray-50">
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