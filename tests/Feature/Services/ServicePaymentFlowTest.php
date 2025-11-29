<?php

namespace Tests\Feature\Services;

use App\Mail\AdminOrderNotification;
use App\Mail\OrderConfirmation;
use App\Mail\PaymentReceipt;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Category;
use App\Models\CompanyInfo;
use App\Models\Destination;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Service;
use App\Models\ServiceProcessingTime;
use App\Models\SubService;
use App\Models\User;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderStatusUpdatedNotification;
use App\Notifications\PaymentCompletedNotification;
use App\Services\PaymentService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ServicePaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_subscribe_service_pay_and_receive_notifications(): void
    {
        Mail::fake();
        Notification::fake();

        $this->mockPaymentConfig();

        CompanyInfo::create([
            'name' => 'SouwTravel',
            'email' => 'admin@example.com',
        ]);

        $client = User::factory()->create([
            'email' => 'client@example.com',
        ]);

        $category = Category::factory()->create([
            'slug' => 'documents-administratifs',
        ]);

        $service = Service::factory()->for($category)->create([
            'name' => 'Demande de passeport biométrique',
            'requires_appointment' => true,
            'price' => 100_000,
        ]);

        $processing = ServiceProcessingTime::create([
            'service_id' => $service->id,
            'duration_label' => '73h',
            'duration_hours' => 72,
            'price_multiplier' => 1.5,
        ]);

        $document = \App\Models\RequiredDocument::create([
            'service_id' => $service->id,
            'name' => 'Acte de naissance',
            'description' => 'Copie certifiée conforme',
            'is_required' => true,
            'order' => 1,
        ]);

        $destination = Destination::create([
            'name' => 'France',
            'slug' => 'france',
            'code' => 'FR',
            'continent' => 'Europe',
            'flag_emoji' => '🇫🇷',
            'is_active' => true,
        ]);

        $subService = SubService::factory()->for($service)->create([
            'name' => 'Passeport express',
            'price' => 200_000,
        ]);

        $this->actingAs($client)
            ->post(route('orders.store'), [
                'service_id' => $service->id,
                'sub_service_id' => $subService->id,
                'destination_id' => $destination->id,
                'processing_time_id' => $processing->id,
                'notes' => 'Traitement en urgence',
            ])
            ->assertRedirect();

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertSame('pending', $order->status);
        $this->assertSame('pending', $order->payment_status);
        $this->assertSame($subService->price * $processing->price_multiplier, (float) $order->total_amount);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $client->id,
            'amount' => $order->total_amount,
            'currency' => 'XOF',
            'payment_method' => 'kkiapay',
            'payment_status' => 'pending',
        ]);

        app(PaymentService::class)->completePayment($payment, ['transaction_id' => 'TX-123456']);

        $order->refresh();
        $payment->refresh();

        $this->assertSame('processing', $order->status);
        $this->assertSame('completed', $order->payment_status);
        $this->assertSame('completed', $payment->payment_status);
        $this->assertNotNull($payment->payment_date);

        Notification::assertSentTo(
            $client,
            PaymentCompletedNotification::class,
            fn (PaymentCompletedNotification $notification) => $notification->payment->is($payment)
        );

        Notification::assertSentTo(
            $client,
            OrderCreatedNotification::class,
            fn (OrderCreatedNotification $notification) => $notification->order->is($order)
        );

        Notification::assertSentTo(
            $client,
            OrderStatusUpdatedNotification::class,
            fn (OrderStatusUpdatedNotification $notification) => $notification->order->is($order)
                && $notification->oldStatus === 'pending'
                && $notification->newStatus === 'processing'
        );

        Mail::assertSent(OrderConfirmation::class, fn (OrderConfirmation $mail) => $mail->order->is($order));
        Mail::assertSent(AdminOrderNotification::class, fn (AdminOrderNotification $mail) => $mail->order->is($order));
        Mail::assertSent(PaymentReceipt::class, function (PaymentReceipt $mail) use ($payment) {
            return $mail->payment->is($payment);
        });
    }

    public function test_service_requiring_appointment_can_book_slot_after_payment(): void
    {
        Mail::fake();
        Notification::fake();

        $this->mockPaymentConfig();

        CompanyInfo::create([
            'name' => 'SouwTravel',
            'email' => 'admin@example.com',
        ]);

        $client = User::factory()->create();
        $category = Category::factory()->create(['slug' => 'visa-immigration']);

        $service = Service::factory()->for($category)->create([
            'requires_appointment' => true,
            'price' => 80_000,
        ]);

        $destination = Destination::create([
            'name' => 'Canada',
            'slug' => 'canada',
            'code' => 'CA',
            'continent' => 'Amérique du Nord',
            'flag_emoji' => '🇨🇦',
            'is_active' => true,
        ]);

        $this->actingAs($client)
            ->post(route('orders.store'), [
                'service_id' => $service->id,
                'destination_id' => $destination->id,
            ])
            ->assertRedirect();

        $order = Order::first();
        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $client->id,
            'amount' => $order->total_amount,
            'currency' => 'XOF',
            'payment_method' => 'kkiapay',
            'payment_status' => 'pending',
        ]);

        app(PaymentService::class)->completePayment($payment, ['transaction_id' => 'TX-APPT-001']);

        $slot = AppointmentSlot::factory()->create([
            'date' => Carbon::today()->addDay(),
            'start_time' => '09:00',
            'end_time' => '09:30',
        ]);

        $this->actingAs($client)
            ->post(route('appointments.store'), [
                'appointment_slot_id' => $slot->id,
                'service_id' => $service->id,
                'order_id' => $order->id,
            ])
            ->assertRedirect(route('orders.show', $order));

        $appointment = Appointment::first();
        $this->assertNotNull($appointment);
        $this->assertTrue($appointment->order->is($order));
        $this->assertSame('scheduled', $appointment->status);

        $slot->refresh();
        $this->assertSame(1, $slot->current_bookings);
    }

    public function test_service_without_appointment_cannot_access_slots(): void
    {
        $client = User::factory()->create();
        $service = Service::factory()->create(['requires_appointment' => false]);

        $this->actingAs($client)
            ->getJson(route('appointments.available-slots', [
                'date' => Carbon::today()->addDay()->format('Y-m-d'),
                'service_id' => $service->id,
            ]))
            ->assertStatus(400)
            ->assertJson(['message' => 'Ce service ne nécessite pas de rendez-vous.']);
    }

    protected function mockPaymentConfig(): void
    {
        config()->set('payment.kkiapay.public_key', 'public_test_key');
        config()->set('payment.kkiapay.private_key', 'private_test_key');
        config()->set('payment.kkiapay.secret', 'secret_test_key');
        config()->set('payment.kkiapay.sandbox', true);
        config()->set('payment.kkiapay.api_url', 'https://api-sandbox.kkiapay.me');
        config()->set('payment.currency', 'XOF');
        config()->set('mail.from.address', 'admin@example.com');
    }
}
