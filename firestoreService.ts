import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Operation Types as defined in the skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initializing DB
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let db: any = null;

if (fs.existsSync(configPath)) {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase Firestore successfully initialized on backend with databaseId:', firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error('Error parsing firebase-applet-config.json:', err);
  }
} else {
  console.warn('firebase-applet-config.json not found. Operating with local filesystem fallback.');
}

// Validate connection on boot as requested by skill constraints
async function validateConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Validated connection to Firestore successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Server appears offline.");
    } else {
      console.log("Firestore validation test complete.");
    }
  }
}
validateConnection();

export const firestoreService = {
  isAvailable(): boolean {
    return db !== null;
  },

  async getAdminPassword(defaultPassword: string = 'carrier1234'): Promise<string> {
    if (!this.isAvailable()) return defaultPassword;
    try {
      const docRef = doc(db, 'admin', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.password || defaultPassword;
      }
      return defaultPassword;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'admin/settings');
    }
  },

  async setAdminPassword(password: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'admin', 'settings');
      await setDoc(docRef, { password }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'admin/settings');
    }
  },

  async getPosts(): Promise<any[]> {
    if (!this.isAvailable()) return [];
    try {
      const postsCol = collection(db, 'posts');
      const snapshot = await getDocs(postsCol);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Sort descending by createdAt
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      return posts;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'posts');
    }
  },

  async savePost(id: string, post: any): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'posts', id);
      await setDoc(docRef, post, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${id}`);
    }
  },

  async getPostById(id: string): Promise<any | null> {
    if (!this.isAvailable()) return null;
    try {
      const docRef = doc(db, 'posts', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `posts/${id}`);
    }
  },

  async deletePost(id: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'posts', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
    }
  },

  async getProducts(): Promise<any[]> {
    if (!this.isAvailable()) return [];
    try {
      const prodCol = collection(db, 'products');
      const snapshot = await getDocs(prodCol);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  },

  async saveProduct(id: string, product: any): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, product, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  },

  async getEmails(): Promise<any[]> {
    if (!this.isAvailable()) return [];
    try {
      const emailsCol = collection(db, 'emails');
      const snapshot = await getDocs(emailsCol);
      const emails = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Sort descending by timestamp
      emails.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      });
      return emails;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'emails');
    }
  },

  async saveEmail(id: string, email: any): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const docRef = doc(db, 'emails', id);
      await setDoc(docRef, email, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `emails/${id}`);
    }
  },

  /**
   * Automatically bootstrap and migrate local JSON data to Firestore.
   * This is run exactly once on startup to seed product, posts, emails and admin records.
   */
  async seedData(localData: { posts: any[], products: any[], emails: any[], adminPassword?: string }): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      // 1. Seed admin settings if not present
      if (localData.adminPassword) {
        const adminRef = doc(db, 'admin', 'settings');
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          console.log('Seeding admin settings to Firestore...');
          await setDoc(adminRef, { password: localData.adminPassword });
        }
      }

      // 2. Seed products if products collection is empty
      const productsCol = collection(db, 'products');
      const productsSnap = await getDocs(productsCol);
      if (productsSnap.empty && localData.products.length > 0) {
        console.log(`Seeding ${localData.products.length} products to Firestore...`);
        for (const prod of localData.products) {
          const { id, ...payload } = prod;
          await setDoc(doc(db, 'products', id), payload);
        }
      }

      // 3. Seed posts if posts collection is empty
      const postsCol = collection(db, 'posts');
      const postsSnap = await getDocs(postsCol);
      if (postsSnap.empty && localData.posts.length > 0) {
        console.log(`Seeding ${localData.posts.length} posts to Firestore...`);
        for (const post of localData.posts) {
          const { id, ...payload } = post;
          await setDoc(doc(db, 'posts', id), payload);
        }
      }

      // 4. Seed email logs if empty
      const emailsCol = collection(db, 'emails');
      const emailsSnap = await getDocs(emailsCol);
      if (emailsSnap.empty && localData.emails.length > 0) {
        console.log(`Seeding ${localData.emails.length} email logs to Firestore...`);
        for (const email of localData.emails) {
          const { id, ...payload } = email;
          await setDoc(doc(db, 'emails', id), payload);
        }
      }
    } catch (err) {
      console.error('Error during Firestore database seeding:', err);
    }
  }
};
