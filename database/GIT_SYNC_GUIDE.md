# Guide de synchronisation Git sur Hostinger

## Problème
Vous avez cloné votre dépôt GitHub sur Hostinger, mais `git status` montre beaucoup de fichiers modifiés. Vous voulez savoir si tous les commits ont été récupérés.

## Diagnostic

### Étape 1: Vérifier l'état actuel
```bash
# Voir les derniers commits locaux
git log --oneline -10

# Voir les derniers commits sur GitHub
git fetch origin
git log origin/main --oneline -10

# Comparer les deux
git log HEAD..origin/main --oneline
```

### Étape 2: Comprendre les fichiers modifiés
Les fichiers modifiés peuvent être dus à :
- **Fichiers de configuration spécifiques à Hostinger** (`.htaccess`, `.user.ini`)
- **Fichiers générés** (`bootstrap/cache/`, `storage/`)
- **Fichiers de build** (`public/build.zip`)
- **Modifications manuelles** faites directement sur le serveur

## Solutions

### Solution 1: Récupérer les dernières modifications (Recommandé)
Si vous voulez récupérer les commits de GitHub sans perdre vos modifications locales :

```bash
# Sauvegarder vos modifications locales
git stash push -m "Sauvegarde avant pull"

# Récupérer les modifications de GitHub
git pull origin main

# Restaurer vos modifications locales si nécessaire
git stash pop
```

### Solution 2: Forcer la synchronisation (ATTENTION)
Si vous voulez que votre dépôt local soit identique à GitHub (supprime les modifications locales) :

```bash
# Récupérer les dernières informations
git fetch origin

# Forcer la synchronisation
git reset --hard origin/main

# Nettoyer les fichiers non suivis (optionnel)
git clean -fd
```

### Solution 3: Ignorer les fichiers modifiés spécifiques
Si certains fichiers doivent rester modifiés localement (comme `.htaccess`), ajoutez-les au `.gitignore` ou utilisez :

```bash
# Ignorer les modifications d'un fichier spécifique
git update-index --assume-unchanged .htaccess
git update-index --assume-unchanged .user.ini
```

## Scripts fournis

### 1. `database/check_git_sync.sh`
Script de diagnostic pour vérifier l'état de synchronisation :
```bash
bash database/check_git_sync.sh
```

### 2. `database/sync_from_github.sh`
Script interactif pour synchroniser avec GitHub :
```bash
bash database/sync_from_github.sh
```

## Vérification après synchronisation

```bash
# Vérifier que vous êtes à jour
git status

# Vérifier les derniers commits
git log --oneline -5

# Vérifier qu'il n'y a plus de différences
git log HEAD..origin/main --oneline
# (Ne doit rien retourner si vous êtes à jour)
```

## Fichiers à surveiller

Ces fichiers sont souvent modifiés localement et ne doivent généralement pas être commités :
- `.htaccess` (configuration Apache)
- `.user.ini` (configuration PHP)
- `bootstrap/cache/*` (cache Laravel)
- `storage/*` (fichiers de stockage)
- `public/build.zip` (fichiers de build)

## Recommandation

1. **Exécutez d'abord le script de diagnostic** : `bash database/check_git_sync.sh`
2. **Décidez si vous voulez garder vos modifications locales**
3. **Utilisez le script de synchronisation** : `bash database/sync_from_github.sh`
4. **Vérifiez que tout fonctionne** après la synchronisation
