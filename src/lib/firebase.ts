
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "campuscravings-sv8d0",
  "appId": "1:330879162591:web:5c19547b95a730ea7f316a",
  "storageBucket": "campuscravings-sv8d0.appspot.com",
  "apiKey": "AIzaSyAuv5ntih6rWtrISRO7N9lj2DM6b5zy2xk",
  "authDomain": "campuscravings-sv8d0.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "330879162591"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, storage, db };
