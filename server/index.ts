import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  getSalesPrediction,
  getReorderRecommendations,
  getProfitabilityAnalysis,
  getPriceOptimization,
  getInsights,
  getPromotionRecommendations,
  getStockoutPrediction,
  getMenuOptimization,
  getTemporalTrends,
  getDynamicPricing,
  getRevenueForecast,
  getSalesReport,
  getTaxReport,
  getFoodWinePairing,
} from "./routes/analytics";

import { searchImages } from "./routes/image-search";
import { handleSAQScrape } from "./routes/saq-scraper";
import {
  createConnectionToken,
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
} from "./routes/stripe";
import {
  getStripeKeys,
  saveStripeKeys,
  deleteStripeKeys,
} from "./routes/stripe-keys";
import { authenticateToken } from "./middleware/auth";

export function createServer() {
  console.log("[Express] createServer() appelé");
  const app = express();
  console.log("[Express] Application Express créée");

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`[Express] ${req.method} ${req.url}`);
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // SAQ product scraper endpoint
  app.get("/api/saq-scrape", handleSAQScrape);

  // Image search endpoint (server-side only, API key stays secure)
  app.post("/api/image-search", searchImages);

  // Stripe Terminal endpoints
  app.post("/api/stripe/connection-token", createConnectionToken);
  app.post("/api/stripe/create-payment-intent", createPaymentIntent);
  app.post("/api/stripe/confirm-payment", confirmPayment);
  app.post("/api/stripe/cancel-payment", cancelPayment);

  // Stripe Keys management endpoints
  app.get("/api/stripe-keys", authenticateToken, getStripeKeys);
  app.post("/api/stripe-keys", authenticateToken, saveStripeKeys);
  app.delete("/api/stripe-keys", authenticateToken, deleteStripeKeys);

  // Products API - DÉSACTIVÉ (utiliser Firestore côté client)
  // app.get("/api/products", getProducts);
  // app.get("/api/products/:id", getProduct);
  // app.post("/api/products", createProduct);
  // app.put("/api/products/:id", updateProduct);
  // app.delete("/api/products/:id", deleteProduct);
  // app.patch("/api/products/:id/quantity", updateProductQuantity);

  // Recipes API - DÉSACTIVÉ (utiliser Firestore côté client)
  // app.get("/api/recipes", getRecipes);
  // app.get("/api/recipes/:id", getRecipe);
  // app.post("/api/recipes", createRecipe);
  // app.put("/api/recipes/:id", updateRecipe);
  // app.delete("/api/recipes/:id", deleteRecipe);

  // Analytics & AI endpoints
  app.post("/api/analytics/sales-prediction", authenticateToken, getSalesPrediction);
  app.post("/api/analytics/reorder-recommendations", authenticateToken, getReorderRecommendations);
  app.post("/api/analytics/profitability", authenticateToken, getProfitabilityAnalysis);
  app.post("/api/analytics/price-optimization", authenticateToken, getPriceOptimization);
  app.post("/api/analytics/insights", authenticateToken, getInsights);
  app.post("/api/analytics/promotion-recommendations", authenticateToken, getPromotionRecommendations);
  app.post("/api/analytics/stockout-prediction", authenticateToken, getStockoutPrediction);
  app.post("/api/analytics/menu-optimization", authenticateToken, getMenuOptimization);
  app.post("/api/analytics/temporal-trends", authenticateToken, getTemporalTrends);
  app.post("/api/analytics/dynamic-pricing", authenticateToken, getDynamicPricing);
  app.post("/api/analytics/revenue-forecast", authenticateToken, getRevenueForecast);
  app.post("/api/analytics/sales-report", authenticateToken, getSalesReport);
  app.post("/api/analytics/tax-report", authenticateToken, getTaxReport);
  app.post("/api/analytics/food-wine-pairing", authenticateToken, getFoodWinePairing);

  // 404 handler for API routes
  app.use("/api", (req, res) => {
    console.log(`[Express] 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found" });
  });

  console.log("[Express] Toutes les routes configurées, retour de l'app");
  return app;
}
