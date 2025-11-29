<?php

use App\Http\Controllers\Admin\AdminAppointmentController;
use App\Http\Controllers\Admin\AdminAppointmentReminderController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminCompanyInfoController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDestinationController;
use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\Admin\AdminFedaPayController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminReportsController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminTestimonialController;
use App\Http\Controllers\Admin\AdminTourismController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TourismController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

// ============================================
// ROUTES PUBLIQUES
// ============================================

// Services
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/categories/{category:slug}/services', [ServiceController::class, 'getByCategory'])->name('services.category');
Route::get('/destinations/{destination:slug}/services', [ServiceController::class, 'getByDestination'])->name('services.destination');
Route::get('/api/services/{service}/sub-services', [ServiceController::class, 'getSubServices'])->name('api.services.sub-services');
Route::get('/api/services/{service}/required-documents', [ServiceController::class, 'getRequiredDocuments'])->name('api.services.documents');
Route::get('/api/services/{service}/processing-times', [ServiceController::class, 'getProcessingTimes'])->name('api.services.processing-times');

// Destinations
Route::get('/destinations', [DestinationController::class, 'index'])->name('destinations.index');
Route::get('/destinations/{destination:slug}', [DestinationController::class, 'show'])->name('destinations.show');
Route::get('/api/destinations/{destination}/services', [DestinationController::class, 'getServices'])->name('api.destinations.services');

// Tourisme
Route::get('/tourism', [TourismController::class, 'index'])->name('tourism.index');

// Consultation (prise de rendez-vous publique)
Route::get('/consultation', [ConsultationController::class, 'index'])->name('consultation.index');
Route::get('/consultation/slots', [ConsultationController::class, 'getSlotsForDate'])->name('consultation.slots');
Route::post('/consultation', [ConsultationController::class, 'store'])->name('consultation.store');

// Événements
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::get('/events/{event:slug}', [EventController::class, 'show'])->name('events.show');
Route::get('/events/{event:slug}/packs', [EventController::class, 'getPacks'])->name('events.packs');
Route::post('/events/{event:slug}/register', [EventController::class, 'register'])->name('events.register');

// Contact
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// À propos
Route::get('/about', [AboutController::class, 'index'])->name('about.index');

// Callback paiement (sans auth pour webhook) - Accepte GET et POST
Route::match(['get', 'post'], 'payments/callback', [PaymentController::class, 'callback'])->name('payments.callback');

// ============================================
// ROUTES AUTHENTIFIÉES
// ============================================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();

        if ($user && Gate::forUser($user)->allows('access-admin')) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    // Orders
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::post('/{order}/documents', [OrderController::class, 'uploadDocuments'])->name('upload-documents');
        Route::get('/{order}/documents/{document}/download', [OrderController::class, 'downloadDocument'])->name('documents.download');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });

    // Appointments
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])->name('index');
        Route::get('/book', [AppointmentController::class, 'book'])->name('book');
        Route::get('/available-slots', [AppointmentController::class, 'availableSlots'])->name('available-slots');
        Route::post('/', [AppointmentController::class, 'store'])->name('store');
        Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('show');
        Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('cancel');
    });

    // Payments
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])->name('index');
        Route::post('/initiate', [PaymentController::class, 'initiate'])->name('initiate');
        Route::get('/{payment}/process', [PaymentController::class, 'process'])->name('process');
        Route::get('/{payment}/verify', [PaymentController::class, 'verify'])->name('verify');
        Route::get('/{payment}/success', [PaymentController::class, 'success'])->name('success');
        Route::get('/{payment}/failed', [PaymentController::class, 'failed'])->name('failed');
        Route::post('/{payment}/send-recap', [PaymentController::class, 'sendRecap'])->name('send-recap');
    });

    // Tourism Bookings
});

Route::post('/tourism/book', [TourismController::class, 'book'])
    ->middleware(['auth', 'verified', 'throttle:10,1'])
    ->name('tourism.book');

Route::get('/tourism/my-bookings', [TourismController::class, 'myBookings'])
    ->middleware(['auth', 'verified'])
    ->name('tourism.my-bookings');

Route::get('/tourism/{slug}', [TourismController::class, 'show'])
    ->where('slug', '^(?!my-bookings$).*')
    ->name('tourism.show');

// ============================================
// ROUTES ADMIN
// ============================================
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Categories
    Route::resource('categories', AdminCategoryController::class);
    Route::post('categories/clear', [AdminCategoryController::class, 'clear'])->name('categories.clear');

    // Services
    Route::resource('services', AdminServiceController::class);
    Route::post('services/{service}/toggle-status', [AdminServiceController::class, 'toggleStatus'])->name('services.toggle-status');
    Route::post('services/clear', [AdminServiceController::class, 'clear'])->name('services.clear');

    // Destinations
    Route::resource('destinations', AdminDestinationController::class);
    Route::post('destinations/clear', [AdminDestinationController::class, 'clear'])->name('destinations.clear');

    // Testimonials
    Route::resource('testimonials', AdminTestimonialController::class);
    Route::post('testimonials/{testimonial}/toggle', [AdminTestimonialController::class, 'toggle'])->name('testimonials.toggle');
    Route::post('testimonials/clear', [AdminTestimonialController::class, 'clear'])->name('testimonials.clear');

    // Orders
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->name('index');
        Route::get('/{order}', [AdminOrderController::class, 'show'])->name('show');
        Route::put('/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('update-status');
        Route::post('/{order}/note', [AdminOrderController::class, 'addNote'])->name('add-note');
        Route::get('/{order}/documents/{document}/download', [AdminOrderController::class, 'downloadDocument'])->name('documents.download');
    });

    // Appointments
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::get('/', [AdminAppointmentController::class, 'index'])->name('index');
        Route::get('/slots', [AdminAppointmentController::class, 'slots'])->name('slots');
        Route::post('/slots', [AdminAppointmentController::class, 'createSlot'])->name('create-slot');
        Route::put('/slots/{appointmentSlot}', [AdminAppointmentController::class, 'updateSlot'])->name('update-slot');
        Route::delete('/slots/{appointmentSlot}', [AdminAppointmentController::class, 'destroySlot'])->name('destroy-slot');
        Route::post('/slots/clear', [AdminAppointmentController::class, 'clearSlots'])->name('clear-slots');
        Route::post('/{appointment}/confirm', [AdminAppointmentController::class, 'confirm'])->name('confirm');
        Route::post('/{appointment}/cancel', [AdminAppointmentController::class, 'cancel'])->name('cancel');
    });

    // Tourism
    Route::prefix('tourism')->name('tourism.')->group(function () {
        Route::get('/packages', [AdminTourismController::class, 'index'])->name('packages.index');
        Route::get('/packages/create', [AdminTourismController::class, 'create'])->name('packages.create');
        Route::get('/packages/{package}/edit', [AdminTourismController::class, 'edit'])->name('packages.edit');
        Route::get('/bookings', [AdminTourismController::class, 'bookings'])->name('bookings.index');
        Route::put('/bookings/{booking}/status', [AdminTourismController::class, 'updateBookingStatus'])->name('bookings.update-status');
        Route::delete('/bookings/{booking}', [AdminTourismController::class, 'destroyBooking'])->name('bookings.destroy');
        Route::post('/packages', [AdminTourismController::class, 'store'])->name('packages.store');
        Route::match(['post', 'put'], '/packages/{package}', [AdminTourismController::class, 'update'])->name('packages.update');
        Route::delete('/packages/{package}', [AdminTourismController::class, 'destroy'])->name('packages.destroy');
    });

    // Events
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', [AdminEventController::class, 'index'])->name('index');
        Route::get('/create', [AdminEventController::class, 'create'])->name('create');
        Route::post('/', [AdminEventController::class, 'store'])->name('store');
        Route::get('/{event}/edit', [AdminEventController::class, 'edit'])->name('edit');
        Route::match(['post', 'put'], '/{event}', [AdminEventController::class, 'update'])->name('update');
        Route::delete('/{event}', [AdminEventController::class, 'destroy'])->name('destroy');
        Route::get('/{event}/registrations', [AdminEventController::class, 'registrations'])->name('registrations');
        Route::put('/{event}/registrations/{registration}/status', [AdminEventController::class, 'updateRegistrationStatus'])->name('registrations.update-status');
    });

    // FedaPay Config
    Route::get('fedapay', [AdminFedaPayController::class, 'edit'])->name('fedapay.edit');
    Route::put('fedapay', [AdminFedaPayController::class, 'update'])->name('fedapay.update');
    Route::post('fedapay/test', [AdminFedaPayController::class, 'test'])->name('fedapay.test');

    // Company info
    Route::get('settings/company', [AdminCompanyInfoController::class, 'edit'])->name('company.edit');
    Route::match(['post', 'put'], 'settings/company', [AdminCompanyInfoController::class, 'update'])->name('company.update');

    // Appointment Reminders Settings
    Route::get('settings/appointment-reminders', [AdminAppointmentReminderController::class, 'edit'])->name('appointment-reminders.edit');
    Route::put('settings/appointment-reminders', [AdminAppointmentReminderController::class, 'update'])->name('appointment-reminders.update');

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [AdminReportsController::class, 'index'])->name('index');
        Route::get('/export/excel', [AdminReportsController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [AdminReportsController::class, 'exportPdf'])->name('export.pdf');
    });
});

require __DIR__.'/settings.php';
