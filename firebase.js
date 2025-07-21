import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAt92yMv-1B5kA1sZnmTB2qg_Ws9dFuxOU",
  authDomain: "globlrunningapp.firebaseapp.com",
  projectId: "globlrunningapp",
  storageBucket: "globlrunningapp.firebasestorage.app",
  messagingSenderId: "662968877032",
  appId: "1:662968877032:ios:9a251433202cc3dd5c6e5d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);