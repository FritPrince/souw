import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Trash2, AlertTriangle } from 'lucide-react';

interface AppointmentSlot {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    max_bookings: number;
    current_bookings: number;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    slots: Paginated<AppointmentSlot>;
    filters?: { date?: string };
}

export default function Slots({ slots, filters }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState<AppointmentSlot | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<AppointmentSlot | null>(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const { data: createData, setData: setCreateData, post: createSlot, processing: creating, reset: resetCreate } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        max_bookings: 1,
        is_available: true,
    });

    const { data: updateData, setData: setUpdateData, put: updateSlot, processing: updating, reset: resetUpdate } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        max_bookings: 1,
        is_available: true,
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (selectedDate) {
            params.append('date', selectedDate);
        }
        router.get('/admin/appointments/slots', params.toString() ? Object.fromEntries(params) : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSelectedDate('');
        router.get('/admin/appointments/slots', {}, { preserveState: true, preserveScroll: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createSlot('/admin/appointments/slots', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            },
        });
    };

    const handleEdit = (slot: AppointmentSlot) => {
        setEditingSlot(slot);
        setUpdateData({
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            max_bookings: slot.max_bookings,
            is_available: slot.is_available,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSlot) {
            updateSlot(`/admin/appointments/slots/${editingSlot.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingSlot(null);
                    resetUpdate();
                },
            });
        }
    };

    const cancelEdit = () => {
        setEditingSlot(null);
        resetUpdate();
    };

    const handleDelete = (slot: AppointmentSlot) => {
        setDeletingSlot(slot);
    };

    const confirmDelete = () => {
        if (deletingSlot) {
            setIsDeleting(true);
            router.delete(`/admin/appointments/slots/${deletingSlot.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingSlot(null);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            });
        }
    };

    const handleClearAll = () => {
        setIsClearing(true);
        router.post('/admin/appointments/slots/clear', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowClearModal(false);
            },
            onFinish: () => {
                setIsClearing(false);
            },
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Rendez-vous', href: '/admin/appointments' }, { title: 'Créneaux', href: '/admin/appointments/slots' }]}>
            <div className="p-6">
                <Head title="Gestion des créneaux" />
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Gestion des créneaux</h1>
                    <div className="flex gap-3">
                        <Link href="/admin/appointments" className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            Retour
                        </Link>
                        {slots.data.length > 0 && (
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Vider les créneaux
                            </button>
                        )}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95"
                        >
                            Nouveau créneau
                        </button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95"
                            >
                                Filtrer
                            </button>
                            {selectedDate && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow ring-1 ring-black/5 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Heure</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Réservations</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {slots.data.map((slot) => (
                                <tr key={slot.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {new Date(slot.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {slot.start_time} - {slot.end_time}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {slot.current_bookings} / {slot.max_bookings}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                slot.is_available && slot.current_bookings < slot.max_bookings
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {slot.is_available && slot.current_bookings < slot.max_bookings ? 'Disponible' : 'Complet'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(slot)}
                                                className="px-2 py-1 rounded bg-white ring-1 ring-gray-300 hover:bg-gray-50"
                                            >
                                                Éditer
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slot)}
                                                className="px-2 py-1 rounded bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                                                title={slot.current_bookings > 0 ? 'Ce créneau a des réservations' : 'Supprimer'}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {slots.links.length > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
                            <nav className="inline-flex rounded-md shadow-sm overflow-hidden">
                                {slots.links.map((l, i) => (
                                    <Link
                                        key={i}
                                        href={l.url || '#'}
                                        className={`px-3 py-2 text-sm ${l.active ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>

                {/* Modal création */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Nouveau créneau</h3>
                            <form onSubmit={handleCreate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={createData.date}
                                            onChange={(e) => setCreateData('date', e.target.value)}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                value={createData.start_time}
                                                onChange={(e) => setCreateData('start_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                value={createData.end_time}
                                                onChange={(e) => setCreateData('end_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre max de réservations</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={createData.max_bookings}
                                            onChange={(e) => setCreateData('max_bookings', Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                checked={createData.is_available}
                                                onChange={(e) => setCreateData('is_available', e.target.checked)}
                                            />
                                            <span className="text-sm text-gray-700">Disponible</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetCreate();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95 disabled:opacity-60"
                                    >
                                        {creating ? 'Création...' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal édition */}
                {editingSlot && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Éditer le créneau</h3>
                            <form onSubmit={handleUpdate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={updateData.date}
                                            onChange={(e) => setUpdateData('date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                value={updateData.start_time}
                                                onChange={(e) => setUpdateData('start_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                                value={updateData.end_time}
                                                onChange={(e) => setUpdateData('end_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre max de réservations</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={updateData.max_bookings}
                                            onChange={(e) => setUpdateData('max_bookings', Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)]"
                                                checked={updateData.is_available}
                                                onChange={(e) => setUpdateData('is_available', e.target.checked)}
                                            />
                                            <span className="text-sm text-gray-700">Disponible</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded hover:opacity-95 disabled:opacity-60"
                                    >
                                        {updating ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal confirmation suppression */}
                {deletingSlot && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Supprimer ce créneau ?</h3>
                            </div>
                            <p className="text-gray-600 mb-2">
                                Êtes-vous sûr de vouloir supprimer le créneau du{' '}
                                <span className="font-medium">
                                    {new Date(deletingSlot.date).toLocaleDateString('fr-FR')}
                                </span>{' '}
                                de{' '}
                                <span className="font-medium">
                                    {deletingSlot.start_time} à {deletingSlot.end_time}
                                </span>{' '}
                                ?
                            </p>
                            {deletingSlot.current_bookings > 0 && (
                                <p className="text-amber-600 text-sm bg-amber-50 p-2 rounded mb-4">
                                    ⚠️ Ce créneau a {deletingSlot.current_bookings} réservation(s). La suppression sera refusée.
                                </p>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setDeletingSlot(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    disabled={isDeleting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-60"
                                >
                                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal vider tous les créneaux */}
                {showClearModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Vider tous les créneaux ?</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Cette action supprimera tous les créneaux qui n'ont pas de rendez-vous associés. 
                                Les créneaux avec des réservations seront conservés.
                            </p>
                            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                ⚠️ Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowClearModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    disabled={isClearing}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    disabled={isClearing}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-60"
                                >
                                    {isClearing ? 'Suppression...' : 'Vider les créneaux'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}

