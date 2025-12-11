import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange } from "../services/firestore/auth";
import { getUserProfile } from "../services/firestore/users";
import { UserRole } from "@/lib/permissions";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isValidRole = (role: unknown): role is UserRole =>
    role === "owner" || role === "admin" || role === "manager" || role === "employee";

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

          if (!localStorage.getItem("bartender-user-role")) {
            (async () => {
              try {
                const profile = await getUserProfile(user.uid);
                const role = profile?.role;
                if (role && isValidRole(role)) {
                  localStorage.setItem("bartender-user-role", role);
                }
              } catch (err) {
                console.error("Erreur lors du chargement du rôle utilisateur:", err);
              }
            })();
          }
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
