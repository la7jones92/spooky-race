import { useEffect, useState } from "react";
import type { SubmissionResult, TeamTask } from "./types/game";
import { fetchTeamTasks } from "./api";
import { TaskDetailScreen } from "./Figma/components/TaskDetailScreen";
import { TaskGridScreen } from "./Figma/components/TaskGridScreen";
import { gameLogic, GameState } from "./Figma/lib/gameLogic";

export default function App() {
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(gameLogic.getGameState());
  
  const [selectedTeamTask, setSelectedTeamTask] = useState<TeamTask | null>(null);
  const [currentScreen, setCurrentScreen] = useState<"tasks" | "detail">("tasks");
  const [elapsedTime, setElapsedTime] = useState(0);

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

  // Show main task grid screen
  return (
    <TaskGridScreen
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
    />
  );
}