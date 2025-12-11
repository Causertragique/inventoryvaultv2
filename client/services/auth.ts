import { signInWithPopup, signOut, User, UserCredential } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Convertit un User Firebase en AuthUser
 */
const convertFirebaseUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

/**
 * Connexion avec Google
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  console.log("signInWithGoogle appelé");
  console.log("isFirebaseConfigured:", isFirebaseConfigured());
  console.log("auth:", auth ? "✓ Initialisé" : "✗ Non initialisé");
  console.log("googleProvider:", googleProvider ? "✓ Disponible" : "✗ Non disponible");

  if (!isFirebaseConfigured()) {
    const errorMsg = "Firebase n'est pas configuré. Veuillez configurer les variables d'environnement Firebase. Vérifiez la console pour plus de détails.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!auth || !googleProvider) {
    const errorMsg = "Firebase Auth n'est pas initialisé. Vérifiez votre configuration Firebase.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const currentDomain = window.location.hostname;
    const currentHost = window.location.host;
    const currentUrl = window.location.href;
    
    console.log("=== Informations de domaine ===");
    console.log("Hostname:", currentDomain);
    console.log("Host (avec port):", currentHost);
    console.log("URL complète:", currentUrl);
    console.log("==============================");
    
    console.log("Tentative d'ouverture de la popup Google...");
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    console.log("Popup Google fermée avec succès");
    const user = convertFirebaseUser(result.user);
    console.log("Utilisateur connecté:", user);

    // Sauvegarder dans localStorage pour compatibilité avec le système existant
    localStorage.setItem("bartender-auth", "authenticated");
    localStorage.setItem("bartender-user-id", user.uid);
    localStorage.setItem("bartender-username", user.email || user.displayName || user.uid);
    localStorage.setItem("bartender-auth-provider", "google");
    
    // Sauvegarder les infos utilisateur complètes
    localStorage.setItem("bartender-user", JSON.stringify(user));

    return user;
  } catch (error: any) {
    console.error("Erreur lors de la connexion Google:", error);
    
    // Gérer les erreurs spécifiques
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("La fenêtre de connexion a été fermée.");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("La fenêtre popup a été bloquée. Veuillez autoriser les popups pour ce site.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Erreur de réseau. Vérifiez votre connexion internet.");
    } else if (error.code === "auth/unauthorized-domain") {
      const currentDomain = window.location.hostname;
      const currentUrl = window.location.href;
      const fullDomain = window.location.host; // Inclut le port si présent
      
      // Message d'erreur détaillé avec instructions
      const errorMessage = `
🔒 DOMAINE NON AUTORISÉ

Domaine actuel : ${fullDomain}
Hostname : ${currentDomain}
URL complète : ${currentUrl}

📋 POUR CORRIGER :

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet Firebase
3. Cliquez sur "Authentication" dans le menu de gauche
4. Cliquez sur l'onglet "Settings" (Paramètres)
5. Descendez jusqu'à "Authorized domains"
6. Cliquez sur "Add domain"
7. Ajoutez : ${currentDomain}
   ${fullDomain !== currentDomain ? `   OU : ${fullDomain}` : ''}
8. Cliquez sur "Add" ou "Save"
9. Attendez 10-30 secondes
10. Rechargez cette page et réessayez

💡 Note : Si vous êtes sur localhost, ajoutez "localhost" (sans le port)
      `.trim();
      
      console.error("Domaine non autorisé:", {
        hostname: currentDomain,
        host: fullDomain,
        href: currentUrl,
      });
      
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Erreur lors de la connexion avec Google.");
    }
  }
};

/**
 * Déconnexion
 */
export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    // Si Firebase n'est pas configuré, nettoyer juste localStorage
    localStorage.removeItem("bartender-auth");
    localStorage.removeItem("bartender-user-id");
    localStorage.removeItem("bartender-username");
    localStorage.removeItem("bartender-auth-provider");
    localStorage.removeItem("bartender-user");
    localStorage.removeItem("bartender-user-role");
    return;
  }

  try {
    await signOut(auth);
    
    // Nettoyer localStorage
    localStorage.removeItem("bartender-auth");
    localStorage.removeItem("bartender-user-id");
    localStorage.removeItem("bartender-username");
    localStorage.removeItem("bartender-auth-provider");
    localStorage.removeItem("bartender-user");
    localStorage.removeItem("bartender-user-role");
  } catch (error: any) {
    console.error("Erreur lors de la déconnexion:", error);
    throw new Error(error.message || "Erreur lors de la déconnexion.");
  }
};

/**
 * Obtenir l'utilisateur actuel depuis localStorage
 */
export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("bartender-user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem("bartender-auth") === "authenticated";
};

/**
 * Obtenir le provider d'authentification utilisé
 */
export const getAuthProvider = (): string | null => {
  return localStorage.getItem("bartender-auth-provider");
};

