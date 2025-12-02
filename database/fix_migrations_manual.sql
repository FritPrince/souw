-- Script SQL manuel pour corriger le problème de migrations
-- À exécuter via SSH : mysql -u votre_user -p votre_database < fix_migrations_manual.sql

-- ÉTAPE 1: Vérifier si la table service_images existe
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'La table service_images EXISTE déjà'
        ELSE 'La table service_images N''EXISTE PAS'
    END as status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'service_images';

-- ÉTAPE 2: Vérifier si la migration est enregistrée
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'La migration EST enregistrée'
        ELSE 'La migration N''EST PAS enregistrée'
    END as status
FROM migrations 
WHERE migration = '2025_12_01_120000_create_service_images_table';

-- ÉTAPE 3A: Si la table N'EXISTE PAS mais la migration EST enregistrée
-- Supprimer l'entrée incorrecte de la table migrations
-- DÉCOMMENTEZ la ligne suivante si nécessaire:
-- DELETE FROM migrations WHERE migration = '2025_12_01_120000_create_service_images_table';

-- ÉTAPE 3B: Si la table N'EXISTE PAS, créer la table manuellement
-- DÉCOMMENTEZ les lignes suivantes si nécessaire:
/*
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

-- Enregistrer la migration manuellement
INSERT INTO migrations (migration, batch) 
VALUES ('2025_12_01_120000_create_service_images_table', 
        (SELECT COALESCE(MAX(batch), 0) + 1 FROM (SELECT batch FROM migrations) as m))
ON DUPLICATE KEY UPDATE batch = batch;
*/

-- ÉTAPE 4: Vérifier le résultat final
SELECT 'Vérification finale:' as info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'service_images') as table_exists,
    (SELECT COUNT(*) FROM migrations WHERE migration = '2025_12_01_120000_create_service_images_table') as migration_registered;

