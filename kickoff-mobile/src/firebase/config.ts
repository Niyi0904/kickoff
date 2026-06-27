import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence exists at runtime in Firebase 12+ but types may not export it
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, auth, db };
