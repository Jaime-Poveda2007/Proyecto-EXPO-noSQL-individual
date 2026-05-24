

import { initializeApp } from 'firebase/app';     // Inicializa la conexión
import { getAuth } from 'firebase/auth';           // Módulo de autenticación
import { getFirestore } from 'firebase/firestore'; // Módulo de base de datos


const firebaseConfig = {
  apiKey: "AIzaSyBrO8sK7G12EkxYSxzuPZxRO1j4slVkVSg",
  authDomain: "expo-nosql-individual-2593a.firebaseapp.com",
  projectId: "expo-nosql-individual-2593a",
  storageBucket: "expo-nosql-individual-2593a.firebasestorage.app",
  messagingSenderId: "397797418178",
  appId: "1:397797418178:web:589eaad398f43bab94075b",
  measurementId: "G-CT3HMWHDX9"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };