// Firebase Configuration
// Remplacez ces valeurs par celles de votre projet Firebase Console
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Importer les modules Firebase nécessaires
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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
