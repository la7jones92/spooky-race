import { useEffect, useState } from "react";
import { fetchTeam, fetchTeamTasks } from "./api";
import { TaskDetailScreen } from "./Figma/components/TaskDetailScreen";
import { TaskGridScreen } from "./Figma/components/TaskGridScreen";
import { gameLogic, GameState } from "./Figma/lib/gameLogic";
import { SubmissionResult, TeamTask } from "./Figma/types/game";
import { LoginScreen } from "./Figma/components/LoginScreen";

export default function App() {
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

  const totalPoints = gameLogic.getTotalPossiblePoints();
  const totalEarnedPoints = gameLogic.getCurrentEarnedPoints();
  const progress = gameLogic.getProgress();

  const handleTaskClick = (teamTask: TeamTask) => {
    setSelectedTeamTask(teamTask);
    setCurrentScreen("detail");
  };

  const handleRegisterTeam = (teamName: string) => {
    gameLogic.registerTeam(teamName);
  };

  const handleSubmitCode = (taskId: string, code: string): SubmissionResult => {
    return gameLogic.submitTaskCode(taskId, code);
  };

  const handleBonusSubmit = (taskId: string, file: File) => {
    gameLogic.submitBonusPhoto(taskId, file);
  };

  const handleTaskSkip = (taskId: string) => {
    gameLogic.skipTask(taskId);
  };

  const handleHintUse = (taskId: string) => {
    gameLogic.useHint(taskId);
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
    return (<TaskGridScreen
      gameState={{
        team: {
          id: "",
          hasEntered: false,
          totalPoints: 0,
          totalBonusPoints: 0,
          totalHintPenalties: 0
        },
        teamTasks: teamTasks
      }}
      elapsedTime={elapsedTime}
      totalPoints={totalPoints}
      totalEarnedPoints={totalEarnedPoints}
      progress={progress}
      isGameComplete={gameLogic.isGameComplete()}
      onTaskClick={handleTaskClick}
      formatTime={formatTime}
    />)
  }

  // Show main task grid screen
  return (
      <LoginScreen 
      onLogin={handleLogin}
      error={error}
      />
  );
}