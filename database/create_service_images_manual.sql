-- Script SQL pour créer manuellement la table service_images
-- À exécuter si la migration ne fonctionne pas
-- Usage: mysql -u votre_user -p votre_database < create_service_images_manual.sql

-- Créer la table si elle n'existe pas
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

-- Enregistrer la migration dans la table migrations
-- Vérifier d'abord si elle n'existe pas déjà
INSERT INTO migrations (migration, batch) 
SELECT 
    '2025_12_01_120000_create_service_images_table' as migration,
    COALESCE((SELECT MAX(batch) FROM migrations), 0) + 1 as batch
WHERE NOT EXISTS (
    SELECT 1 FROM migrations 
    WHERE migration = '2025_12_01_120000_create_service_images_table'
);

-- Vérification
SELECT 'Table créée avec succès!' as status;
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'service_images';

SELECT 'Migration enregistrée!' as status;
SELECT COUNT(*) as migration_registered FROM migrations 
WHERE migration = '2025_12_01_120000_create_service_images_table';

