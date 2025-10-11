import React, { useEffect, useMemo, useState } from "react";
import { Dashboard } from "../../Figma/components/admin/Dashboard";
import { fetchAdminTeams, fetchAdminTeam, type AdminTeamListItem } from "../api";
import type { AdminTeamView } from "../../Figma/lib/types";

export function AdminDashboard({ navigate }: { navigate: (p: string) => void }) {
  const [teams, setTeams] = useState<AdminTeamView[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // 1) get summary list
      const list: AdminTeamListItem[] = await fetchAdminTeams();
      // 2) fetch full detail for each to build AdminTeamView[]
      const full: AdminTeamView[] = await Promise.all(list.map(t => fetchAdminTeam(t.id)));
      setTeams(full);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Figma Dashboard expects: teams (AdminTeamView[]), lastUpdated, onSelectTeam, onRefresh
  const note = useMemo(() => err ? "Error loading teams" : (loading ? "Updating…" : `Last updated at ${lastUpdated}`), [err, loading, lastUpdated]);

  return (
    <Dashboard
      teams={teams}
      lastUpdated={note}
      onSelectTeam={(id) => navigate(`/admin/teams/${id}`)}
      onRefresh={load}
    />
  );
}