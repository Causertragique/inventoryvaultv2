import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, Firestore } from "firebase/firestore";

const shouldForceLongPolling = (() => {
  if (import.meta.env.VITE_FIRESTORE_FORCE_LONG_POLLING === "true") {
    return true;
  }
  if (typeof window === "undefined") {
    return false;
  }

  const host = window.location.hostname;
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local");
  return isLocalHost;
})();

// Configuration Firebase - Les valeurs doivent être définies dans les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialiser Firebase seulement si les variables d'environnement sont définies
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Debug: Afficher les valeurs de configuration (sans les valeurs sensibles)
console.log("Firebase Config Check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10) + "...",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
  try {
    // Éviter de réinitialiser Firebase si déjà initialisé
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialisé avec succès");
    } else {
      app = getApps()[0];
      console.log("Firebase déjà initialisé, utilisation de l'instance existante");
    }
    
    auth = getAuth(app);
    // Use long polling fallback on restrictive networks / localhost dev
    if (!db) {
      const firestoreSettings = {
        experimentalAutoDetectLongPolling: !shouldForceLongPolling,
        experimentalForceLongPolling: shouldForceLongPolling,
        useFetchStreams: false,
      };

      if (shouldForceLongPolling) {
        console.warn(
          "[Firebase] Firestore long-polling forcé (environnement réseau restreint détecté)"
        );
      } else {
        console.log(
          "[Firebase] Firestore auto-détecte le meilleur transport réseau"
        );
      }

      db = initializeFirestore(app, firestoreSettings);
    }
    console.log("Firebase Auth et Firestore initialisés");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase:", error);
  }
} else {
  console.warn(
    "⚠️ Firebase configuration is incomplete. Please set the following environment variables:\n" +
    "- VITE_FIREBASE_API_KEY\n" +
    "- VITE_FIREBASE_AUTH_DOMAIN\n" +
    "- VITE_FIREBASE_PROJECT_ID\n" +
    "- VITE_FIREBASE_STORAGE_BUCKET\n" +
    "- VITE_FIREBASE_MESSAGING_SENDER_ID\n" +
    "- VITE_FIREBASE_APP_ID"
  );
  console.warn("Valeurs actuelles:", {
    apiKey: firebaseConfig.apiKey ? "✓ Défini" : "✗ Manquant",
    authDomain: firebaseConfig.authDomain ? "✓ Défini" : "✗ Manquant",
    projectId: firebaseConfig.projectId ? "✓ Défini" : "✗ Manquant",
  });
}

// Provider Google
// Provider Google
export const googleProvider = auth ? new GoogleAuthProvider() : null;

// Exporter auth, app et db
export { auth, app, db };

// Fonction helper pour vérifier si Firebase est configuré
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    auth
  );
};
