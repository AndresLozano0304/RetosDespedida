// Rellena estos valores con los de TU proyecto de Firebase.
// Pasos para obtenerlos: ver README.md, seccion "Configurar Firebase".
// Estas claves son publicas por diseno (no son secretas), pero las reglas
// de la base de datos son las que realmente protegen los datos.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUEswMABqnoJFB2hXXcZNfOYtRovmIvs0",
  authDomain: "retos-sayago.firebaseapp.com",
  projectId: "retos-sayago",
  storageBucket: "retos-sayago.firebasestorage.app",
  messagingSenderId: "176732657519",
  appId: "1:176732657519:web:951bea1509c98818ebfa9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);