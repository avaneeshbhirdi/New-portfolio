import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUZnMO0TF_1jjpxC_AVhB8TBkD3bnP7BE",
    authDomain: "portfolio-technical.firebaseapp.com",
    projectId: "portfolio-technical",
    storageBucket: "portfolio-technical.firebasestorage.app",
    messagingSenderId: "78834814352",
    appId: "1:78834814352:web:9f9ecdca525c5d39daf715",
    measurementId: "G-LLN22QPB0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
