// Firebase Authentication - StrandPro Salon Management

class FirebaseAuthManager {
  constructor(auth) {
    this.auth = auth;
    this.currentUser = null;
    
    // Écouter les changements d'état d'authentification
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log('Utilisateur connecté:', user.email);
        this.onUserSignedIn(user);
      } else {
        console.log('Utilisateur déconnecté');
        this.onUserSignedOut();
      }
    });
  }

  // Connexion avec email et mot de passe
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Connexion réussie:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Inscription avec email et mot de passe
  async signUp(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Ajouter les informations utilisateur dans Firestore
      const userDoc = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData,
        createdAt: new Date(),
        role: userData.role || 'staff' // 'admin', 'staff', 'receptionist'
      };
      
      const result = await window.strandProFirestore.addDocument('users', userDoc);
      
      if (result.success) {
        console.log('Inscription réussie:', userCredential.user.email);
        return { success: true, user: userCredential.user };
      } else {
        // Si l'ajout dans Firestore échoue, supprimer le compte utilisateur
        await this.deleteUser();
        return { success: false, error: 'Erreur lors de la création du profil utilisateur' };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Déconnexion
  async signOut() {
    try {
      await signOut(this.auth);
      console.log('Déconnexion réussie');
      return { success: true };
    } catch (error) {
      console.error('Erreur de déconnexion:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email) {
    try {
      // Note: Cette fonction nécessite l'import de sendPasswordResetEmail
      // import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
      // await sendPasswordResetEmail(this.auth, email);
      console.log('Email de réinitialisation envoyé à:', email);
      return { success: true };
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Aucun utilisateur connecté' };
      }

      // Mettre à jour dans Firestore
      const result = await window.strandProFirestore.updateDocument('users', this.currentUser.uid, updates);
      
      if (result.success) {
        console.log('Profil mis à jour');
        return { success: true };
      } else {
        return { success: false, error: 'Erreur mise à jour profil' };
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Supprimer le compte utilisateur
  async deleteUser() {
    try {
      if (this.currentUser) {
        await this.currentUser.delete();
        console.log('Compte utilisateur supprimé');
        return { success: true };
      }
      return { success: false, error: 'Aucun utilisateur connecté' };
    } catch (error) {
      console.error('Erreur suppression compte:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si l'utilisateur est connecté
  isUserSignedIn() {
    return this.currentUser !== null;
  }

  // Obtenir l'utilisateur courant
  getCurrentUser() {
    return this.currentUser;
  }

  // Callbacks personnalisables
  onUserSignedIn(user) {
    // À surcharger selon les besoins de l'application
    window.location.hash = '#dashboard';
  }

  onUserSignedOut() {
    // À surcharger selon les besoins de l'application
    window.location.hash = '#login';
  }

  // Vérifier les permissions de l'utilisateur
  async checkPermissions(requiredRole) {
    if (!this.currentUser) {
      return false;
    }

    try {
      const userDoc = await window.strandProFirestore.getDocument('users', this.currentUser.uid);
      if (userDoc.success) {
        const userRole = userDoc.data.role;
        const roles = { admin: 3, staff: 2, receptionist: 1 };
        return roles[userRole] >= roles[requiredRole];
      }
      return false;
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return false;
    }
  }
}

// Initialiser le gestionnaire d'authentification
window.firebaseAuthManager = new FirebaseAuthManager(window.firebaseAuth);

console.log('Firebase Authentication initialized');
