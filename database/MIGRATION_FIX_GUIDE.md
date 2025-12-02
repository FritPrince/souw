# Guide de correction des migrations sur Hostinger

## Problème
Laravel indique "Nothing to migrate" alors que des migrations n'ont pas été exécutées (notamment `service_images`).

## Diagnostic

### Étape 1: Vérifier l'état des migrations
```bash
php artisan migrate:status
```

### Étape 2: Vérifier si la table service_images existe
```bash
php artisan tinker
```
Puis dans tinker:
```php
Schema::hasTable('service_images')
DB::table('migrations')->where('migration', 'like', '%service_images%')->get()
```

### Étape 3: Vérifier directement en SQL
Connectez-vous à MySQL:
```bash
mysql -u votre_user -p votre_database
```

Puis exécutez:
```sql
-- Vérifier si la table existe
SHOW TABLES LIKE 'service_images';

-- Vérifier les migrations enregistrées
SELECT * FROM migrations WHERE migration LIKE '%service_images%';

-- Voir toutes les migrations
SELECT migration, batch FROM migrations ORDER BY id DESC LIMIT 10;
```

## Solutions

### Solution 1: Si la table N'EXISTE PAS mais la migration EST enregistrée

Supprimez l'entrée incorrecte:
```sql
DELETE FROM migrations WHERE migration = '2025_12_01_120000_create_service_images_table';
```

Puis relancez:
```bash
php artisan migrate
```

### Solution 2: Si la table N'EXISTE PAS et la migration N'EST PAS enregistrée

Créez la table manuellement:
```sql
CREATE TABLE IF NOT EXISTS service_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT UNSIGNED NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service_id (service_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Puis enregistrez la migration:
```sql
INSERT INTO migrations (migration, batch) 
VALUES ('2025_12_01_120000_create_service_images_table', 
        (SELECT COALESCE(MAX(batch), 0) + 1 FROM migrations));
```

### Solution 3: Forcer la migration (si la table n'existe pas)

```bash
php artisan migrate --force
```

### Solution 4: Réinitialiser complètement (ATTENTION: supprime toutes les données)

```bash
php artisan migrate:fresh
```

## Vérification finale

Après correction, vérifiez:
```bash
php artisan migrate:status
php artisan tinker
# Dans tinker:
Schema::hasTable('service_images')
DB::table('service_images')->count()
```

