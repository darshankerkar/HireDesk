// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDW5WCkz20DkjrBRyT80C193iUtnh9yRFs",
  authDomain: "ai-hr-8d267.firebaseapp.com",
  projectId: "ai-hr-8d267",
  storageBucket: "ai-hr-8d267.firebasestorage.app",
  messagingSenderId: "292576501350",
  appId: "1:292576501350:web:e27e2a25164919c66c17a7",
  measurementId: "G-1MFK0G2V1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
