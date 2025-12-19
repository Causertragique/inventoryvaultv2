import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
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
  const jsonParser = express.json({
    verify: (req, _res, buf) => {
      (req as Request & { rawBody?: string }).rawBody = buf.toString("utf-8");
    },
  });
  app.use(jsonParser);
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

  const isJsonSyntaxError = (err: any): boolean => {
    return (
      err &&
      err instanceof SyntaxError &&
      (err.type === "entity.parse.failed" || err.status === 400)
    );
  };

  app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }
      if (isJsonSyntaxError(err)) {
        console.warn(`[Express] Invalid JSON payload: ${err.message}`);
        const rawBody = (req as Request & { rawBody?: string }).rawBody;
        if (rawBody) {
          console.debug(
            `[Express] Raw body (${rawBody.length} bytes): ${rawBody}`
          );
        }
        return res.status(400).json({
          error: "Invalid JSON payload",
          message: err.message,
        });
      }
      next(err);
    }
  );

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error("[Express] Unhandled error:", err);
    const status = err?.status || 500;
    res.status(status).json({
      error: err?.message || "Internal server error",
    });
  });

  console.log("[Express] Toutes les routes configurées, retour de l'app");
  return app;
}
