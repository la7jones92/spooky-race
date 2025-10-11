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

// GET /api/teamTasks?entryCode=GHO5T
app.get("/api/teamTasks", async (req, res) => {
  const entryCode = (req.query.entryCode as string | undefined)?.trim();
  if (!entryCode) {
    return res.status(400).json({ error: "Missing entryCode" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamTasks = await prisma.teamTask.findMany({
      where: { teamId: team.id },
      orderBy: { order: "asc" },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            detailedDescription: true,
            bonusPhotoDescription: true,
            points: true,
            bonusPoints: true,
            hint: true,
            hintPointsPenalty: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            // 🚫 no completionCode here – keep it server-only
          },
        },
        bonusPhoto: true,
      },
    });

    res.json(teamTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team tasks" });
  }
});

// GET /api/team?entryCode=GHO5T
app.get("/api/team", async (req, res) => {
  const entryCode = (req.query.entryCode as string | undefined)?.trim();
  if (!entryCode) {
    return res.status(400).json({ error: "Missing entryCode" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: {
        id: true,
        name: true,
        hasEntered: true,
        startedAt: true,
        finishedAt: true,
        totalPoints: true,
        totalBonusPoints: true,
        totalHintPenalties: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team info" });
  }
});

app.post("/api/teamTasks/hint", async (req, res) => {
  const { entryCode, taskId } = req.body ?? {};

  if (!entryCode || !taskId) {
    return res.status(400).json({ error: "Missing entryCode or taskId" });
  }

  try {
    // 1) Find the team by entry code (CITEXT unique in DB)
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: { id: true, totalHintPenalties: true },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    // 2) Find the per-team task (include the template Task for hint/penalty)
    const teamTask = await prisma.teamTask.findUnique({
      where: { teamId_taskId: { teamId: team.id, taskId } },
      include: { task: { select: { hint: true, hintPointsPenalty: true } } },
    });
    if (!teamTask) return res.status(404).json({ error: "TeamTask not found" });

    const hint = teamTask.task?.hint ?? null;
    const penalty = teamTask.task?.hintPointsPenalty ?? 0;

    if (!hint) {
      return res.status(400).json({ error: "No hint available for this task" });
    }
    
const result = await prisma.$transaction(async (tx) => {
  if (!teamTask.hintUsed) {
    const updatedTeamTask = await tx.teamTask.update({
      where: { id: teamTask.id },
      data: { hintUsed: true },
      select: { id: true, taskId: true, hintUsed: true },
    });
    const updatedTeam = await tx.team.update({
      where: { id: team.id },
      data: { totalHintPenalties: team.totalHintPenalties + penalty },
      select: { totalHintPenalties: true },
    });
    return { updatedTeamTask, updatedTeam };
  } else {
    return {
      updatedTeamTask: {
        id: teamTask.id,
        taskId: teamTask.taskId,
        hintUsed: true,
      },
      updatedTeam: { totalHintPenalties: team.totalHintPenalties },
    };
  }
});

const { updatedTeamTask, updatedTeam } = result;

    return res.json({
      teamTask: updatedTeamTask,
      hint,
      hintPointsPenalty: penalty,
      totals: { totalHintPenalties: updatedTeam.totalHintPenalties },
    });
  } catch (err) {
    console.error("POST /api/teamTasks/hint failed:", err);
    return res.status(500).json({ error: "Failed to use hint" });
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