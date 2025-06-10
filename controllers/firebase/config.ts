import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBVE1_FgOYqG7JQRkZ2rFpXMR6WfqNqUlo",
  authDomain: "solicitudes-70af0.firebaseapp.com",
  projectId: "solicitudes-70af0",
  storageBucket: "solicitudes-70af0.appspot.com",
  messagingSenderId: "513108134731",
  appId: "1:513108134731:web:3aabdd8a5d4dcc54aab6ce",
  measurementId: "G-BYE06JTMPH"
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
// // Obtiene el servicio de almacenamiento
const storage = getStorage(firebaseApp);

export { firebaseApp, storage };
