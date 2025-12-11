import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange } from "../services/firestore/auth";
import { getUserProfile } from "../services/firestore/users";
import { UserRole, normalizeUserRole } from "@/lib/permissions";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthChange((user) => {
        setUser(user);
        setLoading(false);
        
        // Synchroniser avec localStorage pour compatibilité avec le code existant
        if (user) {
          localStorage.setItem("bartender-auth", "authenticated");
          localStorage.setItem("bartender-user-id", user.uid);
          localStorage.setItem("bartender-username", user.email || user.displayName || "User");
          localStorage.setItem("bartender-user", JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }));

          (async () => {
            try {
              const profile = await getUserProfile(user.uid);
              const normalizedRole = normalizeUserRole(profile?.role);
              if (normalizedRole) {
                const currentRole = localStorage.getItem("bartender-user-role");
                if (currentRole !== normalizedRole) {
                  localStorage.setItem("bartender-user-role", normalizedRole);
                }
              } else {
                console.warn("Profil utilisateur sans role valide dans Firestore:", user.uid);
              }
            } catch (err) {
              console.error("Erreur lors du chargement du rôle utilisateur:", err);
            }
          })();
        } else {
          localStorage.removeItem("bartender-auth");
          localStorage.removeItem("bartender-user-id");
          localStorage.removeItem("bartender-username");
          localStorage.removeItem("bartender-user");
          localStorage.removeItem("bartender-user-role");
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Erreur useAuth:", error);
      // En cas d'erreur Firebase, on débloque quand même
      setLoading(false);
      setUser(null);
    }
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
