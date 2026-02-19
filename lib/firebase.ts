import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyC70QyiZPsoc1HyHuCyWvOcm26xW_nPJBQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "dialed-d9ea2.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "https://dialed-d9ea2-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "dialed-d9ea2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "dialed-d9ea2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "931437160233",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:931437160233:web:b174234393372b19e83938",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-LM4Y8FZNPP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
