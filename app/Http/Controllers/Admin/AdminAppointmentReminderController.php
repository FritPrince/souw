<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAppointmentReminderSettingsRequest;
use App\Models\AppointmentReminderSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminAppointmentReminderController extends Controller
{
    public function edit(): Response
    {
        $settings = AppointmentReminderSettings::getSettings();

        return Inertia::render('Admin/Settings/AppointmentReminders', [
            'settings' => $settings,
        ]);
    }

    public function update(UpdateAppointmentReminderSettingsRequest $request): RedirectResponse
    {
        $settings = AppointmentReminderSettings::getSettings();
        $settings->update($request->validated());

        return back()->with('success', 'Paramètres de rappels mis à jour avec succès.');
    }
}
