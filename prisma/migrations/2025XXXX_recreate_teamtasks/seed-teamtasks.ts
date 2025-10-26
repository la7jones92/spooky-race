import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- ROUTE DEFINITIONS (using your task.order numbers) ---
const ROUTE_A_ORDER = [1, 2, 4, 5, 3, 6, 7, 8, 9];
const ROUTE_B_ORDER = [1, 2, 3, 4, 5, 7, 6, 8, 9];

async function main() {
  // fetch all teams
  const teams = await prisma.team.findMany({ orderBy: { entryCode: "asc" } });
  if (!teams.length) {
    console.error("❌ No teams found. Seed teams first.");
    return;
  }

  // fetch all template tasks
  const tasks = await prisma.task.findMany();
  const taskByOrder: Record<number, string> = {};
  tasks.forEach((t) => (taskByOrder[t.order] = t.id));

  console.log(`Found ${tasks.length} tasks and ${teams.length} teams.`);

  let routeToggle = true; // true = A, false = B
  for (const team of teams) {
    const route = routeToggle ? "A" : "B";
    routeToggle = !routeToggle;

    const sequence =
      route === "A"
        ? ROUTE_A_ORDER.map((o) => taskByOrder[o])
        : ROUTE_B_ORDER.map((o) => taskByOrder[o]);

    // clear any existing TeamTasks for this team
    await prisma.teamTask.deleteMany({ where: { teamId: team.id } });

    // create the new ordered set
    await prisma.$transaction(
      sequence.map((taskId, idx) =>
        prisma.teamTask.create({
          data: {
            teamId: team.id,
            taskId,
            order: idx + 1,
            status: idx === 0 ? "UNLOCKED" : "LOCKED",
            unlockedAt: idx === 0 ? new Date() : null,
          },
        })
      )
    );

    console.log(
      `✅ Re-seeded ${sequence.length} tasks for team ${team.entryCode} (Route ${route})`
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