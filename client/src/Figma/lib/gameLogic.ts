import { Task, Team, TeamTask, TaskStatus, SubmissionResult, Submission } from '../lib/types';

// Mock task data (without completion codes for client)
export const GAME_TASKS: Task[] = [
  {
    id: "task-1",
    title: "👻 Name of the Night",
    description: "Register your team and discover the ghostly secret",
    detailedDescription: "Welcome to the Versent Spooky Race! To begin your Halloween adventure, first register your team with a creative, spooky name. Then discover the mysterious ghostly name that haunts this place. Look for clues left behind by spirits of the past - the answer lies where shadows meet moonlight.",
    points: 10,
    bonusPoints: 5,
    bonusPhotoDescription: "Take a spooky team photo at the starting location with everyone making their best ghost faces!",
    order: 1,
    hintPointsPenalty: 0, // No hint for registration task
  },
  {
    id: "task-2",
    title: "⚔️ Ripper's Reach",
    description: "Find the legendary blade of the notorious figure",
    detailedDescription: "Locate the infamous weapon that once belonged to a dark historical figure. This task will test your knowledge of local legends and your ability to follow cryptic directions through the streets.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the historical marker or plaque related to this dark figure's story",
    hint: "Look for the infamous knife display near the old courthouse area",
    hintPointsPenalty: 5,
    order: 2,
  },
  {
    id: "task-3",
    title: "🚂 Platform Poltergeist",
    description: "Encounter the restless spirit at the station",
    detailedDescription: "Visit the old railway platform where a ghostly presence is said to linger. Look for signs of supernatural activity and document your findings. The poltergeist only appears to those who know where to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture a photo of the old railway platform with your team recreating a Victorian-era train waiting pose",
    hint: "The spirit haunts Platform 1 at Flinders Street Station",
    hintPointsPenalty: 7,
    order: 3,
  },
  {
    id: "task-4",
    title: "🍻 The Slashed Secret",
    description: "Uncover the hidden truth in the tavern",
    detailedDescription: "Head to the historic pub where a dark secret has been buried for decades. Search for clues among the old bottles and beneath the ancient floorboards. The truth has been slashed away but not forgotten.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Take a photo of your team toasting with drinks (non-alcoholic is fine) at the historic tavern location",
    hint: "Check the old Mitre Tavern on Bank Place",
    hintPointsPenalty: 5,
    order: 4,
  },
  {
    id: "task-5",
    title: "🎭 The Final Bow",
    description: "Witness the last performance of the phantom actor",
    detailedDescription: "Find the old theater where a legendary performer met their tragic end. Look for traces of their final show and the dramatic conclusion that still echoes through the halls. The curtain never truly fell.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Stage a dramatic theatrical pose with your team in front of the old theater, recreating a final bow scene",
    hint: "The Princess Theatre on Spring Street holds the tragic tale",
    hintPointsPenalty: 8,
    order: 5,
  },
  {
    id: "task-6",
    title: "🏢 Count of the Condemned",
    description: "Tally the souls trapped in the fortress",
    detailedDescription: "Visit the imposing structure where many met their fate. Count the markers of those who never left and piece together their stories. Each soul has left a trace for those brave enough to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the imposing fortress structure with your team looking appropriately solemn and respectful",
    hint: "Look for the Old Melbourne Gaol on Russell Street",
    hintPointsPenalty: 6,
    order: 6,
  },
  {
    id: "task-7",
    title: "🛒 Underfoot Ancestors",
    description: "Discover what lies beneath the market grounds",
    detailedDescription: "Explore the area beneath the old market where ancient secrets are buried. Look for signs of those who came before and the stories written in stone beneath your feet. History runs deep in these grounds.",
    points: 30,
    bonusPoints: 15,
    bonusPhotoDescription: "Take a photo of any historical markers, plaques, or stone inscriptions you find beneath the market area",
    hint: "The Queen Victoria Market sits atop the old Melbourne Cemetery",
    hintPointsPenalty: 10,
    order: 7,
  },
  {
    id: "task-8",
    title: "🚢 Captain on Collins",
    description: "Follow the maritime ghost's final voyage",
    detailedDescription: "Trace the path of the phantom captain who still walks Collins Street. Find the nautical clues he left behind and discover where his final journey ended. The captain's spirit guards his greatest treasure.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture your team in a nautical-themed pose on Collins Street, with someone acting as the phantom captain",
    hint: "Follow Collins Street to the old shipping district near the Yarra",
    hintPointsPenalty: 6,
    order: 8,
  },
  {
    id: "task-9",
    title: "🚔 Cells to Ales",
    description: "From lockup to liberation, follow the prisoner's path",
    detailedDescription: "Trace the journey from the old city jail to the freedom of the local alehouse. Follow the path taken by countless souls who moved from confinement to celebration. Find where justice met jubilation in Melbourne's dark history.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Document the journey with a photo showing both the old jail location and the alehouse destination in one creative shot",
    hint: "Start at the Old Melbourne Gaol and end at Young & Jackson's",
    hintPointsPenalty: 8,
    order: 9,
  },
  {
    id: "task-10",
    title: "🍺 Last Orders with the Lady in Black",
    description: "Meet the mysterious woman who never left the bar",
    detailedDescription: "Complete your journey at the historic watering hole where the Lady in Black still waits for her last drink. Find her favorite spot and leave an offering. She'll reveal the final secret to those who show proper respect.",
    points: 35,
    bonusPoints: 20,
    bonusPhotoDescription: "Take a respectful final photo of your team raising a glass to the Lady in Black at her favorite spot",
    hint: "The Croft Institute on Croft Alley holds her spirit",
    hintPointsPenalty: 12,
    order: 10,
  },
];

// Mock completion codes (this would normally be server-side only)
const COMPLETION_CODES: Record<string, string> = {
  "task-2": "RIPPERSBLADE",
  "task-3": "GHOSTTRAIN",
  "task-4": "SLASHEDSECRET",
  "task-5": "FINALCURTAIN",
  "task-6": "CONDEMNED99",
  "task-7": "ANCESTORS",
  "task-8": "CAPTAINSCOIN",
  "task-9": "CELLSTOALES",
  "task-10": "LADYINBLACK",
};

export interface GameState {
  team: Team;
  teamTasks: TeamTask[];
}

export class GameLogic {
  private gameState: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    const teamId = "default-team";
    const now = new Date().toISOString();
    
    const team: Team = {
      id: teamId,
      name: null,
      hasEntered: false,
      startedAt: null,
      finishedAt: null,
      totalPoints: 0,
      totalBonusPoints: 0,
      totalHintPenalties: 0,
    };

    const teamTasks: TeamTask[] = GAME_TASKS.map((task, index) => ({
      id: `team-task-${task.id}`,
      teamId,
      taskId: task.id,
      order: task.order,
      status: index === 0 ? TaskStatus.UNLOCKED : TaskStatus.LOCKED,
      unlockedAt: index === 0 ? now : null,
      completedAt: null,
      skippedAt: null,
      hintUsed: false,
      pointsAwarded: 0,
      bonusAwarded: 0,
      bonusPhotoId: null,
      bonusPhoto: null,
      task,
    }));

    return { team, teamTasks };
  }

  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.gameState));
  }

  private updateTeamStats() {
    const completedTasks = this.gameState.teamTasks.filter(tt => tt.status === TaskStatus.COMPLETED);
    const bonusTasks = this.gameState.teamTasks.filter(tt => tt.bonusAwarded > 0);
    const hintTasks = this.gameState.teamTasks.filter(tt => tt.hintUsed);

    this.gameState.team.totalPoints = completedTasks.reduce((sum, tt) => sum + tt.pointsAwarded, 0);
    this.gameState.team.totalBonusPoints = bonusTasks.reduce((sum, tt) => sum + tt.bonusAwarded, 0);
    this.gameState.team.totalHintPenalties = hintTasks.reduce((sum, tt) => {
      const task = tt.task;
      return sum + (task?.hintPointsPenalty || 0);
    }, 0);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public registerTeam(teamName: string): void {
    this.gameState.team.name = teamName;
    this.gameState.team.hasEntered = true;
    this.gameState.team.startedAt = new Date().toISOString();
    
    // Complete the first task
    const firstTask = this.gameState.teamTasks.find(tt => tt.taskId === "task-1");
    if (firstTask) {
      firstTask.status = TaskStatus.COMPLETED;
      firstTask.completedAt = new Date().toISOString();
      firstTask.pointsAwarded = firstTask.task?.points || 0;
      this.unlockNextTask(firstTask.taskId);
    }
    
    this.updateTeamStats();
    this.notify();
  }

  public submitTaskCode(taskId: string, code: string): SubmissionResult {
    const teamTask = this.gameState.teamTasks.find(tt => tt.taskId === taskId);
    if (!teamTask || teamTask.status !== TaskStatus.UNLOCKED) {
      return SubmissionResult.FAILURE;
    }

    const correctCode = COMPLETION_CODES[taskId];
    if (!correctCode || code.trim().toLowerCase() !== correctCode.toLowerCase()) {
      return SubmissionResult.FAILURE;
    }

    // Complete the task
    teamTask.status = TaskStatus.COMPLETED;
    teamTask.completedAt = new Date().toISOString();
    
    // Calculate points (base points minus hint penalty)
    const basePoints = teamTask.task?.points || 0;
    const hintPenalty = teamTask.hintUsed ? (teamTask.task?.hintPointsPenalty || 0) : 0;
    teamTask.pointsAwarded = Math.max(0, basePoints - hintPenalty);
    
    this.unlockNextTask(taskId);
    this.updateTeamStats();
    this.notify();
    
    return SubmissionResult.SUCCESS;
  }

  public skipTask(taskId: string): void {
    const teamTask = this.gameState.teamTasks.find(tt => tt.taskId === taskId);
    if (!teamTask || teamTask.status !== TaskStatus.UNLOCKED) {
      return;
    }

    teamTask.status = TaskStatus.SKIPPED;
    teamTask.skippedAt = new Date().toISOString();
    teamTask.pointsAwarded = 0;
    
    this.unlockNextTask(taskId);
    this.updateTeamStats();
    this.notify();
  }

  public useHint(taskId: string): void {
    const teamTask = this.gameState.teamTasks.find(tt => tt.taskId === taskId);
    if (!teamTask || teamTask.hintUsed) {
      return;
    }

    teamTask.hintUsed = true;
    this.updateTeamStats();
    this.notify();
  }

  public submitBonusPhoto(taskId: string, file: File): void {
    const teamTask = this.gameState.teamTasks.find(tt => tt.taskId === taskId);
    if (!teamTask || teamTask.status !== TaskStatus.COMPLETED || teamTask.bonusAwarded > 0) {
      return;
    }

    // In a real app, you'd upload the file and get an Upload object back
    // For now, we'll just simulate it
    teamTask.bonusAwarded = teamTask.task?.bonusPoints || 0;
    teamTask.bonusPhotoId = `photo-${taskId}-${Date.now()}`;
    
    this.updateTeamStats();
    this.notify();
  }

  private unlockNextTask(currentTaskId: string): void {
    const currentTask = GAME_TASKS.find(t => t.id === currentTaskId);
    if (!currentTask) return;

    const nextTask = GAME_TASKS.find(t => t.order === currentTask.order + 1);
    if (!nextTask) {
      // All tasks completed, mark team as finished
      this.gameState.team.finishedAt = new Date().toISOString();
      return;
    }

    const nextTeamTask = this.gameState.teamTasks.find(tt => tt.taskId === nextTask.id);
    if (nextTeamTask && nextTeamTask.status === TaskStatus.LOCKED) {
      nextTeamTask.status = TaskStatus.UNLOCKED;
      nextTeamTask.unlockedAt = new Date().toISOString();
    }
  }

  public getTaskByOrder(order: number): TeamTask | undefined {
    return this.gameState.teamTasks.find(tt => tt.order === order);
  }

  public getProgress(): { completed: number; total: number; percentage: number } {
    const completedCount = this.gameState.teamTasks.filter(
      tt => tt.status === TaskStatus.COMPLETED || tt.status === TaskStatus.SKIPPED
    ).length;
    const total = this.gameState.teamTasks.length;
    const percentage = (completedCount / total) * 100;
    
    return { completed: completedCount, total, percentage };
  }

  public getElapsedTime(): number {
    if (!this.gameState.team.startedAt) return 0;
    
    const startTime = new Date(this.gameState.team.startedAt).getTime();
    const endTime = this.gameState.team.finishedAt 
      ? new Date(this.gameState.team.finishedAt).getTime()
      : Date.now();
    
    return Math.floor((endTime - startTime) / 1000);
  }

  public getTotalPossiblePoints(): number {
    return GAME_TASKS.reduce((sum, task) => sum + task.points + task.bonusPoints, 0);
  }

  public getCurrentEarnedPoints(): number {
    return this.gameState.team.totalPoints + this.gameState.team.totalBonusPoints;
  }

  public isGameComplete(): boolean {
    return !!this.gameState.team.finishedAt;
  }
}

// Export a singleton instance
export const gameLogic = new GameLogic();