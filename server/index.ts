// server/index.ts
import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json({ limit: "10mb" }));

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
            // hint: true,
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

app.post("/api/teamTasks/skip", async (req, res) => {
  const { entryCode, taskId } = req.body ?? {};
  if (!entryCode || !taskId) {
    return res.status(400).json({ error: "Missing entryCode or taskId" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: { id: true },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const current = await prisma.teamTask.findUnique({
      where: { teamId_taskId: { teamId: team.id, taskId } },
      select: { id: true, taskId: true, order: true, status: true },
    });
    if (!current) return res.status(404).json({ error: "TeamTask not found" });
    if (current.status === "COMPLETED") {
      return res.status(400).json({ error: "Task already completed" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) Mark current as SKIPPED (idempotent)
      const updatedCurrent =
        current.status === "SKIPPED"
          ? await tx.teamTask.findUnique({
              where: { id: current.id },
              select: { id: true, taskId: true, status: true, skippedAt: true },
            })
          : await tx.teamTask.update({
              where: { id: current.id },
              data: { status: "SKIPPED", skippedAt: new Date(), pointsAwarded: 0 },
              select: { id: true, taskId: true, status: true, skippedAt: true },
            });

      // 2) Unlock next (if locked)
      const next = await tx.teamTask.findUnique({
        where: { teamId_order: { teamId: team.id, order: current.order + 1 } },
        select: { id: true, taskId: true, status: true, unlockedAt: true },
      });

      let updatedNext = null as
        | { id: string; taskId: string; status: string; unlockedAt: Date | null }
        | null;

      if (next && next.status === "LOCKED") {
        updatedNext = await tx.teamTask.update({
          where: { id: next.id },
          data: { status: "UNLOCKED", unlockedAt: new Date() },
          select: { id: true, taskId: true, status: true, unlockedAt: true },
        });
      } else if (next) {
        updatedNext = next;
      }

      return { updatedCurrent, updatedNext };
    });

    return res.json({ current: result.updatedCurrent, next: result.updatedNext });
  } catch (err) {
    console.error("POST /api/teamTasks/skip failed:", err);
    return res.status(500).json({ error: "Failed to skip task" });
  }
});

// Submit completion code for a task (NOT Task 1)
app.post("/api/teamTasks/submit", async (req, res) => {
  const { entryCode, taskId, code } = req.body ?? {};
  if (!entryCode || !taskId || typeof code !== "string") {
    return res.status(400).json({ error: "Missing entryCode, taskId or code" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: { id: true, totalPoints: true },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const teamTask = await prisma.teamTask.findUnique({
      where: { teamId_taskId: { teamId: team.id, taskId } },
      include: {
        task: { select: { completionCode: true, points: true, hintPointsPenalty: true, order: true } },
      },
    });
    if (!teamTask) return res.status(404).json({ error: "TeamTask not found" });

    // Task 1 uses registration flow; block code submit
    if (!teamTask.task?.completionCode) {
      return res.status(400).json({ error: "This task has no completion code. Use /api/team/register for Task 1." });
    }

    const submitted = code.trim().toUpperCase();
    const expected = (teamTask.task.completionCode ?? "").trim().toUpperCase();

    if (submitted !== expected) {
      // Return a soft FAILURE (200), so UI can show a friendly error/jiggle
      return res.json({ result: "FAILURE" });
    }

    // Success path (idempotent)
    const result = await prisma.$transaction(async (tx) => {
      // If already completed, don't double-award
      let updatedCurrent = await tx.teamTask.findUnique({
        where: { id: teamTask.id },
        select: { id: true, taskId: true, status: true, completedAt: true, pointsAwarded: true, hintUsed: true, order: true },
      });

      let updatedTeam = { totalPoints: team.totalPoints };
      let updatedNext: { id: string; taskId: string; status: string; unlockedAt: Date | null } | null = null;

      if (updatedCurrent?.status !== "COMPLETED") {
        const base = teamTask.task?.points ?? 0;
        const penalty = (updatedCurrent?.hintUsed ? (teamTask.task?.hintPointsPenalty ?? 0) : 0);
        const awarded = Math.max(0, base - penalty);

        updatedCurrent = await tx.teamTask.update({
          where: { id: teamTask.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            pointsAwarded: awarded,
          },
          select: { id: true, taskId: true, status: true, completedAt: true, pointsAwarded: true, hintUsed: true, order: true },
        });

        updatedTeam = await tx.team.update({
          where: { id: team.id },
          data: { totalPoints: team.totalPoints + awarded },
          select: { totalPoints: true },
        });

        // Unlock next by order
        const next = await tx.teamTask.findUnique({
          where: { teamId_order: { teamId: team.id, order: (updatedCurrent.order ?? 0) + 1 } },
          select: { id: true, taskId: true, status: true, unlockedAt: true },
        });
        if (next && next.status === "LOCKED") {
          updatedNext = await tx.teamTask.update({
            where: { id: next.id },
            data: { status: "UNLOCKED", unlockedAt: new Date() },
            select: { id: true, taskId: true, status: true, unlockedAt: true },
          });
        } else if (next) {
          updatedNext = next;
        }
      }

      return { updatedCurrent, updatedNext, updatedTeam };
    });

    return res.json({
      result: "SUCCESS",
      current: result.updatedCurrent,
      next: result.updatedNext,
      totals: { totalPoints: result.updatedTeam.totalPoints },
    });
  } catch (err) {
    console.error("POST /api/teamTasks/submit failed:", err);
    return res.status(500).json({ error: "Failed to submit code" });
  }
});


// Register team (Task 1) — still applies hint penalty if hint was used
app.post("/api/team/register", async (req, res) => {
  const { entryCode, teamName } = req.body ?? {};
  if (!entryCode || !teamName) {
    return res.status(400).json({ error: "Missing entryCode or teamName" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: { id: true, name: true, hasEntered: true, startedAt: true, totalPoints: true },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const first = await prisma.teamTask.findUnique({
      where: { teamId_order: { teamId: team.id, order: 1 } },
      include: { task: { select: { points: true, hintPointsPenalty: true } } },
    });
    if (!first) return res.status(404).json({ error: "First task not found" });

    const result = await prisma.$transaction(async (tx) => {
      // Update team basics; start timer if not started
      const startedAt = team.startedAt ?? new Date();
      const updatedTeamBasics = await tx.team.update({
        where: { id: team.id },
        data: { name: teamName, hasEntered: true, startedAt },
        select: { name: true, hasEntered: true, startedAt: true, totalPoints: true },
      });

      let updatedCurrent = await tx.teamTask.findUnique({
        where: { id: first.id },
        select: { id: true, taskId: true, status: true, completedAt: true, hintUsed: true, pointsAwarded: true, order: true },
      });

      let updatedTotals = { totalPoints: updatedTeamBasics.totalPoints };
      let updatedNext: { id: string; taskId: string; status: string; unlockedAt: Date | null } | null = null;

      if (updatedCurrent?.status !== "COMPLETED") {
        const base = first.task?.points ?? 0;
        const penalty = (updatedCurrent?.hintUsed ? (first.task?.hintPointsPenalty ?? 0) : 0);
        const awarded = Math.max(0, base - penalty);

        updatedCurrent = await tx.teamTask.update({
          where: { id: first.id },
          data: { status: "COMPLETED", completedAt: new Date(), pointsAwarded: awarded },
          select: { id: true, taskId: true, status: true, completedAt: true, hintUsed: true, pointsAwarded: true, order: true },
        });

        const t2 = await tx.team.update({
          where: { id: team.id },
          data: { totalPoints: updatedTeamBasics.totalPoints + awarded },
          select: { totalPoints: true },
        });
        updatedTotals = { totalPoints: t2.totalPoints };

        const next = await tx.teamTask.findUnique({
          where: { teamId_order: { teamId: team.id, order: 2 } },
          select: { id: true, taskId: true, status: true, unlockedAt: true },
        });
        if (next && next.status === "LOCKED") {
          updatedNext = await tx.teamTask.update({
            where: { id: next.id },
            data: { status: "UNLOCKED", unlockedAt: new Date() },
            select: { id: true, taskId: true, status: true, unlockedAt: true },
          });
        } else if (next) {
          updatedNext = next;
        }
      }

      return { updatedTeamBasics, updatedCurrent, updatedNext, updatedTotals };
    });

    return res.json({
      result: "SUCCESS",
      team: result.updatedTeamBasics,
      current: result.updatedCurrent,
      next: result.updatedNext,
      totals: result.updatedTotals,
    });
  } catch (err) {
    console.error("POST /api/team/register failed:", err);
    return res.status(500).json({ error: "Failed to register team" });
  }
});

app.post("/api/teamTasks/bonusPhoto", async (req, res) => {
  const { entryCode, taskId, filename, contentType, sizeBytes, dataBase64 } = req.body ?? {};
  if (!entryCode || !taskId || !dataBase64 || !contentType) {
    return res.status(400).json({ error: "Missing entryCode, taskId, dataBase64 or contentType" });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { entryCode },
      select: { id: true, totalBonusPoints: true },
    });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const tt = await prisma.teamTask.findUnique({
      where: { teamId_taskId: { teamId: team.id, taskId } },
      include: { task: { select: { bonusPoints: true } } },
    });
    if (!tt) return res.status(404).json({ error: "TeamTask not found" });
    if (tt.status !== "COMPLETED") {
      return res.status(400).json({ error: "Bonus photo allowed only after completion" });
    }

    // Decode & enforce size
    const buffer = Buffer.from(dataBase64, "base64");
    const MAX = 5 * 1024 * 1024; // 5 MB
    if (buffer.length > MAX) {
      return res.status(413).json({ error: "Image too large after compression (>5MB)" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // If we already have a photo & award, just return current state (idempotent)
      if (tt.bonusPhotoId && (tt.bonusAwarded ?? 0) > 0) {
        const current = await tx.teamTask.findUnique({
          where: { id: tt.id },
          select: { id: true, taskId: true, bonusAwarded: true, bonusPhotoId: true },
        });
        return { updatedTT: current!, updatedTeam: { totalBonusPoints: team.totalBonusPoints } };
      }

      // Create the Upload row
      const upload = await tx.upload.create({
        data: {
          blob: buffer,
          contentType,
          sizeBytes: buffer.length,
          filename: filename ?? null,
          teamId: team.id,
        },
        select: { id: true },
      });

      // Link photo; award points only once
      const award = (tt.bonusAwarded ?? 0) > 0 ? 0 : (tt.task?.bonusPoints ?? 0);

      const updatedTT = await tx.teamTask.update({
        where: { id: tt.id },
        data: {
          bonusPhotoId: upload.id,
          bonusAwarded: (tt.bonusAwarded ?? 0) + award,
        },
        select: { id: true, taskId: true, bonusAwarded: true, bonusPhotoId: true },
      });

      let updatedTeam = { totalBonusPoints: team.totalBonusPoints };
      if (award > 0) {
        const t2 = await tx.team.update({
          where: { id: team.id },
          data: { totalBonusPoints: team.totalBonusPoints + award },
          select: { totalBonusPoints: true },
        });
        updatedTeam = { totalBonusPoints: t2.totalBonusPoints };
      }

      return { updatedTT, updatedTeam };
    });

    return res.json({
      teamTask: result.updatedTT,
      totals: { totalBonusPoints: result.updatedTeam.totalBonusPoints },
    });
  } catch (err) {
    console.error("POST /api/teamTasks/bonusPhoto failed:", err);
    return res.status(500).json({ error: "Failed to upload bonus photo" });
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