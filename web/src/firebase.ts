import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// TODO: remplace par ta vraie config depuis la console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwEzLOIO2j-OeYS0ipRWMamZy9OUiZKyU",
  authDomain: "almproject-30c6f.firebaseapp.com",
  projectId: "almproject-30c6f",
  storageBucket: "almproject-30c6f.firebasestorage.app",
  messagingSenderId: "1004880661936",
  appId: "1:1004880661936:web:bcfce1c9d134cd764c9a75",
  measurementId: "G-W918JY18TQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
