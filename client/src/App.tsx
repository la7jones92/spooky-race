import React, { useEffect, useState } from "react";
import { TaskCard } from "./components/TaskCard";
import type { TeamTask } from "./types";
import { fetchTeamTasks } from "./api";

export default function App() {
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTeamTasks();
        if (alive) setTeamTasks(data);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load team tasks");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Spooky Race</h1>
        <p className="text-sm opacity-70">Testing DB-backed team tasks (GHO5T)</p>
      </header>

      <main className="p-4 max-w-4xl mx-auto w-full">
        {loading && <div className="opacity-70">Loading team tasks…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2">
            {teamTasks.map((tt) => (
              <TaskCard
                key={tt.id}
                // Pass the template task for copy/points and the per-team state
                task={tt.task!}
                teamTask={tt}
                disableActions
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}