// ===== FIREBASE CONFIGURATION & INITIALIZATION =====

/**
 * ⚠️ PERINGATAN KEAMANAN ⚠️
 * Konfigurasi Firebase yang berisi API Keys seharusnya TIDAK disimpan di file JavaScript frontend.
 * Untuk produksi, sebaiknya pindahkan logika Firebase ke backend (Cloud Functions/Node.js server).
 * Alternatif: Gunakan Firebase App Check untuk melindungi resources Anda.
 */

const firebaseConfig = {
    apiKey: "AIzaSyCvx_MeU43fnoxX2C4FbCVUmtahouwVF8E",
    authDomain: "absensiachmadtoha.firebaseapp.com",
    projectId: "absensiachmadtoha",
    storageBucket: "absensiachmadtoha.firebasestorage.app", // ✅ Diperbaiki dari typo
    messagingSenderId: "728127434246",
    appId: "1:728127434246:web:cbdc0b26d15450e08c5d87",
    measurementId: "G-75B74RNT79"
};

// ===== FIREBASE INITIALIZATION =====
let firebaseApp;
let db;
let auth;
let storage;
let googleProvider;

// Check if Firebase is already initialized to avoid duplicate initialization
try {
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized successfully");
        
        // Initialize services
        db = firebaseApp.firestore();
        auth = firebaseApp.auth();
        storage = firebaseApp.storage();
        
        // Configure Firestore settings
        if (db) {
            db.settings({
                merge: true,
                ignoreUndefinedProperties: true
            });
        }
        
        // Initialize Google Auth Provider
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
        googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        
        // Set performance monitoring (optional)
        if (firebase.performance) {
            const perf = firebase.performance();
            console.log("📊 Firebase Performance Monitoring enabled");
        }
        
        // Set analytics (optional)
        if (firebase.analytics) {
            const analytics = firebase.analytics();
            console.log("📈 Firebase Analytics enabled");
        }
        
    } else {
        firebaseApp = firebase.app();
        db = firebaseApp.firestore();
        auth = firebaseApp.auth();
        storage = firebaseApp.storage();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        console.log("ℹ️ Using existing Firebase app");
    }
} catch (error) {
    console.error("❌ Error initializing Firebase:", error);
    // Fallback: Create mock services for development if Firebase fails
    createMockServices();
}

// ===== FIREBASE SERVICE GETTERS =====
/**
 * Safe getters for Firebase services
 * Returns the service or null if not available
 */
const getFirestore = () => {
    if (!db) {
        console.warn("⚠️ Firestore not initialized");
        return null;
    }
    return db;
};

const getAuth = () => {
    if (!auth) {
        console.warn("⚠️ Firebase Auth not initialized");
        return null;
    }
    return auth;
};

const getStorage = () => {
    if (!storage) {
        console.warn("⚠️ Firebase Storage not initialized");
        return null;
    }
    return storage;
};

const getGoogleProvider = () => {
    if (!googleProvider) {
        console.warn("⚠️ Google Provider not initialized");
        return null;
    }
    return googleProvider;
};

// ===== HELPER FUNCTIONS =====
/**
 * Get server timestamp safely
 */
const getServerTimestamp = () => {
    try {
        return firebase.firestore.FieldValue.serverTimestamp();
    } catch (error) {
        console.warn("⚠️ Could not get server timestamp, using local time");
        return new Date();
    }
};

/**
 * Batch write helper
 */
const batchWrite = async (operations) => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    
    const batch = db.batch();
    
    operations.forEach(op => {
        if (op.type === 'set') {
            batch.set(op.ref, op.data, op.options);
        } else if (op.type === 'update') {
            batch.update(op.ref, op.data);
        } else if (op.type === 'delete') {
            batch.delete(op.ref);
        }
    });
    
    return await batch.commit();
};

/**
 * Safe document reference creator
 */
const createDocRef = (collectionPath, docId = null) => {
    if (!db) {
        throw new Error("Firestore not initialized");
    }
    
    const collectionRef = db.collection(collectionPath);
    return docId ? collectionRef.doc(docId) : collectionRef.doc();
};

// ===== AUTHENTICATION HELPERS =====
/**
 * Authentication state listener with error handling
 */
const setupAuthListener = (callback) => {
    if (!auth) {
        console.error("❌ Cannot setup auth listener: Auth not initialized");
        return () => {}; // Return empty unsubscribe function
    }
    
    try {
        return auth.onAuthStateChanged(
            (user) => {
                if (callback) callback(user);
            },
            (error) => {
                console.error("❌ Auth state change error:", error);
                if (callback) callback(null, error);
            }
        );
    } catch (error) {
        console.error("❌ Error setting up auth listener:", error);
        return () => {};
    }
};

/**
 * Login with Google
 */
const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        throw new Error("Firebase Auth not initialized");
    }
    
    try {
        const result = await auth.signInWithPopup(googleProvider);
        return result;
    } catch (error) {
        console.error("❌ Google Sign-In error:", error);
        throw error;
    }
};

/**
 * Logout
 */
const signOutUser = async () => {
    if (!auth) {
        throw new Error("Firebase Auth not initialized");
    }
    
    try {
        await auth.signOut();
        return true;
    } catch (error) {
        console.error("❌ Sign out error:", error);
        throw error;
    }
};

// ===== FIRESTORE DATA HELPERS =====
/**
 * Check and create collections if they don't exist
 * Note: In Firestore, collections are created automatically when adding documents
 */
const checkCollections = async () => {
    if (!db) return;
    
    const collections = ['users', 'attendance', 'salary', 'kasbon', 'overtime', 'settings'];
    
    try {
        // Just check if we can access Firestore
        await db.collection('users').limit(1).get();
        console.log("✅ Firestore collections are accessible");
    } catch (error) {
        console.error("❌ Error accessing Firestore:", error);
    }
};

// ===== MOCK SERVICES FOR DEVELOPMENT =====
/**
 * Create mock services for development if Firebase fails
 * This allows the app to continue working in development mode
 */
function createMockServices() {
    console.log("⚠️ Creating mock Firebase services for development");
    
    const mockService = {
        // Mock Firestore
        firestore: {
            collection: () => ({
                doc: () => ({
                    set: () => Promise.resolve(),
                    update: () => Promise.resolve(),
                    delete: () => Promise.resolve(),
                    get: () => Promise.resolve({ exists: false, data: () => null })
                }),
                add: () => Promise.resolve({ id: 'mock-id' }),
                get: () => Promise.resolve({ empty: true, docs: [] })
            })
        },
        
        // Mock Auth
        auth: {
            currentUser: null,
            onAuthStateChanged: (callback) => {
                setTimeout(() => callback(null), 100);
                return () => {};
            },
            signInWithPopup: () => Promise.reject(new Error("Mock: Auth not available")),
            signOut: () => Promise.resolve()
        },
        
        // Mock Storage
        storage: () => ({
            ref: () => ({
                put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } })
            })
        })
    };
    
    db = mockService.firestore;
    auth = mockService.auth;
    storage = mockService.storage();
}

// ===== ERROR HANDLING =====
/**
 * Firebase error handler
 */
const handleFirebaseError = (error) => {
    console.error("🔥 Firebase Error:", error);
    
    // Common Firebase error codes
    const errorMessages = {
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'permission-denied': 'You do not have permission to access this data',
        'unavailable': 'Service temporarily unavailable'
    };
    
    const message = errorMessages[error.code] || error.message || 'An error occurred';
    
    // Show user-friendly error
    if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification(`Error: ${message}`, 'error');
    }
    
    return { error: true, message, code: error.code };
};

// ===== EXPORTS =====
// Export for use in other files
window.firebaseService = {
    // Services
    db: getFirestore(),
    auth: getAuth(),
    storage: getStorage(),
    googleProvider: getGoogleProvider(),
    
    // Helper functions
    getServerTimestamp,
    batchWrite,
    createDocRef,
    
    // Auth functions
    setupAuthListener,
    signInWithGoogle,
    signOutUser,
    
    // Error handling
    handleFirebaseError,
    
    // Initialization check
    isInitialized: () => !!firebaseApp,
    
    // Configuration (read-only)
    config: Object.freeze({ ...firebaseConfig })
};

// ===== INITIALIZATION CHECK =====
// Check collections on startup
setTimeout(() => {
    if (db) {
        checkCollections().catch(console.error);
    }
}, 1000);

// Add global error handler for uncaught Firebase errors
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && 
            (event.reason.message?.includes('firebase') || 
             event.reason.code?.startsWith('auth/') || 
             event.reason.code?.startsWith('storage/'))) {
            console.error("🔥 Unhandled Firebase Error:", event.reason);
            handleFirebaseError(event.reason);
        }
    });
}

console.log("🚀 Firebase service initialized successfully!");

// For module environments (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.firebaseService;
}
