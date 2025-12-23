// Firebase Configuration for your project
const firebaseConfig = {
    apiKey: "AIzaSyCvx_MeU43fnoxX2C4FbCVUmtahouwVF8E",
    authDomain: "absensiachmadtoha.firebaseapp.com",
    projectId: "absensiachmadtoha",
    storageBucket: "absensiachmadtoha.firebasestorage.app",
    messagingSenderId: "728127434246",
    appId: "1:728127434246:web:cbdc0b26d15450e08c5d87",
    measurementId: "G-75B74RNT79"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Error initializing Firebase:", error);
}

// Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Export for use in other files
window.firebaseDb = db;
window.firebaseAuth = auth;

// Set Firestore settings
db.settings({
    merge: true,
    ignoreUndefinedProperties: true
});

// Helper function to get server timestamp
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// Create collections if they don't exist
const collections = ['users', 'attendance', 'salary', 'kasbon', 'overtime', 'settings'];

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Export provider
window.googleProvider = googleProvider;

// Authentication state listener
auth.onAuthStateChanged((user) => {
    if (window.absensiApp) {
        window.absensiApp.onAuthStateChanged(user);
    }
});

console.log("🚀 Firebase configuration loaded successfully!");
