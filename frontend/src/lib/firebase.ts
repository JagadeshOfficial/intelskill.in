// frontend/src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDZaQ9jA5GTCE1wYNtTt3l6UWEKsYaEYoE",
    authDomain: "learnflow-storage.firebaseapp.com",
    projectId: "learnflow-storage",
    storageBucket: "learnflow-storage.firebasestorage.app",
    messagingSenderId: "122782833106",
    appId: "1:122782833106:web:c4aa95caf3d5fceb3bd00b"
};

// Initialize Firebase (limit to one instance)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, storage, auth, db };
