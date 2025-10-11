// client/src/api.ts
import type { Team, TeamTask } from "./Figma/lib/types";

/**
 * Validate a team entry code and return the Team record.
 * 404 => invalid/unknown code.
 */
export async function fetchTeam(entryCode: string): Promise<Team> {
  const res = await fetch(
    `/api/team?entryCode=${encodeURIComponent(entryCode)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }
  );

  if (res.status === 404) {
    throw new Error("Invalid team code");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load team (${res.status}): ${text}`);
  }
  return (await res.json()) as Team;
}

/**
 * Load the per-team task rows (TeamTask[]) with embedded Task (no completionCode).
 */
export async function fetchTeamTasks(entryCode: string): Promise<TeamTask[]> {
  const res = await fetch(
    `/api/teamTasks?entryCode=${encodeURIComponent(entryCode)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }
  );

  if (res.status === 404) {
    throw new Error("Team not found");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load team tasks (${res.status}): ${text}`);
  }
  return (await res.json()) as TeamTask[];
}

export async function useHint(entryCode: string, taskId: string): Promise<{
  teamTask: { id: string; taskId: string; hintUsed: boolean };
  hint: string;
  hintPointsPenalty: number;
  totals: { totalHintPenalties: number };
}> {
  const res = await fetch("/api/teamTasks/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ entryCode, taskId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Use hint failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function skipTask(
  entryCode: string,
  taskId: string
): Promise<{
  current: { id: string; taskId: string; status: string; skippedAt?: string };
  next?: { id: string; taskId: string; status: string; unlockedAt?: string };
}> {
  const res = await fetch("/api/teamTasks/skip", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ entryCode, taskId }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Skip failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function submitTaskCode(
  entryCode: string,
  taskId: string,
  code: string
): Promise<
  | { result: "FAILURE" }
  | {
      result: "SUCCESS";
      current: { taskId: string; status: string; completedAt?: string; pointsAwarded?: number; order?: number | null };
      next?: { taskId: string; status: string; unlockedAt?: string | null };
      totals: { totalPoints: number };
    }
> {
  const res = await fetch("/api/teamTasks/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ entryCode, taskId, code }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Submit failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function registerTeamApi(entryCode: string, teamName: string): Promise<{
  result: "SUCCESS";
  team: { name: string; hasEntered: boolean; startedAt: string | null; totalPoints: number };
  current: { taskId: string; status: string; completedAt?: string; pointsAwarded?: number };
  next?: { taskId: string; status: string; unlockedAt?: string | null };
  totals: { totalPoints: number };
}> {
  const res = await fetch("/api/team/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ entryCode, teamName }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Register failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function uploadBonusPhotoBase64(params: {
  entryCode: string;
  taskId: string;
  filename?: string;
  contentType: string;
  sizeBytes: number;
  dataBase64: string;
}): Promise<{
  teamTask: { taskId: string; bonusAwarded: number; bonusPhotoId: string | null };
  totals: { totalBonusPoints: number };
}> {
  const res = await fetch("/api/teamTasks/bonusPhoto", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bonus upload failed (${res.status}): ${text}`);
  }
  return res.json();
}