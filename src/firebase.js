// ============================================================
//  STEP 1: Replace these values with your Firebase project's
//  config from: Firebase Console → Project Settings → Your Apps
// ============================================================
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDRqDyF2qY59k8kgS7RLONV3SDSCTVKVs",
  authDomain: "fieldclock-11763.firebaseapp.com",
  projectId: "fieldclock-11763",
  storageBucket: "fieldclock-11763.firebasestorage.app",
  messagingSenderId: "168832588854",
  appId: "1:168832588854:web:85f026ad429c1b9145cc97"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);