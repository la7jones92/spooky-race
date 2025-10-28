import { useEffect, useState } from "react";
import { fetchTeam, fetchTeamTasks, registerTeamApi, skipTask, submitTaskCode, useHint } from "./api";
import { TaskDetailScreen } from "./Figma/components/TaskDetailScreen";
import { TaskGridScreen } from "./Figma/components/TaskGridScreen";
import { gameLogic, GameState } from "./Figma/lib/gameLogic";
import { SubmissionResult, TaskStatus, TeamTask } from "./Figma/lib/types";
import { LoginScreen } from "./Figma/components/LoginScreen";
import { uploadBonusPhotoBase64 } from "./api";
import { compressImageToUnder5MB, blobToBase64Data } from "./utils/image";
import AdminAppRouter from "./admin/AdminAppRouter";

export default function App() {
  // Admin portal mount
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return <AdminAppRouter />;
  }

  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(gameLogic.getGameState());
  
  const [selectedTeamTask, setSelectedTeamTask] = useState<TeamTask | null>(null);
  const [currentScreen, setCurrentScreen] = useState<"login" | "tasks" | "detail">("login");
  const [elapsedTime, setElapsedTime] = useState(0);

useEffect(() => {
  const saved = localStorage.getItem("entryCode");
  if (!saved) {
    setLoading(false);
    setCurrentScreen("login");
    return;
  }

  // silently try to login with saved code
  handleLogin(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  
  // Subscribe to game state changes
  useEffect(() => {
    const unsubscribe = gameLogic.subscribe((newState) => {
      setGameState(newState);
    });
    return unsubscribe;
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameState.team.startedAt) return;

    const interval = setInterval(() => {
      setElapsedTime(gameLogic.getElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.team.startedAt]);

  // Format timer display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

// Compute from server-backed state
const totalPoints = teamTasks.reduce(
  (sum, tt) => sum + (tt.task?.points ?? 0) + (tt.task?.bonusPoints ?? 0),
  0
);

const totalEarnedPoints =
  (gameState.team.totalPoints ?? 0) + (gameState.team.totalBonusPoints ?? 0);

const completed = teamTasks.filter((tt) => [TaskStatus.COMPLETED, TaskStatus.SKIPPED].includes(tt.status)).length;

const progress = {
  completed,
  total: teamTasks.length,
  percentage: teamTasks.length
    ? Math.round((completed / teamTasks.length) * 100)
    : 0,
};

const isGameComplete =
  !!gameState.team.finishedAt ||
  (progress.total > 0 && progress.completed === progress.total);

  const handleTaskClick = (teamTask: TeamTask) => {
    setSelectedTeamTask(teamTask);
    setCurrentScreen("detail");
  };

const handleRegisterTeam = async (teamName: string) => {
  try {
    const entryCode = localStorage.getItem("entryCode");
    if (!entryCode) throw new Error("Not logged in");

    const resp = await registerTeamApi(entryCode, teamName);

    // update list (first task complete, unlock next)
    setTeamTasks((prev) =>
      prev.map((tt) => {
        if (tt.order === 1 || tt.taskId === "task-1") {
          return {
            ...tt,
            status: TaskStatus.COMPLETED,
            completedAt: resp.current.completedAt ?? new Date().toISOString(),
            pointsAwarded: resp.current.pointsAwarded ?? tt.pointsAwarded ?? 0,
          };
        }
        if (resp.next && tt.taskId === resp.next.taskId) {
          return {
            ...tt,
            status: TaskStatus.UNLOCKED,
            unlockedAt: resp.next.unlockedAt ?? new Date().toISOString(),
          };
        }
        return tt;
      })
    );

    // update open detail (if it's task 1)
    setSelectedTeamTask((prev) =>
      prev && (prev.order === 1 || prev.taskId === "task-1")
        ? {
            ...prev,
            status: TaskStatus.COMPLETED,
            completedAt: resp.current.completedAt ?? new Date().toISOString(),
            pointsAwarded: resp.current.pointsAwarded ?? prev.pointsAwarded ?? 0,
          }
        : prev
    );

    // update team state
    setGameState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        name: resp.team.name ?? teamName,
        hasEntered: true,
        startedAt: resp.team.startedAt ?? prev.team.startedAt ?? new Date().toISOString(),
        totalPoints: resp.totals?.totalPoints ?? prev.team.totalPoints,
      },
    }));
  } catch (e: any) {
    setError(e?.message || "Registration failed");
  }
};

// Make onSubmitCode async → TaskDetailScreen will await it
const handleSubmitCode = async (taskId: string, code: string): Promise<SubmissionResult> => {
  try {
    const entryCode = localStorage.getItem("entryCode");
    if (!entryCode) throw new Error("Not logged in");

    const resp = await submitTaskCode(entryCode, taskId, code);
    if (resp.result === "FAILURE") {
      return SubmissionResult.FAILURE;
    }

    // success: update list
    setTeamTasks((prev) =>
      prev.map((tt) => {
        if (tt.taskId === taskId) {
          return {
            ...tt,
            status: TaskStatus.COMPLETED,
            completedAt: resp.current.completedAt ?? new Date().toISOString(),
            pointsAwarded: resp.current.pointsAwarded ?? tt.pointsAwarded ?? 0,
          };
        }
        if (resp.next && tt.taskId === resp.next.taskId) {
          return {
            ...tt,
            status: TaskStatus.UNLOCKED,
            unlockedAt: resp.next.unlockedAt ?? new Date().toISOString(),
          };
        }
        return tt;
      })
    );

    // update open detail right away
    setSelectedTeamTask((prev) =>
      prev && prev.taskId === taskId
        ? {
            ...prev,
            status: TaskStatus.COMPLETED,
            completedAt: resp.current.completedAt ?? new Date().toISOString(),
            pointsAwarded: resp.current.pointsAwarded ?? prev.pointsAwarded ?? 0,
          }
        : prev
    );

    // totals
    setGameState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        totalPoints: resp.totals?.totalPoints ?? prev.team.totalPoints,
      },
    }));

    return SubmissionResult.SUCCESS;
  } catch (e: any) {
    setError(e?.message || "Submit failed");
    return SubmissionResult.FAILURE;
  }
};

const handleBonusSubmit = async (taskId: string, file: File) => {
  try {
    const entryCode = localStorage.getItem("entryCode");
    if (!entryCode) throw new Error("Not logged in");

    // 1) compress to ≤ 5MB
    const { blob, type } = await compressImageToUnder5MB(file);
    const base64 = await blobToBase64Data(blob);

    // 2) upload (base64 JSON)
    const resp = await uploadBonusPhotoBase64({
      entryCode,
      taskId,
      filename: file.name,
      contentType: type,
      sizeBytes: blob.size,
      dataBase64: base64,
    });

    // 3) update list
    setTeamTasks((prev) =>
      prev.map((tt) =>
        tt.taskId === taskId
          ? {
              ...tt,
              bonusAwarded: resp.teamTask.bonusAwarded ?? 0,
              bonusPhotoId: resp.teamTask.bonusPhotoId ?? null,
            }
          : tt
      )
    );

    // 4) update open detail
    setSelectedTeamTask((prev) =>
      prev && prev.taskId === taskId
        ? {
            ...prev,
            bonusAwarded: resp.teamTask.bonusAwarded ?? 0,
            bonusPhotoId: resp.teamTask.bonusPhotoId ?? null,
          }
        : prev
    );

    // 5) update totals
    setGameState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        totalBonusPoints:
          resp.totals?.totalBonusPoints ?? prev.team.totalBonusPoints,
      },
    }));
  } catch (e: any) {
    setError(e?.message || "Bonus upload failed");
  }
};

const handleTaskSkip = async (taskId: string) => {
  try {
    const entryCode = localStorage.getItem("entryCode");
    if (!entryCode) throw new Error("Not logged in");

    const resp = await skipTask(entryCode, taskId);

    // 1) Update list state
    setTeamTasks((prev) =>
      prev.map((tt) => {
        if (tt.taskId === taskId) {
          return {
            ...tt,
            status: TaskStatus.SKIPPED,
            skippedAt: resp.current.skippedAt ?? new Date().toISOString(),
            pointsAwarded: 0,
          };
        }
        if (resp.next && tt.taskId === resp.next.taskId) {
          return {
            ...tt,
            status: TaskStatus.UNLOCKED,
            unlockedAt: resp.next.unlockedAt ?? new Date().toISOString(),
          };
        }
        return tt;
      })
    );

    // 2) If detail view is open for this task, close & go back to list
    setSelectedTeamTask(null);
    setCurrentScreen("tasks");
  } catch (e: any) {
    setError(e?.message || "Skipping failed");
  }
};
  
const handleHintUse = async (taskId: string) => {
  try {
    const entryCode = localStorage.getItem("entryCode");
    if (!entryCode) throw new Error("Not logged in");

    const resp = await useHint(entryCode, taskId);

    // 1) Update the list
    setTeamTasks((prev) =>
      prev.map((tt) =>
        tt.taskId === taskId ? { ...tt, hintUsed: true } : tt
      )
    );

    // 2) Update the open detail item (so the hint shows immediately)
    setSelectedTeamTask((prev) =>
      prev && prev.taskId === taskId ? { ...prev, hintUsed: true } : prev
    );

    // 3) Keep totals in sync (optional but nice)
    setGameState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        totalHintPenalties:
          resp.totals?.totalHintPenalties ?? prev.team.totalHintPenalties,
      },
    }));
  } catch (e: any) {
    setError(e?.message || "Using hint failed");
  }
};

  const handleBackToTasks = () => {
    setCurrentScreen("tasks");
    setSelectedTeamTask(null);
  };

const handleLogin = async (teamCode: string) => {
  setError(null);
  setLoading(true);

  try {
    // 1) validate team
    const team = await fetchTeam(teamCode.trim());

    // 2) load tasks for that team
    const tasks = await fetchTeamTasks(teamCode.trim());

    // 3) update client state
    setTeamTasks(tasks);
    setGameState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        // hydrate from API (null-safe fallbacks if your Team includes optionals)
        id: team.id,
        name: team.name ?? prev.team.name ?? null,
        hasEntered: Boolean(team.hasEntered),
        startedAt: team.startedAt ?? null,
        finishedAt: team.finishedAt ?? null,
        totalPoints: team.totalPoints ?? 0,
        totalBonusPoints: team.totalBonusPoints ?? 0,
        totalHintPenalties: team.totalHintPenalties ?? 0,
      },
      // NOTE: we keep prev.teamTasks as-is for now since your UI reads
      // from the local `teamTasks` state passed to TaskGridScreen.
    }));

    localStorage.setItem("entryCode", teamCode.trim());
    console.log("SUCCESS! MOVE TO TASKS");
    setCurrentScreen("tasks");
  } catch (e: any) {
    setError(e?.message || "Login failed");
    setCurrentScreen("login");
  } finally {
    setLoading(false);
  }
};

const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem("entryCode");
  
  // Clear all state
  setTeamTasks([]);
  setSelectedTeamTask(null);
  setError(null);
  setElapsedTime(0);
  
  // Reset game state to initial
  setGameState(gameLogic.getGameState());
  
  // Navigate to login
  setCurrentScreen("login");
  setLoading(false);
  
  console.log("Logged out successfully");
};

  // Show task detail screen when a task is selected
  if (currentScreen === "detail" && selectedTeamTask) {
    return (
      <TaskDetailScreen
        teamTask={selectedTeamTask}
        onBack={handleBackToTasks}
        onSubmitCode={handleSubmitCode}
        onRegisterTeam={handleRegisterTeam}
        onBonusSubmit={handleBonusSubmit}
        onSkip={handleTaskSkip}
        onHintUse={handleHintUse}
      />
    );
  }

  // Show task detail screen when a task is selected
  if (currentScreen === "tasks") {
    return (
      <TaskGridScreen
        gameState={{
          ...gameState,
          teamTasks,
        }}
        totalPoints={totalPoints}
        totalEarnedPoints={totalEarnedPoints}
        progress={progress}
        isGameComplete={gameLogic.isGameComplete()}
        onTaskClick={handleTaskClick} 
        onLogout={handleLogout}     
        />
    );
  }

  // Show main task grid screen
  return (
      <LoginScreen 
      onLogin={handleLogin}
      error={error}
      />
  );
}
