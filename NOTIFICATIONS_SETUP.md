# Configuration des Notifications - Phase 5

## 📧 Notifications Email

Toutes les notifications sont configurées pour envoyer des emails automatiquement.

### Notifications disponibles

1. **OrderCreatedNotification** - Envoyée lors de la création d'une commande
2. **OrderStatusUpdatedNotification** - Envoyée lors du changement de statut d'une commande
3. **PaymentCompletedNotification** - Envoyée lors d'un paiement réussi
4. **AppointmentConfirmedNotification** - Envoyée lors de la confirmation d'un rendez-vous
5. **AppointmentReminderNotification** - Envoyée comme rappel avant un rendez-vous
6. **DocumentsRequiredNotification** - Envoyée pour demander des documents

### Mailable Classes

1. **OrderConfirmation** - Email de confirmation de commande
2. **PaymentReceipt** - Reçu de paiement
3. **AppointmentConfirmation** - Confirmation de rendez-vous

## 📱 Intégration WhatsApp

### Configuration

Ajoutez ces variables dans votre fichier `.env` :

```env
WHATSAPP_ENABLED=true
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/webhooks/whatsapp
```

### Service WhatsApp

Le service `WhatsAppService` fournit :

- `sendMessage($to, $message)` - Envoyer un message texte
- `sendTemplate($to, $templateName, $parameters)` - Envoyer un message avec template
- `sendDocument($to, $documentUrl, $filename, $caption)` - Envoyer un document
- `isConfigured()` - Vérifier si WhatsApp est configuré

### Format des numéros

Le service formate automatiquement les numéros de téléphone :
- Supprime les caractères non numériques
- Remplace le 0 initial par l'indicatif du pays (229 pour Bénin)
- Ajoute le préfixe + si nécessaire

## 🔔 Événements et Listeners

### Événements

- `PaymentCompleted` - Déclenché lors d'un paiement réussi
- `PaymentFailed` - Déclenché lors d'un paiement échoué
- `AppointmentConfirmed` - Déclenché lors de la confirmation d'un rendez-vous

### Listeners

- `SendPaymentCompletedNotification` - Envoie la notification de paiement
- `SendAppointmentConfirmedNotification` - Envoie la notification de rendez-vous

## 📝 Utilisation

### Dans les Controllers

```php
// Envoyer une notification
$user->notify(new OrderCreatedNotification($order));

// Déclencher un événement
event(new PaymentCompleted($payment));
```

### Dans les Services

```php
// Le AppointmentService envoie automatiquement les rappels
$appointmentService->sendReminder($appointment);
```

## 🎯 Notifications automatiques

Les notifications sont envoyées automatiquement dans ces cas :

1. **Création de commande** - `OrderController@store`
2. **Changement de statut** - `AdminOrderController@updateStatus`
3. **Paiement réussi** - Via l'événement `PaymentCompleted`
4. **Confirmation rendez-vous** - Via l'événement `AppointmentConfirmed`
5. **Rappel rendez-vous** - Via la commande `appointments:send-reminders`

## 📋 Vues Email

Les vues email doivent être créées dans `resources/views/emails/` :

- `emails/orders/confirmation.blade.php`
- `emails/payments/receipt.blade.php`
- `emails/appointments/confirmation.blade.php`

## ⚙️ Configuration Mail

Assurez-vous que votre configuration mail dans `.env` est correcte :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 🔧 Personnalisation

### Ajouter un champ téléphone aux utilisateurs

Si vous voulez utiliser WhatsApp, ajoutez un champ `phone` à la table `users` :

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('phone')->nullable()->after('email');
});
```

Le modèle `User` utilise déjà `routeNotificationForWhatsApp()` pour récupérer le numéro.


