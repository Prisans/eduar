// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDULpqX3cR_W6IXz09F0jT7gvuZt52Y3bQ",
  authDomain: "eduar-authentication.firebaseapp.com",
  projectId: "eduar-authentication",
  storageBucket: "eduar-authentication.appspot.com",
  messagingSenderId: "294526165729",
  appId: "1:294526165729:web:a1ba4b700eb7815a314da0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const Auth= getAuth();
export default app;