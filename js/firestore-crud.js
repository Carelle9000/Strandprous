// Fonctions CRUD pour Firestore - StrandPro Salon Management

class FirestoreManager {
  constructor(db) {
    this.db = db;
    this.collections = window.firestoreCollections;
  }

  // CREATE - Ajouter un document
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Document ajouté dans ${collectionName} avec ID: ${docRef.id}`);
      return { success: true, id: docRef.id, data: { ...data, id: docRef.id } };
    } catch (error) {
      console.error(`Erreur ajout document ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // READ - Obtenir un document par ID
  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document non trouvé' };
      }
    } catch (error) {
      console.error(`Erreur lecture document ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // READ - Obtenir tous les documents d'une collection
  async getAllDocuments(collectionName, orderByField = 'createdAt', orderDirection = 'desc') {
    try {
      const q = query(
        collection(this.db, collectionName),
        orderBy(orderByField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      console.error(`Erreur lecture collection ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // UPDATE - Mettre à jour un document
  async updateDocument(collectionName, docId, updateData) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      console.log(`Document ${docId} mis à jour dans ${collectionName}`);
      return { success: true, id: docId, data: updateData };
    } catch (error) {
      console.error(`Erreur mise à jour document ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // DELETE - Supprimer un document
  async deleteDocument(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`Document ${docId} supprimé de ${collectionName}`);
      return { success: true, id: docId };
    } catch (error) {
      console.error(`Erreur suppression document ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }

  // QUERY - Rechercher avec filtres
  async queryDocuments(collectionName, filters = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = null) {
    try {
      let q = query(collection(this.db, collectionName));
      
      // Appliquer les filtres
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Appliquer l'ordre
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Appliquer la limite si spécifiée
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: documents };
    } catch (error) {
      console.error(`Erreur requête ${collectionName}:`, error);
      return { success: false, error: error.message };
    }
  }
}

// Fonctions spécifiques pour StrandPro
class StrandProFirestore extends FirestoreManager {
  // Gestion des clients
  async addCustomer(customerData) {
    return this.addDocument(this.collections.CUSTOMERS, customerData);
  }

  async getCustomers() {
    return this.getAllDocuments(this.collections.CUSTOMERS, 'name', 'asc');
  }

  async searchCustomers(searchTerm) {
    const filters = [
      { field: 'name', operator: '>=', value: searchTerm },
      { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' }
    ];
    return this.queryDocuments(this.collections.CUSTOMERS, filters);
  }

  // Gestion des rendez-vous
  async addAppointment(appointmentData) {
    return this.addDocument(this.collections.APPOINTMENTS, appointmentData);
  }

  async getAppointmentsByDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filters = [
      { field: 'date', operator: '>=', value: startOfDay },
      { field: 'date', operator: '<=', value: endOfDay }
    ];
    
    return this.queryDocuments(this.collections.APPOINTMENTS, filters, 'date', 'asc');
  }

  async getUpcomingAppointments(limit = 10) {
    const now = new Date();
    const filters = [
      { field: 'date', operator: '>=', value: now }
    ];
    return this.queryDocuments(this.collections.APPOINTMENTS, filters, 'date', 'asc', limit);
  }

  // Gestion des services
  async addService(serviceData) {
    return this.addDocument(this.collections.SERVICES, serviceData);
  }

  async getServices() {
    return this.getAllDocuments(this.collections.SERVICES, 'name', 'asc');
  }

  // Gestion du personnel
  async addStaff(staffData) {
    return this.addDocument(this.collections.STAFF, staffData);
  }

  async getStaff() {
    return this.getAllDocuments(this.collections.STAFF, 'name', 'asc');
  }

  // Gestion de l'inventaire
  async addInventoryItem(itemData) {
    return this.addDocument(this.collections.INVENTORY, itemData);
  }

  async getInventory() {
    return this.getAllDocuments(this.collections.INVENTORY, 'name', 'asc');
  }

  async updateInventoryQuantity(itemId, newQuantity) {
    return this.updateDocument(this.collections.INVENTORY, itemId, { 
      quantity: newQuantity,
      lastUpdated: new Date()
    });
  }
}

// Initialiser le gestionnaire Firestore
window.strandProFirestore = new StrandProFirestore(window.firebaseDB);

console.log('Firestore CRUD operations initialized');
