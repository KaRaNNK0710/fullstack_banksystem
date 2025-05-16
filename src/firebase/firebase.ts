import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJimcJRqk5p2wmNRVP0R0VP3YtQ-yphP0",
  authDomain: "abcdr-6a4b0.firebaseapp.com",
  projectId: "abcdr-6a4b0",
  storageBucket: "abcdr-6a4b0.firebasestorage.app",
  messagingSenderId: "221098112757",
  appId: "1:221098112757:web:db770a2d32ec821b18b7bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;