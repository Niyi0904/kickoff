import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence exists at runtime in Firebase 12+ but types may not export it
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// TODO: Replace with your Firebase config
// Get this from Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: 'AIzaSyAjyJgN-8rO7KrBUsFEhLqVNp1FzpKMI_A',
  authDomain: 'team-management-7d995.firebaseapp.com',
  projectId: 'team-management-7d995',
  storageBucket: 'team-management-7d995.firebasestorage.app',
  messagingSenderId: '159475538125',
  appId: '1:159475538125:web:101b848b0f937345063184',
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
