// Conexión a Firebase (SDK modular v10 desde CDN, sin necesidad de instalar nada)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, onSnapshot, query, orderBy, limit,
  writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxYBzmLKrCqnCTDPrwaWbspEY81UN0stg",
  authDomain: "patak-bf0fd.firebaseapp.com",
  projectId: "patak-bf0fd",
  storageBucket: "patak-bf0fd.firebasestorage.app",
  messagingSenderId: "314921938642",
  appId: "1:314921938642:web:b8a3502105f77a58c7070b",
  measurementId: "G-9FS7XBLGFH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics es opcional: si falla (bloqueadores, localhost) no afecta al sistema.
import("https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js")
  .then((m) => m.getAnalytics(app))
  .catch(() => {});

export {
  db, doc, getDoc, collection, onSnapshot, query, orderBy, limit,
  writeBatch, serverTimestamp
};
