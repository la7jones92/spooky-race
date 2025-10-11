// client/src/api.ts
import type { Team, TeamTask } from "./Figma/types/game";

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