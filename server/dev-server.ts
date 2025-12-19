// server/dev-server.ts
import cors from "cors";
import { createServer } from "./index";

console.log("=== DEV SERVER FILE LOADED ===");

try {
  const maybeAppOrServer: any = createServer();
  console.log("createServer() returned:", typeof maybeAppOrServer);

  // Si c'est un Express app, il a .use et .listen
  const isExpressApp =
    maybeAppOrServer &&
    typeof maybeAppOrServer.use === "function" &&
    typeof maybeAppOrServer.listen === "function";

  // Si c'est déjà un http.Server, il a .listen mais pas .use
  const isHttpServer =
    maybeAppOrServer &&
    typeof maybeAppOrServer.listen === "function" &&
    typeof maybeAppOrServer.use !== "function";

  const port = Number(process.env.PORT ?? 3000);

  if (isExpressApp) {
    const app = maybeAppOrServer;

    // CORS DEV
    app.use(
      cors({
        origin: true, // si tu veux strict: "http://localhost:5173"
        credentials: true,
      })
    );

    // Route test rapide
    app.get("/health", (_req: any, res: any) => res.json({ ok: true }));

    // Error handler (4 params)
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error("[Express] Unhandled error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    });

    console.log("ABOUT TO LISTEN (express)");
    app.listen(port, () => {
      console.log(`[Dev Server] API listening on http://localhost:${port}`);
      console.log(`[Dev Server] Health check: http://localhost:${port}/health`);
    });
  } else if (isHttpServer) {
    const server = maybeAppOrServer;
    console.log("ABOUT TO LISTEN (http server)");
    server.listen(port, () => {
      console.log(`[Dev Server] HTTP server listening on http://localhost:${port}`);
    });
  } else {
    console.error(
      "[Dev Server] createServer() did not return an Express app nor an HTTP server."
    );
    console.error("Value:", maybeAppOrServer);
    process.exit(1);
  }

  process.on("uncaughtException", (err) => {
    console.error("[Dev Server] Uncaught exception:", err);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[Dev Server] Unhandled rejection:", reason);
  });
} catch (error) {
  console.error("[Dev Server] Fatal error at startup:", error);
  process.exit(1);
}
