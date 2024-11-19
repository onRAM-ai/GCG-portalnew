import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBDE74uzYZvVFE283Fqts7Zb1z_VUW8D5U",
  authDomain: "gcg-saas.firebaseapp.com",
  projectId: "gcg-saas",
  storageBucket: "gcg-saas.firebasestorage.app",
  messagingSenderId: "608771961450",
  appId: "1:608771961450:web:7513141943fad9f98e1013",
  measurementId: "G-CCT34W9N19"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics conditionally
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, db, auth, storage, analytics };