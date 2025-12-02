#!/bin/bash

# Script pour vérifier la synchronisation Git sur Hostinger

echo "=== Vérification de la synchronisation Git ==="
echo ""

# 1. Vérifier la branche actuelle
echo "1. Branche actuelle:"
git branch --show-current
echo ""

# 2. Vérifier le dernier commit local
echo "2. Dernier commit local:"
git log -1 --oneline
echo ""

# 3. Récupérer les dernières modifications du remote
echo "3. Récupération des dernières modifications..."
git fetch origin
echo ""

# 4. Vérifier le dernier commit sur origin/main
echo "4. Dernier commit sur origin/main:"
git log origin/main -1 --oneline
echo ""

# 5. Vérifier s'il y a des commits en avance sur le remote
echo "5. Commits locaux non poussés:"
git log origin/main..HEAD --oneline
if [ $? -eq 0 ] && [ -n "$(git log origin/main..HEAD --oneline)" ]; then
    echo "   Il y a des commits locaux non poussés"
else
    echo "   Aucun commit local en avance"
fi
echo ""

# 6. Vérifier s'il y a des commits sur le remote non récupérés
echo "6. Commits sur origin/main non récupérés:"
git log HEAD..origin/main --oneline
if [ $? -eq 0 ] && [ -n "$(git log HEAD..origin/main --oneline)" ]; then
    echo "   Il y a des commits sur GitHub non récupérés"
    echo "   Exécutez: git pull origin main"
else
    echo "   Vous êtes à jour avec origin/main"
fi
echo ""

# 7. Compter les fichiers modifiés
echo "7. Fichiers modifiés:"
git status --short | wc -l | xargs echo "   Nombre de fichiers modifiés:"
echo ""

echo "=== Recommandations ==="
echo ""
echo "Si vous voulez récupérer toutes les modifications de GitHub:"
echo "  git pull origin main"
echo ""
echo "Si vous voulez forcer la synchronisation (ATTENTION: supprime les modifications locales):"
echo "  git fetch origin"
echo "  git reset --hard origin/main"
echo ""
echo "Si vous voulez sauvegarder vos modifications locales avant de synchroniser:"
echo "  git stash"
echo "  git pull origin main"
echo "  git stash pop"
