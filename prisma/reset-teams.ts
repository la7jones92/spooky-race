// prisma/reset-teams.ts
// Script to reset team(s) back to initial state
// Usage: npm run reset-teams -- TEAMCODE1 TEAMCODE2 ...
// Or: npm run reset-teams -- --all (to reset ALL teams)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetTeam(entryCode: string) {
  console.log(`\n🔄 Resetting team: ${entryCode}`);

  const team = await prisma.team.findUnique({
    where: { entryCode },
    include: {
      tasks: true,
      submissions: true,
      uploads: true,
    },
  });

  if (!team) {
    console.log(`❌ Team not found: ${entryCode}`);
    return;
  }

  console.log(`   Found team: ${team.name || "(unnamed)"} (ID: ${team.id})`);

  // 1. Delete all submissions
  const deletedSubmissions = await prisma.submission.deleteMany({
    where: { teamId: team.id },
  });
  console.log(`   ✅ Deleted ${deletedSubmissions.count} submission(s)`);

  // 2. Delete all uploads
  const deletedUploads = await prisma.upload.deleteMany({
    where: { teamId: team.id },
  });
  console.log(`   ✅ Deleted ${deletedUploads.count} upload(s)`);

  // 3. Reset all TeamTasks
  const teamTasks = await prisma.teamTask.findMany({
    where: { teamId: team.id },
    orderBy: { order: "asc" },
  });

  for (const tt of teamTasks) {
    const isFirstTask = tt.order === 1;
    
    await prisma.teamTask.update({
      where: { id: tt.id },
      data: {
        status: isFirstTask ? "UNLOCKED" : "LOCKED",
        unlockedAt: isFirstTask ? new Date() : null,
        completedAt: null,
        skippedAt: null,
        hintUsed: false,
        pointsAwarded: 0,
        bonusAwarded: 0,
        bonusPhotoId: null,
      },
    });
  }
  console.log(`   ✅ Reset ${teamTasks.length} team task(s)`);

  // 4. Reset team record
  await prisma.team.update({
    where: { id: team.id },
    data: {
      name: null,
      hasEntered: false,
      startedAt: null,
      finishedAt: null,
      totalPoints: 0,
      totalBonusPoints: 0,
      totalHintPenalties: 0,
    },
  });
  console.log(`   ✅ Reset team data (points, name, timestamps)`);

  console.log(`✅ Successfully reset team: ${entryCode}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  npm run reset-teams -- TEAMCODE1 TEAMCODE2 ...
  npm run reset-teams -- --all

Examples:
  npm run reset-teams -- ABC123
  npm run reset-teams -- ABC123 DEF456
  npm run reset-teams -- --all
    `);
    process.exit(1);
  }

  if (args[0] === "--all") {
    console.log("🔄 Resetting ALL teams...");
    const teams = await prisma.team.findMany({
      select: { entryCode: true },
    });
    
    if (teams.length === 0) {
      console.log("❌ No teams found in database");
      return;
    }

    console.log(`Found ${teams.length} team(s) to reset`);
    
    for (const team of teams) {
      await resetTeam(team.entryCode);
    }
    
    console.log(`\n✅ Successfully reset all ${teams.length} team(s)`);
  } else {
    // Reset specific teams
    for (const entryCode of args) {
      await resetTeam(entryCode);
    }
    
    console.log(`\n✅ Reset complete for ${args.length} team(s)`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

