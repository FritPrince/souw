# Intégration Kkiapay

## Configuration

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Kkiapay Configuration
KKIAPAY_PUBLIC_KEY=your_public_key_here
KKIAPAY_PRIVATE_KEY=your_private_key_here
KKIAPAY_SECRET=your_secret_key_here
KKIAPAY_SANDBOX=true
KKIAPAY_API_URL=https://api.kkiapay.me

# Payment Configuration
PAYMENT_CURRENCY=XOF
DEFAULT_PAYMENT_METHOD=kkiapay
```

## Utilisation

### 1. Initier un paiement

Le paiement est initié via le `PaymentController` :

```php
POST /payments/initiate
{
    "order_id": 1,
    "payment_method": "kkiapay"
}
```

### 2. Widget Kkiapay (Frontend)

Dans votre composant React/Inertia pour la page de paiement, utilisez le widget Kkiapay :

```javascript
// Ajoutez le script Kkiapay dans votre layout
<script src="https://cdn.kkiapay.me/k.js"></script>

// Dans votre composant de paiement
function openKkiapayWidget(paymentData) {
    openKkiapayWidget({
        amount: paymentData.amount, // Montant en centimes
        key: paymentData.public_key,
        sandbox: paymentData.sandbox,
        callback: paymentData.callback_url,
        data: paymentData.data,
        theme: 'default'
    });
}
```

### 3. Callback

Le callback est automatiquement géré par le système. Kkiapay enverra une requête POST ou GET à :

```
/payments/callback
```

Le système :
- Vérifie la signature (si fournie)
- Met à jour le statut du paiement
- Met à jour le statut de la commande
- Déclenche les événements `PaymentCompleted` ou `PaymentFailed`

### 4. Vérification manuelle

Pour vérifier le statut d'un paiement :

```php
GET /payments/{payment}/verify
```

## Événements

### PaymentCompleted

Déclenché lorsqu'un paiement est complété avec succès.

```php
use App\Events\PaymentCompleted;

Event::listen(PaymentCompleted::class, function ($event) {
    $payment = $event->payment;
    // Envoyer un email de confirmation
    // Notifier l'administrateur
    // etc.
});
```

### PaymentFailed

Déclenché lorsqu'un paiement échoue.

```php
use App\Events\PaymentFailed;

Event::listen(PaymentFailed::class, function ($event) {
    $payment = $event->payment;
    $reason = $event->reason;
    // Envoyer un email d'échec
    // Logger l'erreur
    // etc.
});
```

## Jobs

### ProcessPaymentCallback

Le callback de Kkiapay est traité de manière asynchrone via le job `ProcessPaymentCallback`. Cela permet de :
- Répondre rapidement à Kkiapay
- Traiter le callback en arrière-plan
- Gérer les erreurs sans bloquer la réponse

## Remboursements

Pour rembourser un paiement :

```php
use App\Services\PaymentService;
use App\Models\Payment;

$paymentService = app(PaymentService::class);
$payment = Payment::find($id);

$refunded = $paymentService->refund($payment);
```

## Sécurité

- Les callbacks sont vérifiés via signature HMAC SHA256
- La route de callback est accessible sans authentification (nécessaire pour les webhooks)
- Les clés API doivent être stockées de manière sécurisée dans `.env`
- En production, désactivez le mode sandbox : `KKIAPAY_SANDBOX=false`

## Documentation Kkiapay

Pour plus d'informations sur l'API Kkiapay :
- [Documentation officielle](https://docs.kkiapay.me)
- [SDK JavaScript](https://docs.kkiapay.me/v1/plugin-et-sdk/sdk-javascript)


