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
// Pour les owners : salons/{ownerUsername}/...
// Pour le staff d'un owner Yearly : salons/{ownerUsername}/... (via salonId dans la session)
function getSalonPath(collectionName) {
    const user = currentUser();
    const salonId = user?.salonId || user?.username || user?.uid || 'demo';
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
    },

    async delete(id) {
        await deleteDoc(doc(db, getSalonPath('attendance'), id));
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

// ── SALON REGISTRY (SuperAdmin) ──
// Chaque owner sync son document dans salons/{username}
// Le SuperAdmin lit toute la collection salons/
export const SalonRegistryAPI = {

    // Appelé au login/signup de chaque owner pour maintenir le registre à jour
    async syncSalon(data) {
        if (!data?.username) return;
        const ref = doc(db, 'salons', data.username);
        const existing = await getDoc(ref);
        const base = existing.exists() ? existing.data() : {
            createdAt:    data.createdAt || serverTimestamp(),
            featureFlags: {
                inventory:    true,
                staff:        true,
                appointments: true,
                revenue:      true,
                expenses:     true,
                googleForm:   true,
                permissions:  true
            }
        };
        await setDoc(ref, {
            ...base,
            username:     data.username,
            businessName: data.businessName || '',
            city:         data.city         || '',
            email:        data.email        || '',
            plan:         data.plan         || null,
            status:       data.status       || 'trial',
            trialStart:   data.trialStart   || base.trialStart || null,
            expiry:       data.expiry       || base.expiry     || null,
            suspended:    base.suspended    ?? false,
            featureFlags: base.featureFlags,
            lastSeen:     serverTimestamp()
        }, { merge: true });
    },

    // Lire la config d'un seul owner (feature flags, suspension…)
    async getSalon(username) {
        if (!username) return null;
        const snap = await getDoc(doc(db, 'salons', username));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    // SuperAdmin — lire tous les salons
    async getAllSalons() {
        const snap = await getDocs(collection(db, 'salons'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // SuperAdmin — mettre à jour n'importe quel champ d'un salon
    async updateSalon(username, data) {
        if (!username) return;
        await setDoc(doc(db, 'salons', username), data, { merge: true });
    },

    // SuperAdmin — supprimer un salon du registre
    async deleteSalon(username) {
        if (!username) return;
        await deleteDoc(doc(db, 'salons', username));
    }
};

// === CONTACTS (messages depuis le formulaire index.html) ===
export const ContactAPI = {
    async getAll() {
        try {
            const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
            const snap = await getDocs(collection(db, 'contacts'));
            return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                const ta = a.createdAt?.seconds || 0;
                const tb = b.createdAt?.seconds || 0;
                return tb - ta;
            });
        }
    },
    async markRead(id) {
        await updateDoc(doc(db, 'contacts', id), { status: 'read' });
    },
    async markReplied(id) {
        await updateDoc(doc(db, 'contacts', id), { status: 'replied', repliedAt: serverTimestamp() });
    },
    async delete(id) {
        await deleteDoc(doc(db, 'contacts', id));
    }
};

// Exposer les APIs Firestore sous le préfixe FS pour ne pas écraser les APIs localStorage de strandpro.html
window.FSInvAPI        = InvAPI;
window.FSStaffAPI      = StaffAPI;
window.FSApptAPI       = ApptAPI;
window.FSExpAPI        = ExpAPI;
window.FSTaskAPI       = TaskAPI;
window.FSAttAPI        = AttAPI;
window.UserAPI         = UserAPI;
window.SalonRegistryAPI = SalonRegistryAPI;
window.ContactAPI      = ContactAPI;