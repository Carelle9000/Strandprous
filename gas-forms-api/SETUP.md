# StrandPro — Google Forms API Setup

## Déploiement en 5 étapes

### 1. Ouvrir Google Apps Script
Allez sur [script.google.com](https://script.google.com) et connectez-vous avec le **compte Google SuperAdmin**.

### 2. Créer un nouveau projet
- Cliquez **"Nouveau projet"**
- Nommez-le `StrandPro Forms API`
- Supprimez le code par défaut dans `Code.gs`

### 3. Coller le code
Copiez tout le contenu du fichier `Code.gs` (ce dossier) et collez-le dans l'éditeur.

### 4. Déployer comme Web App
1. Cliquez **"Déployer"** → **"Nouveau déploiement"**
2. Type : **Web app**
3. Description : `StrandPro API v1`
4. Exécuter en tant que : **Moi** (votre compte Google)
5. Qui a accès : **Tout le monde** (sans compte Google)
6. Cliquez **"Déployer"**
7. Autorisez les permissions demandées (Drive, Forms, Sheets)
8. Copiez l'**URL de déploiement** (format : `https://script.google.com/macros/s/XXXXXX/exec`)

### 5. Configurer dans StrandPro
- Dans le dashboard SuperAdmin → Tab **🔗 G. Forms**
- Collez l'URL dans le champ **"URL de l'API"**
- Cliquez **"🔌 Tester"** pour vérifier la connexion
- Cliquez **"💾 Sauvegarder"**

---

## Utilisation

Pour chaque owner dans l'onglet **G. Forms** :
1. Cliquez **🪄** (icône baguette magique)
2. Vérifiez le nom du salon et l'email
3. Ajustez les services si besoin
4. Cliquez **"🚀 Lancer la création"**
5. Autorisez la popup si le navigateur la bloque
6. Le formulaire est créé et les URLs sont sauvegardées automatiquement

---

## Ce que crée le script

- **Un Google Form** avec les champs :
  - Prénom et Nom
  - Téléphone / WhatsApp
  - Service souhaité (liste déroulante)
  - Date souhaitée
  - Heure souhaitée (créneaux de 30 min)
  - Notes complémentaires

- **Une Google Sheet** liée pour stocker les réponses
  - Accessible en lecture publique (pour la sync CSV dans StrandPro)
  - Partagée en édition avec l'email du owner

---

## Résolution de problèmes

| Problème | Solution |
|----------|----------|
| Popup bloquée | Autorisez les popups pour ce site dans les paramètres du navigateur |
| Erreur "Permission denied" | Ré-autorisez les permissions dans GAS (Déployer > Gérer les déploiements) |
| Formulaire créé mais URLs non sauvées | Réessayez — vérifiez que Firebase est connecté |
| Le owner ne reçoit pas le partage | Vérifiez que l'email dans son profil est correct |
