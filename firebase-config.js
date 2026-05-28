// Firebase Configuration
// Remplacez ces valeurs par celles de votre projet Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBaXFVBZym6iaxz8NZ42PMSxHrROBSFWEg",
  authDomain: "strandprous.firebaseapp.com",
  databaseURL: "https://strandprous-default-rtdb.firebaseio.com",
  projectId: "strandprous",
  storageBucket: "strandprous.firebasestorage.app",
  messagingSenderId: "684736633913",
  appId: "1:684736633913:web:92f765b9c58d6a2ed8c1e8",
  measurementId: "G-1X0D38EK1W"
};

// Importer les modules Firebase nécessaires
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
// experimentalAutoDetectLongPolling : bascule automatiquement en long-polling
// si WebChannel est bloqué par un ad blocker (ERR_BLOCKED_BY_CLIENT)
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true
});
const auth = getAuth(app);

// Exporter les instances pour utilisation globale
window.firebaseDB = db;
window.firebaseAuth = auth;

// Structure des collections Firestore
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

console.log('Firebase initialisé avec succès');
export { db, auth };
