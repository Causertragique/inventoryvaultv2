import cors from "cors";
import { createServer } from "./index";

try {
  const app = createServer();

  // Allow cross-origin requests from the Vite dev server
  app.use(cors({ origin: true, credentials: true }));

  // Global error handler
  app.use((err: any, _req: any, res: any) => {
    console.error("[Express] Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  
  // Keep process alive and handle errors
  process.on('uncaughtException', (err: any) => {
    console.error("[Dev Server] Uncaught exception:", err);
  });
  
  process.on('unhandledRejection', (reason: any) => {
    console.error("[Dev Server] Unhandled rejection:", reason);
  });
  
} catch (error) {
  console.error("[Dev Server] Fatal error:", error);
  process.exit(1);
}
