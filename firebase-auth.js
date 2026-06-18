// firebase-auth.js — Firebase Auth cloud layer
// Works locally and in production without changing the code.
// If Firebase Auth is not enabled in Firebase Console, calls fail safely
// and the app can continue with the existing fallback logic.

import { app, firebaseConfig } from './firebase-config.js';

// Firebase Auth SDK + instance — lazy initialization
let _authModule = null;
let _auth = null;

async function _getAuth() {
  if (_auth) return _auth;

  _authModule = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  _auth = _authModule.getAuth(app);

  return _auth;
}

// Firebase Auth errors that mean the service is not configured correctly
const _NOT_CONFIGURED = new Set([
  'auth/configuration-not-found',
  'auth/invalid-api-key',
  'auth/app-not-authorized',
  'auth/operation-not-allowed'
]);

function _isMisconfigured(code) {
  return _NOT_CONFIGURED.has(code);
}

function _cleanEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// ── Firebase Auth Sign In ────────────────────────────────────────────────
export async function fbSignIn(email, password) {
  try {
    const auth = await _getAuth();

    const cred = await _authModule.signInWithEmailAndPassword(
      auth,
      _cleanEmail(email),
      password
    );

    return {
      uid: cred.user.uid,
      email: cred.user.email
    };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;

    if (
      e.code === 'auth/user-not-found' ||
      e.code === 'auth/wrong-password' ||
      e.code === 'auth/invalid-credential'
    ) {
      return null;
    }

    console.warn('fbSignIn:', e.code || e.message);
    return null;
  }
}

// ── Firebase Auth Sign Up ────────────────────────────────────────────────
export async function fbSignUp(email, password) {
  try {
    const auth = await _getAuth();

    const cred = await _authModule.createUserWithEmailAndPassword(
      auth,
      _cleanEmail(email),
      password
    );

    return {
      uid: cred.user.uid,
      email: cred.user.email
    };
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;


    if (e.code === 'auth/email-already-in-use') return null;

    console.warn('fbSignUp:', e.code || e.message);
    return null;
  }
}

// ── Send Password Reset Email ────────────────────────────────────────────
export async function fbSendPasswordReset(email) {
  try {
    const cleanEmail = _cleanEmail(email);

    if (!cleanEmail) {
      return {
        success: false,
        reason: 'missing-email',
        message: 'Email address is required.'
      };
    }

    const auth = await _getAuth();

    await _authModule.sendPasswordResetEmail(
      auth,
      cleanEmail,
      {
        url: 'https://strandprous.com/strandpro.html',
        handleCodeInApp: false
      }
    );

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (e) {
    if (_isMisconfigured(e.code)) {
      return {
        success: false,
        reason: 'firebase-auth-not-configured',
        message: 'Firebase Authentication is not configured.'
      };
    }

    if (e.code === 'auth/user-not-found') {
      return {
        success: false,
        reason: 'user-not-found',
        message: 'No account was found with this email address.'
      };
    }

    if (e.code === 'auth/invalid-email') {
      return {
        success: false,
        reason: 'invalid-email',
        message: 'Please enter a valid email address.'
      };
    }

    if (e.code === 'auth/missing-email') {
      return {
        success: false,
        reason: 'missing-email',
        message: 'Email address is required.'
      };
    }

    console.warn('fbSendPasswordReset:', e.code || e.message);

    return {
      success: false,
      reason: 'unknown-error',
      message: 'Unable to send the reset email. Please try again.'
    };
  }
}

// ── Firebase Auth Sign Out ───────────────────────────────────────────────
export async function fbSignOut() {
  try {
    if (!_auth || !_authModule) return;
    await _authModule.signOut(_auth);
  } catch {
    // ignore
  }
}

// ── Listen to Firebase Auth State ────────────────────────────────────────
export async function fbOnAuthChange(callback) {
  try {
    const auth = await _getAuth();
    return _authModule.onAuthStateChanged(auth, callback);
  } catch {
    return () => {};
  }
}

// ── Get Current Firebase User ────────────────────────────────────────────
export function fbGetCurrentUser() {
  return _auth?.currentUser || null;
}

// ── Create Staff Account Without Disconnecting Owner ─────────────────────
// Uses a temporary secondary Firebase app to avoid auto-login
export async function fbCreateStaffAccount(email, password) {
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const authMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');

    const secondaryApp = appMod.initializeApp(
      firebaseConfig,
      `staff-${Date.now()}`
    );

    const secondaryAuth = authMod.getAuth(secondaryApp);

    try {
      const cred = await authMod.createUserWithEmailAndPassword(
        secondaryAuth,
        _cleanEmail(email),
        password
      );

      return {
        uid: cred.user.uid,
        email: cred.user.email
      };
    } finally {
      await appMod.deleteApp(secondaryApp).catch(() => {});
    }
  } catch (e) {
    if (_isMisconfigured(e.code)) return null;

    if (e.code === 'auth/email-already-in-use') {
      return { alreadyExists: true };
    }

    console.warn('fbCreateStaffAccount:', e.code || e.message);
    return null;
  }
}

// ── Expose globally for strandpro.html ───────────────────────────────────
window.fbSignIn = fbSignIn;
window.fbSignUp = fbSignUp;
window.fbSignOut = fbSignOut;
window.fbOnAuthChange = fbOnAuthChange;
window.fbGetCurrentUser = fbGetCurrentUser;
window.fbCreateStaffAccount = fbCreateStaffAccount;
window.fbSendPasswordReset = fbSendPasswordReset;
