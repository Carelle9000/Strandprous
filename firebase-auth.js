// firebase-auth.js — Firebase Auth cloud layer
// Fonctionne en local ET en production sans changer le code.
// Si Firebase Auth n'est pas activé dans la console → les appels échouent silencieusement
// et l'app continue avec l'auth localStorage + Firestore pw.

import { app } from './firebase-config.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const auth = getAuth(app);

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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null; // Auth non activé → ignore silencieusement
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
      || e.code === 'auth/invalid-credential') return null; // Mauvais credentials
    console.warn('fbSignIn:', e.code);
    return null;
  }
}

// ── Création de compte Firebase Auth ──────────────────────────────────────
export async function fbSignUp(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: cred.user.uid, email: cred.user.email };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;
    if (e.code === 'auth/email-already-in-use') return null; // Déjà existant → pas une erreur
    console.warn('fbSignUp:', e.code);
    return null;
  }
}

// ── Déconnexion Firebase Auth ─────────────────────────────────────────────
export async function fbSignOut() {
  try { await signOut(auth); } catch { /* ignore */ }
}

// ── Écoute l'état de connexion Firebase Auth ──────────────────────────────
// Sert à maintenir la session synchronisée si l'user se connecte via Firebase Auth
export function fbOnAuthChange(callback) {
  try {
    return onAuthStateChanged(auth, callback);
  } catch {
    return () => {};
  }
}

// Expose globalement pour strandpro.html
window.fbSignIn      = fbSignIn;
window.fbSignUp      = fbSignUp;
window.fbSignOut     = fbSignOut;
window.fbOnAuthChange = fbOnAuthChange;
