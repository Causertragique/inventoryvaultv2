import { RequestHandler } from "express";
// import db from "../database"; // DÉSACTIVÉ - Utiliser Firestore ou variables d'environnement
import { getUserId } from "../middleware/auth";

/**
 * GET /api/stripe-keys - Get Stripe keys for current user
 * TODO: Migrer vers Firestore
 */
export const getStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // DÉSACTIVÉ - Nécessite migration vers Firestore
    // const keys = db.prepare("SELECT * FROM stripe_keys WHERE userId = ?").get(userId);

    // Temporairement, retourner les valeurs des variables d'environnement
    res.json({
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      terminalLocationId: process.env.STRIPE_TERMINAL_LOCATION_ID || "",
      isTestMode: true,
    });
  } catch (error: any) {
    console.error("Error getting Stripe keys:", error);
    res.status(500).json({
      error: "Failed to get Stripe keys",
      message: error.message,
    });
  }
};

/**
 * POST /api/stripe-keys - Save or update Stripe keys for current user
 */
export const saveStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // DÉSACTIVÉ - Utiliser les variables d'environnement pour l'instant
    console.warn("⚠️ Stripe keys should be configured via environment variables");
    
    res.json({
      success: true,
      message: "Please configure Stripe keys via environment variables (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_TERMINAL_LOCATION_ID)",
    });
  } catch (error: any) {
    console.error("Error saving Stripe keys:", error);
    res.status(500).json({
      error: "Failed to save Stripe keys",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/stripe-keys - Delete Stripe keys for current user
 * TODO: Migrer vers Firestore
 */
export const deleteStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // DÉSACTIVÉ - Les clés sont maintenant dans les variables d'environnement
    console.warn("⚠️ Stripe keys are configured via environment variables");

    res.json({ success: true, message: "Stripe keys are managed via environment variables" });
  } catch (error: any) {
    console.error("Error deleting Stripe keys:", error);
    res.status(500).json({
      error: "Failed to delete Stripe keys",
      message: error.message,
    });
  }
};

