// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);