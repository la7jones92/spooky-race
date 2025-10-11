import React, { useEffect, useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminTeamDetail } from "./components/AdminTeamDetail";

function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (p: string) => {
    window.history.pushState({}, "", p);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return [path, navigate] as const;
}

export default function AdminAppRouter() {
  const [path, navigate] = usePath();

  if (path === "/admin" || path === "/admin/") {
    return <AdminDashboard navigate={navigate} />;
  }

  const m = path.match(/^\/admin\/teams\/([^/]+)\/?$/);
  if (m) {
    const teamId = decodeURIComponent(m[1]);
    return <AdminTeamDetail teamId={teamId} navigate={navigate} />;
  }

  useEffect(() => {
    if (!path.startsWith("/admin")) navigate("/admin");
  }, [path]);

  return null;
}