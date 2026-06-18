// firebase-config.js - Firebase Configuration
// Connected to Firebase project: strandprous-b3398

const firebaseConfig = {
  apiKey: "AIzaSyCp15cmyrXpblbvEWvY2Rk6DWxI0_XC1y0",
  authDomain: "strandprous-b3398.firebaseapp.com",
  databaseURL: "https://strandprous-b3398-default-rtdb.firebaseio.com",
  projectId: "strandprous-b3398",
  storageBucket: "strandprous-b3398.firebasestorage.app",
  messagingSenderId: "279144298205",
  appId: "1:279144298205:web:f3a8f05f456402091c8d34",
  measurementId: "G-15WBZ722MX"
};

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';

import {
  initializeFirestore
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});

// Expose Firestore globally
window.firebaseDB = db;
window.db = db; // Alias pour compatibilité avec le code existant
window.firebaseFunctions = functions;
window.httpsCallable = httpsCallable;

// Firestore collections
const COLLECTIONS = {
  USERS: 'users',
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  SERVICES: 'services',
  STAFF: 'staff',
  INVENTORY: 'inventory',
  SETTINGS: 'settings'
};

window.firestoreCollections = COLLECTIONS;

console.log('Firebase initialized successfully:', firebaseConfig.projectId);

export { db, app, firebaseConfig };