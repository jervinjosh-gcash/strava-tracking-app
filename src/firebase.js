import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDCJIlPtNdUR5WX1MawD_hquo9lm7ksWQ",
  authDomain: "strava-tracking-app.firebaseapp.com",
  projectId: "strava-tracking-app",
  storageBucket: "strava-tracking-app.appspot.com",
  messagingSenderId: "810033692891",
  appId: "1:810033692891:web:8d4cff213c40f29af40cfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, doc, auth, setDoc, getDoc };



