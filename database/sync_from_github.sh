#!/bin/bash

# Script pour synchroniser le dépôt Hostinger avec GitHub
# Usage: bash database/sync_from_github.sh

echo "=== Synchronisation avec GitHub ==="
echo ""

# Sauvegarder les modifications locales si nécessaire
if [ -n "$(git status --porcelain)" ]; then
    echo "ATTENTION: Il y a des modifications locales non commitées."
    echo ""
    echo "Options:"
    echo "1. Sauvegarder les modifications (git stash)"
    echo "2. Ignorer les modifications (git reset --hard)"
    echo "3. Annuler"
    echo ""
    read -p "Choisissez une option (1/2/3): " choice
    
    case $choice in
        1)
            echo "Sauvegarde des modifications locales..."
            git stash push -m "Sauvegarde avant synchronisation GitHub $(date +%Y-%m-%d_%H:%M:%S)"
            echo "Modifications sauvegardées dans le stash"
            ;;
        2)
            echo "Suppression des modifications locales..."
            git reset --hard HEAD
            git clean -fd
            echo "Modifications locales supprimées"
            ;;
        3)
            echo "Annulation..."
            exit 0
            ;;
        *)
            echo "Option invalide. Annulation..."
            exit 1
            ;;
    esac
fi

# Récupérer les dernières modifications
echo ""
echo "Récupération des dernières modifications de GitHub..."
git fetch origin

# Vérifier s'il y a des commits à récupérer
if [ -n "$(git log HEAD..origin/main --oneline)" ]; then
    echo ""
    echo "Commits à récupérer:"
    git log HEAD..origin/main --oneline
    echo ""
    read -p "Voulez-vous récupérer ces commits? (o/n): " confirm
    
    if [ "$confirm" = "o" ] || [ "$confirm" = "O" ]; then
        echo "Récupération des commits..."
        git pull origin main
        echo ""
        echo "✓ Synchronisation terminée!"
        echo ""
        echo "Vérification finale:"
        git status
    else
        echo "Annulation..."
    fi
else
    echo "Vous êtes déjà à jour avec origin/main"
fi

echo ""
echo "=== Fin de la synchronisation ==="
