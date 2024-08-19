// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Importar Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBmwHmRVktqT6uXr7HpEk36FtiZDEmwXJc",
  authDomain: "login-test-b43ea.firebaseapp.com",
  projectId: "login-test-b43ea",
  storageBucket: "login-test-b43ea.appspot.com",
  messagingSenderId: "271231135095",
  appId: "1:271231135095:web:d36fb213598e42a3384572",
  measurementId: "G-XRJBTP9J6V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);  // Inicializar Firebase Storage

export { db, storage };  // Exportar también storage
