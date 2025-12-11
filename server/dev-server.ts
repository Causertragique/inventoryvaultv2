import cors from "cors";
import { createServer } from "./index";

try {
  const app = createServer();
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  // Allow cross-origin requests from the Vite dev server
  app.use(cors({ origin: true, credentials: true }));

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Express] Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  const server = app.listen(port, () => {
    console.log(`🔌 Backend (dev) running at http://localhost:${port}`);
    console.log(`📡 API base: http://localhost:${port}/api`);
  });
  
  // Keep process alive and handle errors
  process.on('uncaughtException', (err: any) => {
    console.error("[Dev Server] Uncaught exception:", err);
  });
  
  process.on('unhandledRejection', (reason: any, promise: any) => {
    console.error("[Dev Server] Unhandled rejection:", reason);
  });
  
} catch (error) {
  console.error("[Dev Server] Fatal error:", error);
  process.exit(1);
}
