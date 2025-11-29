-- Script SQL pour créer la table feda_pay_configs et insérer les données initiales

-- Supprimer la table si elle existe (pour éviter les conflits)
DROP TABLE IF EXISTS `fedapay_configs`;
DROP TABLE IF EXISTS `feda_pay_configs`;

-- Créer la table avec le bon nom
CREATE TABLE `feda_pay_configs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `public_key_live` VARCHAR(255) NULL,
    `secret_key_live` VARCHAR(255) NULL,
    `public_key_sandbox` VARCHAR(255) NULL,
    `secret_key_sandbox` VARCHAR(255) NULL,
    `is_sandbox` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les données initiales (clés sandbox)
INSERT INTO `feda_pay_configs` 
    (`public_key_sandbox`, `secret_key_sandbox`, `is_sandbox`, `created_at`, `updated_at`)
VALUES 
    ('pk_sandbox_lkJTKsEHbrbXp_ItyhNCBhks', 'sk_sandbox_JBYnyxCIa9823jUrXFx2pu2b', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    `public_key_sandbox` = VALUES(`public_key_sandbox`),
    `secret_key_sandbox` = VALUES(`secret_key_sandbox`),
    `updated_at` = NOW();