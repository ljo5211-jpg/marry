// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsZD2pbAhSfkKfrLDdkJiYjqAqIKUTLTA",
    authDomain: "wedding-invitation-7be56.firebaseapp.com",
    projectId: "wedding-invitation-7be56",
    storageBucket: "wedding-invitation-7be56.firebasestorage.app",
    messagingSenderId: "703601525164",
    appId: "1:703601525164:web:a8863dfc464578569a7a09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
