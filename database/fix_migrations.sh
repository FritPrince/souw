#!/bin/bash
# Script pour corriger les migrations sur Hostinger
# Usage: bash fix_migrations.sh

echo "=== Diagnostic des migrations ==="

# Vérifier si la table migrations existe et son contenu
echo "1. Vérification de la table migrations..."
php artisan migrate:status

echo ""
echo "2. Vérification des fichiers de migration..."
ls -la database/migrations/ | grep -E "service_images|2025_12"

echo ""
echo "=== Solutions possibles ==="
echo ""
echo "Option 1: Si la table service_images n'existe pas mais est marquée comme migrée"
echo "  -> Supprimer l'entrée de la table migrations:"
echo "     DELETE FROM migrations WHERE migration = '2025_12_01_120000_create_service_images_table';"
echo "  -> Puis relancer: php artisan migrate"
echo ""
echo "Option 2: Forcer la migration même si elle est marquée comme exécutée"
echo "  -> php artisan migrate --force"
echo ""
echo "Option 3: Réinitialiser complètement (ATTENTION: supprime toutes les données)"
echo "  -> php artisan migrate:fresh"
echo ""
echo "Option 4: Vérifier manuellement si la table existe"
echo "  -> php artisan tinker"
echo "  -> Schema::hasTable('service_images')"
echo ""

