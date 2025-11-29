# Routes de Visualisation - SouwTravel App

Ce document liste toutes les routes disponibles pour visualiser les différentes pages de l'application.

## Phase 6.2 : Page d'accueil (Home)

**Route:** `/`  
**Nom de route:** `home`  
**Controller:** `HomeController@index`  
**Page Inertia:** `Home.tsx`

**URL complète:** `http://localhost:8000/` ou `http://votre-domaine.com/`

---

## Phase 6.3 : Pages Services

### Index des Services

**Route:** `/services`  
**Nom de route:** `services.index`  
**Controller:** `ServiceController@index`  
**Page Inertia:** `Services/Index.tsx`

**URL complète:** `http://localhost:8000/services`

**Filtres disponibles:**
- `?category=1` - Filtrer par catégorie
- `?destination=1` - Filtrer par destination
- `?search=visa` - Recherche textuelle

### Détails d'un Service

**Route:** `/services/{slug}`  
**Nom de route:** `services.show`  
**Controller:** `ServiceController@show`  
**Page Inertia:** `Services/Show.tsx`

**URL complète:** `http://localhost:8000/services/visa-usa`

**Exemples:**
- `/services/visa-usa`
- `/services/passeport-express`

### Services par Catégorie

**Route:** `/categories/{slug}/services`  
**Nom de route:** `services.category`  
**Controller:** `ServiceController@getByCategory`  
**Page Inertia:** `Services/Index.tsx`

**URL complète:** `http://localhost:8000/categories/visa-immigration/services`

### Services par Destination

**Route:** `/destinations/{slug}/services`  
**Nom de route:** `services.destination`  
**Controller:** `ServiceController@getByDestination`  
**Page Inertia:** `Services/Index.tsx`

**URL complète:** `http://localhost:8000/destinations/usa/services`

---

## Phase 6.4 : Pages Destinations

### Index des Destinations

**Route:** `/destinations`  
**Nom de route:** `destinations.index`  
**Controller:** `DestinationController@index`  
**Page Inertia:** `Destinations/Index.tsx`

**URL complète:** `http://localhost:8000/destinations`

### Détails d'une Destination

**Route:** `/destinations/{slug}`  
**Nom de route:** `destinations.show`  
**Controller:** `DestinationController@show`  
**Page Inertia:** `Destinations/Show.tsx`

**URL complète:** `http://localhost:8000/destinations/usa`

**Exemples:**
- `/destinations/usa`
- `/destinations/france`
- `/destinations/canada`

---

## Phase 6.5 : Pages Commandes

### Index des Commandes (Authentifié)

**Route:** `/orders`  
**Nom de route:** `orders.index`  
**Controller:** `OrderController@index`  
**Page Inertia:** `Orders/Index.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/orders`

### Détails d'une Commande (Authentifié)

**Route:** `/orders/{id}`  
**Nom de route:** `orders.show`  
**Controller:** `OrderController@show`  
**Page Inertia:** `Orders/Show.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/orders/1`

**Exemples:**
- `/orders/1`
- `/orders/2`

---

## Phase 6.6 : Pages Rendez-vous

### Index des Rendez-vous (Authentifié)

**Route:** `/appointments`  
**Nom de route:** `appointments.index`  
**Controller:** `AppointmentController@index`  
**Page Inertia:** `Appointments/Index.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/appointments`

### Détails d'un Rendez-vous (Authentifié)

**Route:** `/appointments/{id}`  
**Nom de route:** `appointments.show`  
**Controller:** `AppointmentController@show`  
**Page Inertia:** `Appointments/Show.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/appointments/1`

**Exemples:**
- `/appointments/1`
- `/appointments/2`

### API - Créneaux Disponibles

**Route:** `/api/appointments/available-slots`  
**Méthode:** `GET`  
**Controller:** `AppointmentController@availableSlots`  
**Retour:** JSON

**Paramètres:**
- `date` (requis) - Format: `Y-m-d`
- `service_id` (optionnel)

**URL complète:** `http://localhost:8000/api/appointments/available-slots?date=2025-01-15&service_id=1`

---

## Phase 6.7 : Pages Paiements

### Index des Paiements (Authentifié)

**Route:** `/payments`  
**Nom de route:** `payments.index`  
**Controller:** `PaymentController@index`  
**Page Inertia:** `Payments/Index.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/payments`

### Processus de Paiement (Authentifié)

**Route:** `/payments/{id}/process`  
**Nom de route:** `payments.process`  
**Controller:** `PaymentController@process`  
**Page Inertia:** `Payments/Process.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/payments/1/process`

### Paiement Réussi (Authentifié)

**Route:** `/payments/{id}/success`  
**Nom de route:** `payments.success`  
**Controller:** `PaymentController@success`  
**Page Inertia:** `Payments/Success.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/payments/1/success`

### Paiement Échoué (Authentifié)

**Route:** `/payments/{id}/failed`  
**Nom de route:** `payments.failed`  
**Controller:** `PaymentController@failed`  
**Page Inertia:** `Payments/Failed.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/payments/1/failed`

### Callback Kkiapay (Public - Webhook)

**Route:** `/payments/callback`  
**Nom de route:** `payments.callback`  
**Controller:** `PaymentController@callback`  
**Méthodes:** `GET`, `POST`

**URL complète:** `http://localhost:8000/payments/callback`

---

## Phase 6.8 : Pages Tourisme

### Index des Packages Tourisme

**Route:** `/tourism`  
**Nom de route:** `tourism.index`  
**Controller:** `TourismController@index`  
**Page Inertia:** `Tourism/Index.tsx`

**URL complète:** `http://localhost:8000/tourism`

**Filtres disponibles:**
- `?duration=7` - Durée maximale en jours
- `?max_price=50000` - Prix maximum

### Détails d'un Package Tourisme

**Route:** `/tourism/{slug}`  
**Nom de route:** `tourism.show`  
**Controller:** `TourismController@show`  
**Page Inertia:** `Tourism/Show.tsx`

**URL complète:** `http://localhost:8000/tourism/decouverte-benin`

**Exemples:**
- `/tourism/decouverte-benin`
- `/tourism/circuit-royal`

### Mes Réservations Tourisme (Authentifié)

**Route:** `/tourism/my-bookings`  
**Nom de route:** `tourism.my-bookings`  
**Controller:** `TourismController@myBookings`  
**Page Inertia:** `Tourism/MyBookings.tsx`  
**Middleware:** `auth`

**URL complète:** `http://localhost:8000/tourism/my-bookings`

---

## Routes d'Authentification

### Connexion

**Route:** `/login`  
**Nom de route:** `login`  
**Page Inertia:** Gérée par Fortify

**URL complète:** `http://localhost:8000/login`

### Inscription

**Route:** `/register`  
**Nom de route:** `register`  
**Page Inertia:** Gérée par Fortify

**URL complète:** `http://localhost:8000/register`

### Déconnexion

**Route:** `/logout`  
**Nom de route:** `logout`  
**Méthode:** `POST`

---

## Notes Importantes

1. **Authentification:** Les routes marquées "Authentifié" nécessitent que l'utilisateur soit connecté. Redirection automatique vers `/login` si non authentifié.

2. **Paramètres de Route:** 
   - Les routes utilisant `{slug}` acceptent le slug du modèle
   - Les routes utilisant `{id}` acceptent l'ID numérique

3. **Environnement de Développement:**
   - Assurez-vous que votre serveur Laravel est démarré: `php artisan serve`
   - Assurez-vous que Vite est en cours d'exécution: `npm run dev`

4. **Base URL:** Remplacez `http://localhost:8000` par votre URL de production si nécessaire.

---

## Commandes Utiles

```bash
# Démarrer le serveur Laravel
php artisan serve

# Démarrer Vite (dans un autre terminal)
npm run dev

# Générer les routes Wayfinder
php artisan wayfinder:generate

# Voir toutes les routes
php artisan route:list
```


