# Déploiement sur Hostinger - Guide de dépannage

## Problème 403 Forbidden - Solutions

### 1. Fichier .htaccess corrigé
Le fichier `.htaccess` a été modifié pour résoudre le 403 Forbidden :

- **DirectoryIndex** : Définit `strandprotx.html` comme page par défaut
- **SPA Routing** : Redirige toutes les requêtes vers `strandprotx.html`
- **HTTPS Redirection** : Désactivée temporairement pour le déploiement initial

### 2. Étapes de déploiement sur Hostinger

1. **Télécharger les fichiers**
   - Uploadez tous les fichiers dans le dossier `public_html` ou votre sous-dossier
   - **N'incluez pas** le dossier `node_modules`

2. **Permissions des fichiers**
   - Dossiers : 755
   - Fichiers : 644
   - `.htaccess` : 644

3. **Fichiers requis**
   - `index.html` (page principale)
   - `.htaccess` (configuration serveur)
   - `sw.js` (service worker)
   - `manifest.json` et `manifest.webmanifest`
   - Tous les fichiers JS et CSS
   - Dossier `icons/` avec les icônes PWA

### 3. Vérifications après déploiement

1. **Test d'accès**
   ```
   https://votredomaine.com/
   ```

2. **Vérifier la console** pour les erreurs 404 ou CSP

3. **Tester le PWA** sur mobile

### 4. Si le problème persiste

1. **Désactiver temporairement .htaccess**
   - Renommez `.htaccess` en `.htaccess.bak`
   - Testez l'accès direct à `index.html`

2. **Vérifier les logs Hostinger**
   - Panneau Hostinger > Gestionnaire de fichiers > Logs

3. **Contacter le support Hostinger**
   - Mentionner que c'est une PWA (Progressive Web App)
   - Demander si les modules Apache nécessaires sont activés

### 5. Configuration HTTPS (après déploiement réussi)

Une fois que le site fonctionne :
1. Activez la redirection HTTPS dans `.htaccess`
2. Mettez à jour les URLs dans `manifest.json`

## Notes importantes

- L'application utilise `index.html` comme point d'entrée principal
- Le routing est géré côté client (SPA)
- Les données sont stockées localement (localStorage)
- Pas de backend requis pour le fonctionnement de base
