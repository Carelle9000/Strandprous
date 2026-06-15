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

// Importer les modules Firebase nécessaires
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFunctions, connectFunctionsEmulator } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
});

// Initialiser Cloud Functions
const functions = getFunctions(app);

// En développement local, décommenter pour tester sur l'émulateur :
// connectFunctionsEmulator(functions, 'localhost', 5001);

// Exporter les instances pour utilisation globale
window.firebaseDB = db;
window.firebaseFunctions = functions;

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
export { db, app, firebaseConfig };
