// server/index.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// --- API routes ---
app.get("/health", (_req, res) => res.send("ok"));
app.get("/api/tasks", async (_req, res) => {
  const items = await prisma.task.findMany({
    orderBy: [{ order: "desc" }],
  });
  res.json(items);
});

// --- Serve built SPA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "client", "dist");

app.use(express.static(distDir));
app.use((_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// const PORT = process.env.PORT || 8080;
app.listen(8080, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${8080}`);
});