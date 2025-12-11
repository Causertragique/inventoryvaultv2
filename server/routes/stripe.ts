import { RequestHandler } from "express";
import Stripe from "stripe";
// import db from "../database"; // DÉSACTIVÉ - Utiliser Firestore ou variables d'environnement
import { getUserId } from "../middleware/auth";

/**
 * Get Stripe instance for the current user
 * TODO: Migrer vers Firestore ou variables d'environnement
 */
function getStripeForUser(userId: string | null): Stripe | null {
  if (!userId) return null;

  // DÉSACTIVÉ - Nécessite migration vers Firestore
  // Get user's Stripe keys from database
  // const keys = db.prepare("SELECT * FROM stripe_keys WHERE userId = ?").get(userId) as any;

  // Temporairement, utiliser les variables d'environnement si disponibles
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY not configured");
    return null;
  }

  // Initialize Stripe with secret key
  return new Stripe(secretKey, {
    apiVersion: "2020-08-27",
  });
}

/**
 * Create a connection token for Stripe Terminal
 * This allows the client to connect to a Terminal reader
 */
export const createConnectionToken: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stripe = getStripeForUser(userId);

    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe keys not configured. Please add your Stripe keys in Settings." 
      });
    }

    const connectionToken = await stripe.terminal.connectionTokens.create();

    res.json({
      secret: connectionToken.secret,
    });
  } catch (error: any) {
    console.error("Error creating connection token:", error);
    res.status(500).json({
      error: "Failed to create connection token",
      message: error.message,
    });
  }
};

/**
 * Create a PaymentIntent for Terminal payment
 */
export const createPaymentIntent: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { amount, currency = "cad", metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const stripe = getStripeForUser(userId);

    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe keys not configured. Please add your Stripe keys in Settings." 
      });
    }

    // Create PaymentIntent with payment method types for Terminal
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: {
        ...metadata,
        source: "terminal",
        userId: userId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
      message: error.message,
    });
  }
};

/**
 * Confirm a payment after Terminal collection
 */
export const confirmPayment: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID required" });
    }

    const stripe = getStripeForUser(userId);

    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe keys not configured. Please add your Stripe keys in Settings." 
      });
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify that the payment intent belongs to this user
    if (paymentIntent.metadata?.userId !== userId) {
      return res.status(403).json({ error: "Payment intent does not belong to this user" });
    }

    if (paymentIntent.status === "succeeded") {
      res.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
        },
      });
    } else {
      res.status(400).json({
        error: "Payment not completed",
        status: paymentIntent.status,
      });
    }
  } catch (error: any) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      error: "Failed to confirm payment",
      message: error.message,
    });
  }
};

/**
 * Cancel a payment intent
 */
export const cancelPayment: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID required" });
    }

    const stripe = getStripeForUser(userId);

    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe keys not configured. Please add your Stripe keys in Settings." 
      });
    }

    // Verify that the payment intent belongs to this user before canceling
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.metadata?.userId !== userId) {
      return res.status(403).json({ error: "Payment intent does not belong to this user" });
    }

    const canceledIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.json({
      success: true,
      paymentIntent: {
        id: canceledIntent.id,
        status: canceledIntent.status,
      },
    });
  } catch (error: any) {
    console.error("Error canceling payment:", error);
    res.status(500).json({
      error: "Failed to cancel payment",
      message: error.message,
    });
  }
};

