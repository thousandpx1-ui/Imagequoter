import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase — used for Firestore (paid credits storage) only.
// Auth is handled by Clerk. AI calls go directly to OpenAI.
const firebaseConfig = {
  apiKey: "AIzaSyDizbWDjZReItZISBDXCoYYvQtHTNwKsMQ",
  authDomain: "imagequoter-55382.firebaseapp.com",
  projectId: "imagequoter-55382",
  storageBucket: "imagequoter-55382.firebasestorage.app",
  messagingSenderId: "778088501936",
  appId: "1:778088501936:web:c22a85ad9ca88d95ece175",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
