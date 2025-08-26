import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth,} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAt92yMv-1B5kA1sZnmTB2qg_Ws9dFuxOU",
  authDomain: "globlrunningapp.firebaseapp.com",
  projectId: "globlrunningapp",
  storageBucket: "globlrunningapp.firebasestorage.app",
  messagingSenderId: "662968877032",
  appId: "1:662968877032:ios:9a251433202cc3dd5c6e5d"
};

// 1) App - initialise app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 2) Auth- initialise auth once (fallback to getAuth if already initialised)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app); // fallback, already initalised
}

// 3) Firestore
let db;
try {
  // Long polling helps when React Native’s networking layer blocks WebSockets
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} catch {
  db = getFirestore(app); // if already initialised elsewhere
}

export { app, auth, db };