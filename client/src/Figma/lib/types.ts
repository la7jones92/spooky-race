// ---------- Enums (mirror Prisma) ----------
export enum TaskStatus {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

export enum SubmissionResult {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

// ---------- Core models (client-safe) ----------
// NOTE: This is the model your UI should use. It intentionally omits `completionCode`.
export interface Task {
  id: string;
  title: string;
  description: string;               // you kept this field name
  detailedDescription?: string | null;

  // gameplay + copy
  points: number;
  bonusPhotoDescription?: string | null;
  bonusPoints: number;
  hint?: string | null;
  hintPointsPenalty: number;

  // admin/global display order (you kept this as `order`)
  order: number;

  // timestamps (ISO strings from API)
  createdAt?: string;
  updatedAt?: string;
}

// If you have an admin screen, expose the code there only.
export interface AdminTask extends Task {
  completionCode: string; // DO NOT ship this to normal clients
}

export interface Team {
  id: string;
  name?: string | null;
  hasEntered: boolean;

  // timer
  startedAt?: string | null;   // ISO date string
  finishedAt?: string | null;

  // denorm totals for leaderboard
  totalPoints: number;
  totalBonusPoints: number;
  totalHintPenalties: number;

  // You typically won't keep entryCode on the client after entry,
  // but include it if your UI needs to re-show it.
  entryCode?: string;
}

export interface Upload {
  id: string;

  // Your backend will return either a URL (S3/R2) or serve a file route.
  url?: string | null;

  // If you ever stream from DB, you'll likely expose a file route instead of blob.
  // blob?: ArrayBuffer; // Not recommended to send raw blobs in JSON.

  contentType: string;
  sizeBytes: number;
  filename?: string | null;

  teamId?: string | null;
  createdAt?: string; // ISO
}

export interface TeamTask {
  id: string;
  teamId: string;
  taskId: string;

  order: number;                 // per-team sequence position
  status: TaskStatus;

  unlockedAt?: string | null;    // ISO
  completedAt?: string | null;
  skippedAt?: string | null;

  hintUsed: boolean;
  pointsAwarded: number;         // base points after hint penalty
  bonusAwarded: number;          // bonus photo points

  bonusPhotoId?: string | null;
  bonusPhoto?: Upload | null;

  // Common pattern: API returns the joined Task (client-safe)
  task?: Task;
  
  // Admin-only: includes submission history for this team task
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  teamId: string;
  teamTaskId: string;

  providedCode: string;          // what the player typed (trimmed)
  result: SubmissionResult;

  matchedTaskId?: string | null; // optional diagnostic
  createdAt: string;             // ISO
}

// ---------- Handy composites for API responses ----------

// What `/api/tasks` should return for a logged-in team:
export type TeamTasksResponse = TeamTask[];

// If you need a single payload for the game screen:
export interface GameStateResponse {
  team: Team;
  tasks: TeamTask[];   // each with `task` populated, no completionCode present
}

// Admin-only payloads (where showing codes is okay):
export interface AdminTaskWithStats extends AdminTask {
  // e.g., aggregate progress counts if you add an admin route
  _stats?: {
    completed: number;
    skipped: number;
    unlocked: number;
    locked: number;
  };
}

// ---------- Admin Portal specific types ----------

export interface AdminTeamView extends Team {
  teamTasks: TeamTask[];
}
