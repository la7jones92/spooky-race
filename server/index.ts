// server/index.ts
import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/**
 * API routes (keep these ABOVE the SPA fallback)
 */
app.get("/health", (_req, res) => {
  res.send("ok");
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const items = await prisma.task.findMany({
      orderBy: { order: "asc" },
    });

    res.json(items);
  } catch (err) {
    console.error("GET /api/tasks failed:", err);
    res.status(500).json({ error: "Failed to load tasks" });
  }
});

/**
 * Static client (built by Vite/React)
 * In the container, process.cwd() === /app
 * Dockerfile copies client build to /app/client/dist
 */
const clientDist = path.join(process.cwd(), "client", "dist");

// Serve assets (js/css/img)
app.use(express.static(clientDist));

/**
 * SPA fallback for ANY non-API route.
 * We avoid wildcard route strings (like "*" or "/*") because path-to-regexp@7
 * changes their behavior and can crash. Middleware is simpler & robust.
 */
app.use((req, res, next) => {
  // Let API and health routes pass through
  if (req.path.startsWith("/api") || req.path === "/health") {
    return next();
  }
  res.sendFile(path.join(clientDist, "index.html"));
});

/**
 * Boot
 */
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${PORT}`);
  console.log(`Serving client from: ${clientDist}`);
});