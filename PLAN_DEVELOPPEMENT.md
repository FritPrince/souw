# Plan de Développement - SouwTravel App

## ✅ État Actuel du Projet

### Fonctionnalités Implémentées

#### Backend (Laravel)
- ✅ **Modèles et Migrations** : Tous les modèles sont créés (User, Service, Order, Payment, Appointment, Tourism, etc.)
- ✅ **Contrôleurs** : Tous les contrôleurs publics et admin sont implémentés
- ✅ **Services** : PaymentService, AppointmentService, etc.
- ✅ **Notifications** : Système de notifications email configuré
- ✅ **Intégration Paiement** : Kkiapay intégré avec callbacks
- ✅ **Authentification** : Fortify configuré avec 2FA
- ✅ **Routes** : Toutes les routes sont définies

#### Frontend (React + Inertia)
- ✅ **Pages Publiques** :
  - Home.tsx
  - Services/Index.tsx, Show.tsx
  - Destinations/Index.tsx, Show.tsx
  - Tourism/Index.tsx, Show.tsx, MyBookings.tsx
- ✅ **Pages Authentifiées** :
  - Orders/Index.tsx, Show.tsx
  - Appointments/Index.tsx, Show.tsx
  - Payments/Index.tsx, Process.tsx, Success.tsx, Failed.tsx
  - dashboard.tsx
- ✅ **Pages Admin** :
  - Admin/Testimonials/Index.tsx, Create.tsx, Edit.tsx
  - Admin/Settings/CompanyInfo.tsx
- ✅ **Pages Auth** : login, register, forgot-password, etc.
- ✅ **Pages Settings** : profile, password, two-factor, appearance

#### Documentation
- ✅ ASSETS_MIGRATION.md
- ✅ KKIAPAY_INTEGRATION.md
- ✅ NOTIFICATIONS_SETUP.md
- ✅ ROUTES_VISUALISATION.md

---

## 🚧 Ce Qui Reste À Faire

### 1. Pages Admin Manquantes (Priorité HAUTE)

#### 1.1 Dashboard Admin
- [x] **Admin/Dashboard.tsx** ✅
  - Afficher les statistiques (commandes, revenus, rendez-vous)
  - Graphiques de revenus
  - Liste des commandes récentes
  - Liste des rendez-vous à venir
  - Services les plus demandés

#### 1.2 Gestion des Catégories
- [x] **Admin/Categories/Index.tsx** ✅
  - Liste des catégories avec filtres
  - Actions : créer, éditer, supprimer
- [x] **Admin/Categories/Create.tsx** ✅
  - Formulaire de création de catégorie
- [x] **Admin/Categories/Edit.tsx** ✅
  - Formulaire d'édition de catégorie

#### 1.3 Gestion des Services
- [ ] **Admin/Services/Index.tsx**
  - Liste des services avec filtres
  - Actions : créer, éditer, supprimer, toggle status
- [ ] **Admin/Services/Create.tsx**
  - Formulaire de création de service
  - Gestion des sous-services
  - Gestion des documents requis
  - Gestion des temps de traitement
- [ ] **Admin/Services/Edit.tsx**
  - Formulaire d'édition de service
  - Même fonctionnalités que Create

#### 1.4 Gestion des Destinations
- [ ] **Admin/Destinations/Index.tsx**
  - Liste des destinations avec filtres
  - Actions : créer, éditer, supprimer
- [ ] **Admin/Destinations/Create.tsx**
  - Formulaire de création de destination
- [ ] **Admin/Destinations/Edit.tsx**
  - Formulaire d'édition de destination

#### 1.5 Gestion des Commandes
- [ ] **Admin/Orders/Index.tsx**
  - Liste des commandes avec filtres (statut, date, service)
  - Actions : voir détails, changer statut
- [ ] **Admin/Orders/Show.tsx**
  - Détails de la commande
  - Historique des statuts
  - Notes internes
  - Documents uploadés
  - Actions : changer statut, ajouter note

#### 1.6 Gestion des Rendez-vous
- [ ] **Admin/Appointments/Index.tsx**
  - Liste des rendez-vous avec filtres
  - Calendrier des créneaux
  - Actions : créer créneau, confirmer, annuler
- [ ] **Admin/Appointments/Slots.tsx** (optionnel)
  - Gestion des créneaux disponibles
  - Création/édition de créneaux

#### 1.7 Gestion du Tourisme
- [ ] **Admin/Tourism/Index.tsx**
  - Liste des packages tourisme
  - Actions : créer, éditer, supprimer
- [ ] **Admin/Tourism/Packages/Create.tsx**
  - Formulaire de création de package
  - Gestion des sites touristiques
  - Gestion des prix et durées
- [ ] **Admin/Tourism/Packages/Edit.tsx**
  - Formulaire d'édition de package
- [ ] **Admin/Tourism/Bookings.tsx**
  - Liste des réservations tourisme
  - Filtres et actions

---

### 2. Améliorations Frontend (Priorité MOYENNE)

#### 2.1 Composants Réutilisables
- [ ] Créer des composants UI réutilisables pour les formulaires admin
- [ ] Créer un composant DataTable réutilisable
- [ ] Créer un composant Modal réutilisable
- [ ] Créer un composant FileUpload réutilisable

#### 2.2 Layout Admin
- [x] Créer un layout moderne admin avec sidebar ✅
- [x] Navigation admin avec liens vers toutes les sections ✅
- [x] Header admin avec notifications (nouvelle commande, nouveau paiement, nouveau inscrit) et profil utilisateur ✅
- [x] react-toastify placé à tous les niveaux importants ✅

#### 2.3 Améliorations UX
- [x] Ajouter des états de chargement (skeletons) ✅
- [x] Améliorer les messages d'erreur ✅
- [x] Ajouter des confirmations pour actions destructives ✅
- [x] Améliorer la responsivité mobile ✅

---

### 3. Fonctionnalités Manquantes (Priorité MOYENNE)

#### 3.1 Gestion des Documents
- [ ] Interface pour télécharger les documents des commandes
- [ ] Validation des documents
- [ ] Notifications quand documents requis

#### 3.2 Rappels Automatiques
- [x] Commandes cron pour rappels de rendez-vous ✅
- [x] Notifications WhatsApp (si configuré) ✅
- [x] Emails de rappel automatiques ✅

#### 3.3 Rapports et Statistiques
- [x] Page de rapports admin ✅
- [x] Export Excel/PDF des commandes (structure prête, nécessite packages) ✅
- [x] Graphiques de revenus (recharts) ✅
- [x] Statistiques par période ✅

---

### 4. Tests (Priorité HAUTE)

#### 4.1 Tests Backend
- [ ] Tests unitaires pour les modèles
- [ ] Tests feature pour les contrôleurs
- [ ] Tests pour les services (PaymentService, AppointmentService)
- [ ] Tests pour les jobs et événements

#### 4.2 Tests Frontend
- [ ] Tests pour les composants React (optionnel, avec Vitest)
- [ ] Tests E2E (optionnel, avec Playwright)

---

### 5. Optimisations (Priorité BASSE)

#### 5.1 Performance
- [ ] Optimiser les requêtes N+1
- [ ] Ajouter du cache pour les données fréquemment consultées
- [ ] Optimiser les images (compression, lazy loading)
- [ ] Code splitting pour les pages admin

#### 5.2 SEO
- [ ] Meta tags dynamiques
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Open Graph tags

---

### 6. Sécurité (Priorité HAUTE)

#### 6.1 Vérifications
- [ ] Vérifier les permissions sur toutes les routes admin
- [ ] Vérifier la validation des formulaires
- [ ] Vérifier la protection CSRF
- [ ] Vérifier la sanitization des inputs

#### 6.2 Améliorations
- [ ] Rate limiting sur les routes sensibles
- [ ] Logs d'audit pour actions admin
- [ ] Vérification des uploads de fichiers

---

### 7. Documentation (Priorité BASSE)

#### 7.1 Documentation Utilisateur
- [ ] Guide d'utilisation pour les admins
- [ ] Guide pour les clients
- [ ] FAQ

#### 7.2 Documentation Technique
- [ ] README.md complet
- [ ] Documentation de l'API (si nécessaire)
- [ ] Guide de déploiement

---

## 📋 Ordre de Priorité Recommandé

### Phase 1 : Pages Admin Essentielles (1-2 semaines)
1. Admin/Dashboard.tsx
2. Admin/Orders/Index.tsx et Show.tsx
3. Admin/Appointments/Index.tsx
4. Admin/Services/Index.tsx, Create.tsx, Edit.tsx

### Phase 2 : Pages Admin Complémentaires (1 semaine)
5. Admin/Categories/Index.tsx, Create.tsx, Edit.tsx
6. Admin/Destinations/Index.tsx, Create.tsx, Edit.tsx
7. Admin/Tourism/Index.tsx, Packages/Create.tsx, Edit.tsx, Bookings.tsx

### Phase 3 : Tests et Sécurité (1 semaine)
8. Tests backend
9. Vérifications de sécurité
10. Optimisations de performance

### Phase 4 : Améliorations UX (1 semaine)
11. Layout admin avec sidebar
12. Composants réutilisables
13. Améliorations UX

---

## 🐛 Erreurs Corrigées

### Routes
- ✅ **routes/web.php** : Suppression des routes dupliquées (lignes 145-178)
- ✅ **routes/web.php** : Suppression de l'import inutile `HomeController as ControllersHomeController`
- ✅ **routes/web.php** : Suppression du callback payment dupliqué

### Contrôleurs
- ✅ **DestinationController.php** : Suppression de l'accolade fermante en trop (ligne 42)
- ✅ **AppointmentController.php** : Suppression du code dupliqué (lignes 114-127)
- ✅ **AdminDestinationController.php** : Suppression de l'accolade fermante en trop (ligne 79)

### Modèles
- ✅ **Payment.php** : Suppression de l'accolade fermante en trop (ligne 44)
- ✅ **Appointment.php** : Suppression de l'accolade fermante en trop (ligne 54)

### Form Requests
- ✅ **InitiatePaymentRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **StoreOrderRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **BookAppointmentRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **StoreCategoryRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **StoreServiceRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **UpdateOrderStatusRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **CreateAppointmentSlotRequest.php** : Suppression de la ligne vide avant `<?php`
- ✅ **UploadDocumentsRequest.php** : Suppression de la ligne vide avant `<?php`

### Résultat
- ✅ **Wayfinder** : La commande `php artisan wayfinder:generate --with-form` fonctionne maintenant correctement
- ✅ **Linting** : Aucune erreur de syntaxe PHP restante

---

## 📝 Notes

- Le projet utilise Laravel 12, Inertia v2, React 19, Tailwind CSS v4
- Tous les contrôleurs backend sont implémentés
- La plupart des pages publiques sont implémentées
- Les pages admin sont la principale partie manquante
- Le système de paiement Kkiapay est intégré
- Les notifications email sont configurées

---

## 🎯 Objectif Final

Avoir une application complète et fonctionnelle avec :
- Interface publique complète ✅
- Interface admin complète ⏳
- Tests complets ⏳
- Documentation complète ⏳
- Optimisations de performance ⏳


Catégorie dédiée : ajouter un groupe SERVICES ÉTENDUS (ou équivalent dans ServiceStructureSeeder), ou insérer ces offres dans la catégorie la plus pertinente (Séjour & Logistique, Accompagnement).
Seeds : compléter ExampleServicesSeeder avec un service par item manquant :
Réservation d’hôtel (avec options : type d’hébergement, ville, budget, dates)
Achat billet d’avion (trajet, classe, bagages)
Envoi de colis (destination, poids, type de contenu)
Placement de personnel (type de service, durée)
Location logement/voiture (type de bien, ville, durée, dépôt éventuel)
Accompagnement d’étrangers (programme d’accueil, durée, options transport/guide)
Documenter pour chaque service :
Formulaire attendu côté client (champs spécifiques)
Règles de prix (forfait, ajout par option)
Besoin ou non de rendez-vous (flag requires_appointment)
Documents requis (table required_documents)
Scripts email & notifications (templates spécifiques)



Définir les formulaires côté client
Pour chaque service, créer une page (ou un composant de formulaire) qui récupère la configuration du service (/api/services/{service}/required-documents, /processing-times, etc.).
Ajouter dans resources/js/pages/Services/Show.tsx une section conditionnelle selon le slug pour afficher :
Champs personnalisés (dates, destinations, options)
Messages d’accompagnement (ex : “Ce service requiert un rendez-vous”)
S’assurer que la requête POST /orders envoie bien les informations spécifiques (utiliser meta ou additional_data sur la commande).
3. Workflow de commande et paiement
Vérifier que la commande (OrderController@store) supporte les services à prix flexible : certains peuvent avoir des options (ex. location voiture => tarif journalier). Mettre à jour les calculs si nécessaire.
Ajouter des événements/services pour envoyer les emails de confirmation adaptés (texte spécifique, documents requis). Possiblement créer des templates Blade dédiés ou enrichir les existants avec des sections conditionnelles.
4. Suivi côté admin
Étendre les écrans admin :
Admin/Services pour inclure ces nouveaux services (filtres par catégorie, activation/désactivation)
Admin/Orders/Show : afficher les détails spécifiques (options choisies, documents client, informations additionnelles).

Mettre à jour les exports/rapports si besoin (ces services doivent apparaître dans les stats, graphiques de revenus, etc.).
5. Notifications & rendez-vous
Certains services nécessitent un rendez-vous (ex. accompagnement) :
Configurer requires_appointment = true pour ces services.
Vérifier que le flux de réservation de rendez-vous (appointments) est compatible (ex. services multi-jour).
Mettre à jour les notifications admin et client (WhatsApp/Email) pour intégrer les détails spécifiques.