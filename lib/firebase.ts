import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Stub mode: Firebase not configured yet
  // The app will show auth prompts but won't connect to Firebase
  // until real credentials are provided in .env.local
  if (typeof window !== 'undefined') {
    console.warn(
      '[Novelosity] Firebase is not configured. ' +
      'Add your Firebase credentials to .env.local to enable auth and database features.'
    );
  }
  // Use a placeholder app to avoid null checks everywhere
  // Real functionality requires valid credentials
  try {
    app = getApps().length > 0 ? getApp() : initializeApp({ apiKey: 'placeholder', projectId: 'placeholder', appId: 'placeholder' });
  } catch {
    // ignore
  }
  auth = getAuth(app!);
  db = getFirestore(app!);
  storage = getStorage(app!);
}

export { auth, db, storage };
export default app;
