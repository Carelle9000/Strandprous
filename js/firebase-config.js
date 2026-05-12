// Firebase Configuration
// Configuration pour le projet StrandPro
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
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
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
