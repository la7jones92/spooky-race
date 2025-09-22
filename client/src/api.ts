// client/src/api.ts
import type { TeamTask } from "./types/game";

const TEAM_CODE = "GHO5T"; // hard-coded for this test

export async function fetchTeamTasks(): Promise<TeamTask[]> {
  const res = await fetch(
    `/api/teamTasks?entryCode=${encodeURIComponent(TEAM_CODE)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load team tasks (${res.status}): ${text}`);
  }
  const data = (await res.json()) as TeamTask[];
  return data;
}