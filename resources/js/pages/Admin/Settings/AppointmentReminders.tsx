import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Plus, X, Clock } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface AppointmentReminderSettings {
    id?: number;
    enabled: boolean;
    reminder_hours: number[];
    email_enabled: boolean;
    whatsapp_enabled: boolean;
    email_subject?: string;
    email_template?: string;
    whatsapp_template?: string;
}

export default function AppointmentRemindersPage({ settings }: { settings: AppointmentReminderSettings }) {
    const { data, setData, put, processing, errors } = useForm<AppointmentReminderSettings>({
        enabled: settings.enabled ?? true,
        reminder_hours: settings.reminder_hours ?? [24, 2],
        email_enabled: settings.email_enabled ?? true,
        whatsapp_enabled: settings.whatsapp_enabled ?? false,
        email_subject: settings.email_subject ?? '',
        email_template: settings.email_template ?? '',
        whatsapp_template: settings.whatsapp_template ?? '',
    });

    const [newHour, setNewHour] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings/appointment-reminders', {
            preserveScroll: true,
            onSuccess: () => {
                showToast.success('Paramètres de rappels mis à jour avec succès.');
            },
        });
    };

    const addReminderHour = () => {
        const hour = parseInt(newHour);
        if (hour && hour > 0 && hour <= 168 && !data.reminder_hours.includes(hour)) {
            setData('reminder_hours', [...data.reminder_hours, hour].sort((a, b) => a - b));
            setNewHour('');
        }
    };

    const removeReminderHour = (hour: number) => {
        setData(
            'reminder_hours',
            data.reminder_hours.filter((h) => h !== hour),
        );
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Paramètres', href: '/admin/settings' }, { title: 'Rappels automatiques', href: '/admin/settings/appointment-reminders' }]}>
            <div className="p-4 md:p-6 space-y-6">
                <Head title="Rappels automatiques - Admin" />

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rappels automatiques</h1>
                    <p className="text-muted-foreground mt-1">Configurez les rappels automatiques pour les rendez-vous</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Activation générale */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                <CardTitle>Activation</CardTitle>
                            </div>
                            <CardDescription>Activez ou désactivez les rappels automatiques</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enabled"
                                    checked={data.enabled}
                                    onCheckedChange={(checked) => setData('enabled', checked === true)}
                                />
                                <Label htmlFor="enabled" className="font-normal cursor-pointer">
                                    Activer les rappels automatiques
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Heures de rappel */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <CardTitle>Heures de rappel</CardTitle>
                            </div>
                            <CardDescription>Définissez les heures avant le rendez-vous pour envoyer les rappels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {data.reminder_hours.map((hour) => (
                                    <Badge key={hour} variant="secondary" className="gap-2 px-3 py-1">
                                        {hour}h avant
                                        <button
                                            type="button"
                                            onClick={() => removeReminderHour(hour)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    max="168"
                                    placeholder="Heures (ex: 24)"
                                    value={newHour}
                                    onChange={(e) => setNewHour(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addReminderHour();
                                        }
                                    }}
                                    className="w-32"
                                />
                                <Button type="button" onClick={addReminderHour} variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Les rappels seront envoyés aux heures spécifiées avant chaque rendez-vous (maximum 168h = 7 jours)
                            </p>
                            {errors.reminder_hours && (
                                <p className="text-sm text-destructive">{errors.reminder_hours}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Canaux de notification */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Canaux de notification</CardTitle>
                            <CardDescription>Choisissez les canaux pour envoyer les rappels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="email_enabled"
                                    checked={data.email_enabled}
                                    onCheckedChange={(checked) => setData('email_enabled', checked === true)}
                                />
                                <Label htmlFor="email_enabled" className="font-normal cursor-pointer flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="whatsapp_enabled"
                                    checked={data.whatsapp_enabled}
                                    onCheckedChange={(checked) => setData('whatsapp_enabled', checked === true)}
                                />
                                <Label htmlFor="whatsapp_enabled" className="font-normal cursor-pointer flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    WhatsApp (si configuré)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template email */}
                    {data.email_enabled && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    <CardTitle>Template Email</CardTitle>
                                </div>
                                <CardDescription>Personnalisez le sujet et le contenu de l'email de rappel</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="email_subject">Sujet de l'email</Label>
                                    <Input
                                        id="email_subject"
                                        value={data.email_subject || ''}
                                        onChange={(e) => setData('email_subject', e.target.value)}
                                        placeholder="Rappel: Votre rendez-vous demain"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Variables disponibles: {'{date}'}, {'{time}'}, {'{service}'}
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="email_template">Contenu de l'email (optionnel)</Label>
                                    <Textarea
                                        id="email_template"
                                        value={data.email_template || ''}
                                        onChange={(e) => setData('email_template', e.target.value)}
                                        placeholder="Laissez vide pour utiliser le template par défaut"
                                        rows={6}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Variables disponibles: {'{name}'}, {'{date}'}, {'{time}'}, {'{service}'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Template WhatsApp */}
                    {data.whatsapp_enabled && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <CardTitle>Template WhatsApp</CardTitle>
                                </div>
                                <CardDescription>Personnalisez le message WhatsApp de rappel</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="whatsapp_template">Message WhatsApp (optionnel)</Label>
                                    <Textarea
                                        id="whatsapp_template"
                                        value={data.whatsapp_template || ''}
                                        onChange={(e) => setData('whatsapp_template', e.target.value)}
                                        placeholder="Laissez vide pour utiliser le template par défaut"
                                        rows={6}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Variables disponibles: {'{name}'}, {'{date}'}, {'{time}'}, {'{service}'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}

