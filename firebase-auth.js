// firebase-auth.js
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { db } from './firebase-config.js';
import { doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Hash password (client-side - à améliorer avec Cloud Functions en prod)
const hashPw = (pw) => btoa(pw).slice(0, 32); // Temporaire

export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                localStorage.setItem('sp_session', JSON.stringify({
                    uid: user.uid,
                    username: userData.username,
                    name: userData.name,
                    role: userData.role
                }));
            }
        }
    });
}

export async function doLoginFirebase(emailOrUsername, password) {
    try {
        // Recherche par username (on stocke email aussi)
        const usersSnap = await getDocs(collection(db, "users"));
        let userFound = null;
        
        usersSnap.forEach(doc => {
            const u = doc.data();
            if (u.username === emailOrUsername || u.email === emailOrUsername) {
                userFound = { uid: doc.id, ...u };
            }
        });

        if (!userFound) throw new Error("User not found");

        const userCredential = await signInWithEmailAndPassword(auth, userFound.email, password);
        return userCredential.user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function doSignupFirebase(userData) {
    const { email, password, name, username, businessName, city } = userData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
        username,
        name,
        email,
        role: "owner",
        businessName,
        city,
        createdAt: new Date().toISOString(),
        mustChangePassword: false
    });

    return userCredential.user;
}

export async function doLogoutFirebase() {
    await signOut(auth);
    localStorage.removeItem('sp_session');
}

// Exposer globalement pour strandpro.html
window.initAuth = initAuth;
window.doLoginFirebase = doLoginFirebase;
window.doSignupFirebase = doSignupFirebase;
window.doLogoutFirebase = doLogoutFirebase;