-- Script pour vérifier l'état des migrations sur Hostinger
-- À exécuter via SSH : mysql -u votre_user -p votre_database < check_migrations.sql

-- 1. Vérifier si la table migrations existe
SELECT 'Table migrations exists:' as info;
SELECT COUNT(*) as count FROM migrations;

-- 2. Lister toutes les migrations enregistrées
SELECT 'Migrations enregistrées:' as info;
SELECT * FROM migrations ORDER BY id DESC LIMIT 20;

-- 3. Vérifier si la table service_images existe
SELECT 'Table service_images exists:' as info;
SELECT COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'service_images';

-- 4. Lister toutes les tables de la base de données
SELECT 'Toutes les tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

