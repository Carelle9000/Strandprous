// firebase-auth.js — Firebase Auth cloud layer
// Fonctionne en local ET en production sans changer le code.
// Si Firebase Auth n'est pas activé dans la console → les appels échouent silencieusement
// et l'app continue avec l'auth localStorage + Firestore pw.

import { app, firebaseConfig } from './firebase-config.js';

// Firebase Auth SDK + instance — initialisés de façon lazy pour éviter
// que getAuth() appelle getProjectConfig au démarrage même quand
// Firebase Authentication n'est pas activé dans la Console.
let _authModule = null;
let _auth = null;

async function _getAuth() {
  if (_auth) return _auth;
  _authModule = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  _auth = _authModule.getAuth(app);
  return _auth;
}

// Codes d'erreur Firebase Auth indiquant que le service n'est pas configuré
const _NOT_CONFIGURED = new Set([
  'auth/configuration-not-found',
  'auth/invalid-api-key',
  'auth/app-not-authorized',
  'auth/operation-not-allowed'
]);

function _isMisconfigured(code) {
  return _NOT_CONFIGURED.has(code);
}

// ── Connexion Firebase Auth ────────────────────────────────────────────────
export async function fbSignIn(email, password) {
  try {
    const auth = await _getAuth();
    const cred = await _authModule.signInWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
      || e.code === 'auth/invalid-credential') return null;
    console.warn('fbSignIn:', e.code);
    return null;
  }
}

// ── Création de compte Firebase Auth ──────────────────────────────────────
export async function fbSignUp(email, password) {
  try {
    const auth = await _getAuth();
    const cred = await _authModule.createUserWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;
    if (e.code === 'auth/email-already-in-use') throw e; // Propager l'erreur pour meilleur message
    console.warn('fbSignUp:', e.code);
    return null;
  }
}

// ── Déconnexion Firebase Auth ─────────────────────────────────────────────
export async function fbSignOut() {
  try {
    if (!_auth) return;
    await _authModule.signOut(_auth);
  } catch { /* ignore */ }
}

// ── Écoute l'état de connexion Firebase Auth ──────────────────────────────
export async function fbOnAuthChange(callback) {
  try {
    const auth = await _getAuth();
    return _authModule.onAuthStateChanged(auth, callback);
  } catch {
    return () => {};
  }
}

// ── Retourne le user Firebase Auth courant (synchrone) ────────────────────
export function fbGetCurrentUser() {
  return _auth?.currentUser || null;
}

// ── Crée un compte staff sans déconnecter le owner courant ────────────────
// Utilise une seconde instance Firebase temporaire pour éviter le sign-in auto
export async function fbCreateStaffAccount(email, password) {
  try {
    const appMod  = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
    const secondaryApp  = appMod.initializeApp(firebaseConfig, `staff-${Date.now()}`);
    const secondaryAuth = authMod.getAuth(secondaryApp);
    try {
      const cred = await authMod.createUserWithEmailAndPassword(secondaryAuth, email, password);
      return { uid: cred.user.uid, email: cred.user.email };
    } finally {
      await appMod.deleteApp(secondaryApp).catch(() => {});
    }
  } catch(e) {
    if (_isMisconfigured(e.code)) return null;
    if (e.code === 'auth/email-already-in-use') return { alreadyExists: true };
    console.warn('fbCreateStaffAccount:', e.code);
    return null;
  }
}

// ── Envoie un email de réinitialisation du mot de passe ──────────────────
// Firebase génère un lien unique et sécurisé (valide 1h)
// L'utilisateur reçoit un email avec un lien de réinitialisation
export async function fbSendPasswordResetEmail(email) {
  try {
    const auth = await _getAuth();
    // sendPasswordResetEmail() envoie un email avec un lien temporaire
    await _authModule.sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;
    // Si l'utilisateur n'existe pas dans Firebase Auth, on ne le signale pas
    // (pour des raisons de sécurité : pas de révélation de quels emails existent)
    if (e.code === 'auth/user-not-found') return null;
    console.warn('fbSendPasswordResetEmail:', e.code);
    return null;
  }
}

// Expose globalement pour strandpro.html
window.fbSignIn                    = fbSignIn;
window.fbSignUp                    = fbSignUp;
window.fbSignOut                   = fbSignOut;
window.fbOnAuthChange              = fbOnAuthChange;
window.fbGetCurrentUser            = fbGetCurrentUser;
window.fbCreateStaffAccount        = fbCreateStaffAccount;
window.fbSendPasswordResetEmail    = fbSendPasswordResetEmail;
