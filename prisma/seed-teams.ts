// prisma/seed-teams.ts
import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

// 10 spooky short codes (unique, case-insensitive thanks to CITEXT on Team.entryCode)
const ENTRY_CODES = [
  "GHO5T",
  "HEX9",
  "BOO7",
  "R1PPR",
  "PH4NT",
  "C0FFN",
  "W1TCH",
  "SHDW8",
  "SP00K",
  "GR1M",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  // Pull all template tasks
  const tasks = await prisma.task.findMany({
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  if (!tasks.length) {
    throw new Error("No tasks found. Seed tasks before seeding teams.");
  }

  // Find the designated first task (order === 0)
  const startTask = tasks.find((t) => t.order === 1);
  if (!startTask) {
    throw new Error(
      "No task with order === 0 found. Please set one template task to order 0."
    );
  }

  // Remaining tasks to randomize after the first
  const remaining = tasks.filter((t) => t.id !== startTask.id);

  for (const code of ENTRY_CODES) {
    // Create or reuse team
    const team = await prisma.team.upsert({
      where: { entryCode: code },
      update: {},
      create: {
        entryCode: code,
        hasEntered: false,
        totalPoints: 0,
        totalBonusPoints: 0,
        totalHintPenalties: 0,
      },
    });

    // Clear any existing per-team tasks (idempotent seed)
    await prisma.teamTask.deleteMany({ where: { teamId: team.id } });

    // Construct the per-team ordered list: [startTask, ...shuffled(remaining)]
    const sequence = [startTask, ...shuffle(remaining)];

    // Create TeamTask rows
    await prisma.$transaction(
      sequence.map((t, idx) =>
        prisma.teamTask.create({
          data: {
            teamId: team.id,
            taskId: t.id,
            order: idx + 1, // 1-based sequence
            status:
              idx === 0 ? TaskStatus.UNLOCKED : TaskStatus.LOCKED,
            unlockedAt: idx === 0 ? new Date() : null,
          },
        })
      )
    );

    console.log(
      `Seeded team ${code}: ${sequence.length} tasks (first is order-0 template).`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });