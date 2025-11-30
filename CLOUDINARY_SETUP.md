# Configuration Cloudinary

## Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` à la racine du projet :

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dhzibf7tu
VITE_CLOUDINARY_API_KEY=322555364168748
VITE_CLOUDINARY_API_SECRET=QxEJKWoW-rjuiCqUTU-Amos0aHA
VITE_CLOUDINARY_UPLOAD_PRESET=eventlink
```

## Configuration du Upload Preset dans Cloudinary

Pour que l'upload fonctionne sans signature côté serveur, vous devez créer un **Upload Preset** dans Cloudinary :

1. Connectez-vous à votre [Dashboard Cloudinary](https://console.cloudinary.com/)
2. Allez dans **Settings** > **Upload**
3. Faites défiler jusqu'à **Upload presets**
4. Cliquez sur **Add upload preset**
5. Configurez le preset :
   - **Preset name**: `eventlink` (doit correspondre à `VITE_CLOUDINARY_UPLOAD_PRESET`)
   - **Signing mode**: **Unsigned** (important pour l'upload côté client)
   - **Folder**: `categories` (optionnel, pour organiser les images)
   - **Format**: Vous pouvez laisser par défaut ou forcer un format spécifique
6. Sauvegardez le preset

## Important

Le champ `slug` de la catégorie est utilisé pour stocker l'URL Cloudinary de l'image. Assurez-vous que :
- Quand une image est uploadée, l'URL Cloudinary est stockée dans `slug`
- L'affichage de l'image utilise le champ `slug` si c'est une URL valide (commence par `http`)

## Structure des données

- **Avant upload d'image**: `slug` peut contenir un slug normal (ex: "football")
- **Après upload d'image**: `slug` contient l'URL Cloudinary (ex: "https://res.cloudinary.com/...")





