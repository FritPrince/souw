# Migration des Assets - SouwTravel App

## ✅ Migration Effectuée

Les assets du template ont été déplacés vers `storage/app/public/front/` et le lien symbolique a été créé.

## Structure des Assets

```
storage/app/public/front/
├── css/          # Fichiers CSS du template
├── js/           # Fichiers JavaScript du template
├── images/       # Images du template (logo, photos, etc.)
├── fonts/        # Polices de caractères
├── flags/        # Drapeaux des pays
└── video/        # Vidéos
```

## Lien Symbolique

Le lien symbolique a été créé avec la commande :
```bash
php artisan storage:link
```

Cela crée un lien de `public/storage` vers `storage/app/public`, permettant d'accéder aux fichiers via `/storage/`.

## Utilisation dans les Composants

### Chemins Mis à Jour

Les composants suivants ont été mis à jour pour utiliser le nouveau chemin :

- **PublicHeader** : `logo = '/storage/front/images/logo.png'`
- **PublicFooter** : `logo = '/storage/front/images/logo.png'`

### Comment Utiliser les Assets

Dans vos composants React ou pages Inertia, utilisez les chemins suivants :

```tsx
// Images
<img src="/storage/front/images/logo.png" alt="Logo" />
<img src="/storage/front/images/hero-bg.jpg" alt="Hero" />

// CSS (si nécessaire dans des balises <link>)
<link rel="stylesheet" href="/storage/front/css/style.css" />

// JavaScript (si nécessaire)
<script src="/storage/front/js/main.js"></script>

// Fonts
<link rel="stylesheet" href="/storage/front/fonts/font.css" />

// Flags
<img src="/storage/front/flags/us.svg" alt="USA" />
```

## Exemple d'Utilisation dans un Composant

```tsx
import { Head } from '@inertiajs/react';

export default function MyPage() {
    return (
        <>
            <Head>
                <link rel="stylesheet" href="/storage/front/css/custom.css" />
            </Head>
            <div>
                <img 
                    src="/storage/front/images/hero.jpg" 
                    alt="Hero Image" 
                />
            </div>
        </>
    );
}
```

## Vérification

Pour vérifier que les assets sont accessibles :

1. Vérifiez que le lien symbolique existe :
   ```bash
   ls -la public/storage
   # ou sur Windows
   dir public\storage
   ```

2. Testez l'accès via le navigateur :
   - `http://localhost:8000/storage/front/images/logo.png`
   - `http://localhost:8000/storage/front/css/style.css`

## Notes Importantes

1. **Production** : Assurez-vous que le lien symbolique est créé sur le serveur de production également :
   ```bash
   php artisan storage:link
   ```

2. **Permissions** : Sur Linux/Mac, assurez-vous que les permissions sont correctes :
   ```bash
   chmod -R 775 storage
   chown -R www-data:www-data storage
   ```

3. **Gitignore** : Les fichiers dans `storage/app/public/` ne sont généralement pas versionnés. Si vous voulez versionner les assets du template, vous pouvez :
   - Les garder dans `resources/views/front/` (comme actuellement)
   - Ou créer un script de déploiement qui les copie vers `storage/app/public/front/`

4. **Optimisation** : Pour la production, considérez :
   - Minifier les CSS et JS
   - Optimiser les images
   - Utiliser un CDN pour les assets statiques

## Commandes Utiles

```bash
# Recréer le lien symbolique
php artisan storage:link

# Vérifier les permissions (Linux/Mac)
ls -la public/storage

# Lister les fichiers dans storage
ls -R storage/app/public/front/
```

