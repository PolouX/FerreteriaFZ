// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiss6f1HHOnBL_15iGJuu7ubVY069L8nU",
  authDomain: "ferreteria-zapopan.firebaseapp.com",
  projectId: "ferreteria-zapopan",
  storageBucket: "ferreteria-zapopan.appspot.com",
  messagingSenderId: "225390414239",
  appId: "1:225390414239:web:15dc78a2ca4b051fd355aa",
  measurementId: "G-00H7XYV962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
