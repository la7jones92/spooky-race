import type { AdminTeamView } from "../Figma/lib/types";

// Matches the server's /api/admin/teams response
export type AdminTeamListItem = {
  id: string;
  name: string | null;
  hasEntered: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  totalPoints: number;
  totalBonusPoints: number;
  stats: { total: number; completed: number; skipped: number; unlocked: number; locked: number };
  currentTask: { order: number; title: string | null } | null;
  lastSubmissionAt: string | null;
};

// GET /api/admin/teams  (summary list)
export async function fetchAdminTeams(): Promise<AdminTeamListItem[]> {
  const r = await fetch("/api/admin/teams", { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`Failed to load admin teams (${r.status})`);
  return r.json();
}

// GET /api/admin/teams/:id  (full detail, we map to AdminTeamView)
export async function fetchAdminTeam(id: string): Promise<AdminTeamView> {
  const r = await fetch(`/api/admin/teams/${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`Failed to load team (${r.status})`);
  const data = await r.json() as {
    team: Omit<AdminTeamView, "teamTasks">;
    teamTasks: AdminTeamView["teamTasks"];
    lastSubmissionAt?: string | null;
  };
  return { ...data.team, teamTasks: data.teamTasks };
}