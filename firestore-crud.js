// firestore-crud.js
import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const currentUser = () => JSON.parse(localStorage.getItem('sp_session'));

// Helper pour obtenir la collection avec salon ID
function getSalonPath(collectionName) {
    const user = currentUser();
    const salonId = user?.uid || 'demo';
    return `salons/${salonId}/${collectionName}`;
}

// === INVENTORY ===
export const InvAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('inventory'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(item) {
        const ref = item.id ? doc(db, getSalonPath('inventory'), item.id) : doc(collection(db, getSalonPath('inventory')));
        await setDoc(ref, { ...item, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('inventory'), id));
    }
};

// === STAFF ===
export const StaffAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('staff'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(staffMember) {
        const ref = staffMember.id ? doc(db, getSalonPath('staff'), staffMember.id) : doc(collection(db, getSalonPath('staff')));
        await setDoc(ref, { ...staffMember, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('staff'), id));
    }
};

// === APPOINTMENTS ===
export const ApptAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('appointments'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(appt) {
        const ref = appt.id ? doc(db, getSalonPath('appointments'), appt.id) : doc(collection(db, getSalonPath('appointments')));
        await setDoc(ref, { ...appt, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('appointments'), id));
    }
};

// === EXPENSES ===
export const ExpAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('expenses'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(exp) {
        const ref = exp.id ? doc(db, getSalonPath('expenses'), exp.id) : doc(collection(db, getSalonPath('expenses')));
        await setDoc(ref, { ...exp, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('expenses'), id));
    }
};

// === TASKS ===
export const TaskAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('tasks'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(task) {
        const ref = task.id ? doc(db, getSalonPath('tasks'), task.id) : doc(collection(db, getSalonPath('tasks')));
        await setDoc(ref, { ...task, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('tasks'), id));
    }
};

// === ATTENDANCE ===
export const AttAPI = {
    async getAll() {
        const q = collection(db, getSalonPath('attendance'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async save(att) {
        const ref = att.id ? doc(db, getSalonPath('attendance'), att.id) : doc(collection(db, getSalonPath('attendance')));
        await setDoc(ref, { ...att, updatedAt: serverTimestamp() }, { merge: true });
        return ref.id;
    }
};

// Pour les permissions et users (owner)
export const UserAPI = {
    async getAllUsers() {
        const q = collection(db, "users");
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    }
};