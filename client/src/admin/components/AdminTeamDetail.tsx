import React, { useEffect, useState } from "react";
import { TeamDetail } from "../../Figma/components/admin/TeamDetail";
import { fetchAdminTeam } from "../api";
import type { AdminTeamView } from "../../Figma/lib/types";

export function AdminTeamDetail({ teamId, navigate }: { teamId: string; navigate: (p: string) => void }) {
  const [team, setTeam] = useState<AdminTeamView | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const t = await fetchAdminTeam(teamId);
      setTeam(t);
    } catch (e: any) {
      setErr(e?.message || "Failed to load team");
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [teamId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (err)     return <div className="p-6 text-red-600">{err}</div>;
  if (!team)   return <div className="p-6">No team found.</div>;

  // TeamDetail expects { team: AdminTeamView, onBack }
  return <TeamDetail team={team} onBack={() => navigate("/admin")} />;
}