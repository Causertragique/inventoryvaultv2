import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { createOrUpdateUserProfile } from "./users";
import { UserRole } from "@/lib/permissions";

const persistLocalAuth = (user: User, role?: UserRole) => {
  localStorage.setItem("bartender-auth", "authenticated");
  localStorage.setItem("bartender-user-id", user.uid);
  localStorage.setItem("bartender-username", user.email || user.displayName || "User");
  localStorage.setItem("bartender-user", JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }));
  if (role) {
    localStorage.setItem("bartender-user-role", role);
  }
};

// Connexion email/password
export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // Créer/mettre à jour le profil dans Firestore
  const role = await createOrUpdateUserProfile(result.user);
  persistLocalAuth(result.user, role);
  
  return result.user;
}

// Inscription email/password
export async function signupWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Créer le profil dans Firestore
  const role = await createOrUpdateUserProfile(result.user);
  persistLocalAuth(result.user, role);
  
  return result.user;
}

// Connexion avec Google
export async function loginWithGoogle(): Promise<User> {
  if (!auth || !googleProvider) throw new Error("Firebase Auth not initialized");
  const result = await signInWithPopup(auth, googleProvider);
  
  // Créer/mettre à jour le profil dans Firestore
  const role = await createOrUpdateUserProfile(result.user);
  persistLocalAuth(result.user, role);
  
  return result.user;
}

// Réinitialiser le mot de passe
export async function resetPassword(email: string): Promise<void> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  await sendPasswordResetEmail(auth, email);
}

// Déconnexion
export async function logout(): Promise<void> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  // Nettoyer le localStorage
  localStorage.removeItem("bartender-auth");
  localStorage.removeItem("bartender-user");
  localStorage.removeItem("bartender-user-id");
  localStorage.removeItem("bartender-username");
  localStorage.removeItem("bartender-user-role");
  
  // Nettoyer les caches analytics
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("bartender-analytics-")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  await signOut(auth);
}

// Observer l'état de connexion
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.warn("Firebase Auth not initialized in onAuthChange");
    // Retourner immédiatement null si auth n'est pas dispo
    callback(null);
    return () => {}; // Fonction de cleanup vide
  }
  return onAuthStateChanged(auth, callback);
}

// Obtenir l'utilisateur actuel
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

// Obtenir le userId actuel
export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.uid || null;
}
