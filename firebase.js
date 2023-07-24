// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

import {getAuth} from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCE_qmbHY2_tW1N8wd6lPscZm5XIeyTAuI",
  authDomain: "mexpo-999f1.firebaseapp.com",
  projectId: "mexpo-999f1",
  storageBucket: "mexpo-999f1.appspot.com",
  messagingSenderId: "880871044112",
  appId: "1:880871044112:web:65eaebd957a867d9410695"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)

export const firestore = getFirestore(app);
