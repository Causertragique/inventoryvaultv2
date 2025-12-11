import { Request, Response, NextFunction } from "express";

// Middleware d'auth simplifié compatible avec ton frontend
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const username = req.headers["x-username"] as string | undefined;

    // Log debug
    console.log("[AuthMiddleware] Checking auth…");
    console.log("  Authorization:", authHeader);
    console.log("  Username:", username);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
        hint: "Send 'Authorization: Bearer <token>'",
      });
    }

    const token = authHeader.split(" ")[1];

    // Dans ta version actuelle, le token n'est pas réellement vérifié
    // (tu n'as pas encore implémenté JWT ou autre)
    if (!token || token.length < 10) {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    // On attache l'utilisateur au request pour la suite
    (req as any).user = {
      username: username || "unknown",
      token,
    };

    next();
  } catch (err: any) {
    console.error("[AuthMiddleware] Unexpected error:", err.message);
    return res.status(500).json({
      error: "Internal auth middleware error",
      details: err.message,
    });
  }
}

/**
 * Get user ID from request (can be from header, token, or session)
 */
export function getUserId(req: Request): string | null {
  const userId = req.headers["x-user-id"] as string;
  if (userId) {
    console.log("[Auth] UserId trouvé dans header x-user-id:", userId);
    return userId;
  }

  // Try to get from auth token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "").trim();
      console.log("[Auth] Token extrait (premiers 20 caractères):", token.substring(0, 20));

      // For now, if token is "authenticated", we need to get username from header
      // In production, this would be a JWT token with userId embedded
      if (token === "authenticated") {
        const username = req.headers["x-username"] as string;
        console.log("[Auth] Token est 'authenticated', username:", username);
        if (username) {
          // Get user ID from database using username
          const db = require("../database").default;
          let user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as any;
          
          // If user doesn't exist, create it automatically (for dev/Firebase users)
          if (!user) {
            console.log("[Auth] User non trouvé, création automatique pour:", username);
            const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, NULL)").run(userId, username);
            user = { id: userId };
            console.log("[Auth] Nouvel utilisateur créé avec ID:", userId);
          }
          
          console.log("[Auth] User trouvé/créé dans DB:", user?.id || "Aucun");
          return user?.id || null;
        }
      }
      // Decode simple token (format: userId:username or just userId)
      if (token.includes(":")) {
        const extractedUserId = token.split(":")[0];
        console.log("[Auth] UserId extrait du token (format userId:username):", extractedUserId);
        return extractedUserId;
      }
      // If token is just userId
      if (token && token !== "authenticated") {
        console.log("[Auth] Token utilisé directement comme userId:", token);
        return token;
      }
    } catch (error: any) {
      console.error("[Auth] Erreur lors du décodage du token:", error.message);
      console.error("[Auth] Stack:", error.stack);
    }
  } else {
    console.log("[Auth] Aucun header Authorization trouvé");
  }

  console.log("[Auth] Aucun userId trouvé, retour null");
  return null;
}

/**
 * Middleware to authenticate requests using token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Attach user info to request
  (req as any).user = { userId };
  next();
}

/**
 * Get username from request
 */
export function getUsername(req: Request): string | null {
  const username = req.headers["x-username"] as string;
  if (username) return username;

  // Try to get from auth token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // In production, decode JWT token here
  }

  return null;
}
