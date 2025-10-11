import { Team, TeamTask, Task, Upload, TaskStatus, AdminTeamView } from "./types";

// Mock tasks (global task definitions)
const tasks: Task[] = [
  {
    id: "task-1",
    title: "Graveyard Riddle",
    description: "Solve the riddle at the old graveyard",
    detailedDescription: "Find the ancient tombstone and decode its message",
    points: 10,
    bonusPhotoDescription: "Photo of the tombstone inscription",
    bonusPoints: 5,
    hintPointsPenalty: 2,
    order: 1,
  },
  {
    id: "task-2",
    title: "Haunted House",
    description: "Find the secret room",
    detailedDescription: "Navigate the haunted mansion and discover the hidden chamber",
    points: 8,
    bonusPhotoDescription: "Photo inside the secret room",
    bonusPoints: 4,
    hintPointsPenalty: 2,
    order: 2,
  },
  {
    id: "task-3",
    title: "Pumpkin Patch",
    description: "Count the carved pumpkins",
    detailedDescription: "Count all the jack-o'-lanterns in the pumpkin patch",
    points: 7,
    bonusPhotoDescription: "Photo of the pumpkin patch",
    bonusPoints: 3,
    hintPointsPenalty: 1,
    order: 3,
  },
  {
    id: "task-4",
    title: "Spider Web",
    description: "Navigate through the web maze",
    detailedDescription: "Find your way through the giant spider web without getting caught",
    points: 10,
    bonusPhotoDescription: "Photo at the center of the web",
    bonusPoints: 5,
    hintPointsPenalty: 2,
    order: 4,
  },
  {
    id: "task-5",
    title: "Witch's Elixir",
    description: "Mix the potion correctly",
    detailedDescription: "Follow the witch's recipe to brew the perfect elixir",
    points: 10,
    bonusPhotoDescription: "Photo of the completed potion",
    bonusPoints: 5,
    hintPointsPenalty: 2,
    order: 5,
  },
  {
    id: "task-6",
    title: "Ghost Hunt",
    description: "Find all 5 ghost markers",
    detailedDescription: "Track down all five spectral markers hidden around the grounds",
    points: 12,
    bonusPhotoDescription: "Photo of all ghost markers together",
    bonusPoints: 6,
    hintPointsPenalty: 3,
    order: 6,
  },
  {
    id: "task-7",
    title: "Skeleton Dance",
    description: "Learn the skeleton dance",
    detailedDescription: "Master the spooky skeleton dance routine",
    points: 8,
    bonusPhotoDescription: "Video or photo of your team performing the dance",
    bonusPoints: 4,
    hintPointsPenalty: 2,
    order: 7,
  },
  {
    id: "task-8",
    title: "Vampire's Lair",
    description: "Find the vampire's coffin",
    detailedDescription: "Locate the ancient vampire's resting place",
    points: 15,
    bonusPhotoDescription: "Photo with the coffin",
    bonusPoints: 7,
    hintPointsPenalty: 3,
    order: 8,
  },
  {
    id: "task-9",
    title: "Zombie Escape",
    description: "Escape the zombie zone",
    detailedDescription: "Navigate through the zombie-infested area and escape",
    points: 10,
    bonusPhotoDescription: "Photo at the safe zone",
    bonusPoints: 5,
    hintPointsPenalty: 2,
    order: 9,
  },
  {
    id: "task-10",
    title: "Final Challenge",
    description: "Complete the ultimate Halloween challenge",
    detailedDescription: "Face the final spooky challenge to complete your quest",
    points: 20,
    bonusPhotoDescription: "Victory photo at the finish line",
    bonusPoints: 10,
    hintPointsPenalty: 5,
    order: 10,
  },
];

// Mock photo uploads
const createMockUpload = (id: string, url: string, teamId: string): Upload => ({
  id,
  url,
  contentType: "image/jpeg",
  sizeBytes: 1024000,
  filename: `photo-${id}.jpg`,
  teamId,
  createdAt: new Date().toISOString(),
});

// Create mock team tasks for each team
const createTeamTasks = (
  teamId: string,
  completedCount: number,
  includeBonus: boolean = true
): TeamTask[] => {
  return tasks.map((task, index) => {
    const taskNumber = index + 1;
    const isCompleted = taskNumber <= completedCount;
    const isUnlocked = taskNumber === completedCount + 1;
    const isLocked = taskNumber > completedCount + 1;

    let status: TaskStatus = TaskStatus.LOCKED;
    if (isCompleted) status = TaskStatus.COMPLETED;
    else if (isUnlocked) status = TaskStatus.UNLOCKED;

    const bonusPhoto = isCompleted && includeBonus
      ? createMockUpload(
          `upload-${teamId}-${task.id}`,
          `https://images.unsplash.com/photo-${1509248961158 + index}?w=800`,
          teamId
        )
      : null;

    return {
      id: `teamtask-${teamId}-${task.id}`,
      teamId,
      taskId: task.id,
      order: taskNumber,
      status,
      unlockedAt: isCompleted || isUnlocked ? new Date(Date.now() - (10 - taskNumber) * 3600000).toISOString() : null,
      completedAt: isCompleted ? new Date(Date.now() - (10 - taskNumber) * 3600000).toISOString() : null,
      skippedAt: null,
      hintUsed: false,
      pointsAwarded: isCompleted ? task.points : 0,
      bonusAwarded: isCompleted && bonusPhoto ? task.bonusPoints : 0,
      bonusPhotoId: bonusPhoto?.id || null,
      bonusPhoto: bonusPhoto,
      task,
    };
  });
};

// Mock teams with team tasks
export const mockAdminTeams: AdminTeamView[] = [
  {
    id: "team-1",
    name: "Ghoul Gang",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    finishedAt: null,
    totalPoints: 50,
    totalBonusPoints: 25,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-1", 5),
  },
  {
    id: "team-2",
    name: "Hex Express",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: null,
    totalPoints: 63,
    totalBonusPoints: 31,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-2", 6),
  },
  {
    id: "team-3",
    name: "Phantom Bytes",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: null,
    totalPoints: 25,
    totalBonusPoints: 12,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-3", 3),
  },
  {
    id: "team-4",
    name: "Spooky Sprites",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: new Date(Date.now() - 900000).toISOString(), // finished 15 min ago
    totalPoints: 110,
    totalBonusPoints: 54,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-4", 10),
  },
  {
    id: "team-5",
    name: "Creepy Coders",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: null,
    totalPoints: 50,
    totalBonusPoints: 24,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-5", 5),
  },
  {
    id: "team-6",
    name: "Wicked Wizards",
    hasEntered: true,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: null,
    totalPoints: 18,
    totalBonusPoints: 8,
    totalHintPenalties: 0,
    teamTasks: createTeamTasks("team-6", 2),
  },
];


