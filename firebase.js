import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyAt92yMv-1B5kA1sZnmTB2qg_Ws9dFuxOU",
  authDomain: "globlrunningapp.firebaseapp.com",
  projectId: "globlrunningapp",
  storageBucket: "globlrunningapp.firebasestorage.app",
  messagingSenderId: "662968877032",
  appId: "1:662968877032:ios:9a251433202cc3dd5c6e5d"
};

// only initialising app once 
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app); // fallback if already initialised
}

export { auth };