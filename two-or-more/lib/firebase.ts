import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDAdSHI9kAuND6fcOZaOmCFW97L-Sqpor4",
  authDomain: "rooted-e102a.firebaseapp.com",
  projectId: "rooted-e102a",
  storageBucket: "rooted-e102a.firebasestorage.app",
  messagingSenderId: "797200227436",
  appId: "1:797200227436:ios:ad5ea5a14dba39a712cc49"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;


