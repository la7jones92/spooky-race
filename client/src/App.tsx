import React, { useState, useEffect } from "react";
import { TaskCard, Task } from "./components/TaskCard";
import { TaskDetailScreen } from "./components/TaskDetailScreen";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Ghost, Skull, Trophy, Clock } from "lucide-react";

export default function App() {
  const [completedTasks, setCompletedTasks] = useState<
    number[]
  >([]);
  const [bonusCompletedTasks, setBonusCompletedTasks] = useState<
    number[]
  >([]);
  const [skippedTasks, setSkippedTasks] = useState<
    number[]
  >([]);
  const [hintsUsed, setHintsUsed] = useState<
    number[]
  >([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    null,
  );
  const [currentScreen, setCurrentScreen] = useState<
    "tasks" | "detail"
  >("tasks");
  const [timerStarted, setTimerStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [teamName, setTeamName] = useState<string>("");

  const [TASKS, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tasks", { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`GET /api/tasks ${res.status}`);
        const data: Task[] = await res.json();
        setTasks(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!timerStarted) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted]);

  // Format timer display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalPoints = TASKS.reduce(
    (sum, task) => sum + task.points + task.bonusPoints,
    0,
  );
  const earnedPoints = TASKS.filter((task) =>
    completedTasks.includes(task.id),
  ).reduce((sum, task) => {
    const hintPenalty = hintsUsed.includes(task.id) ? (task.hintPenalty || 0) : 0;
    return sum + task.points - hintPenalty;
  }, 0);
  const bonusPoints = TASKS.filter((task) =>
    bonusCompletedTasks.includes(task.id),
  ).reduce((sum, task) => sum + task.bonusPoints, 0);
  const totalEarnedPoints = earnedPoints + bonusPoints;

  const progress = ((completedTasks.length + skippedTasks.length) / TASKS.length) * 100;

  const isTaskUnlocked = (taskId: number) => {
    if (taskId === 1) return true;
    return completedTasks.includes(taskId - 1) || skippedTasks.includes(taskId - 1);
  };

  const handleTaskClick = (task: Task) => {
    // Start timer when first task is opened
    if (task.id === 1 && !timerStarted) {
      setTimerStarted(true);
    }

    setSelectedTask(task);
    setCurrentScreen("detail");
  };

  const handleTaskComplete = (taskId: number, submittedTeamName?: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      
      // If it's the first task, save the team name
      if (taskId === 1 && submittedTeamName) {
        setTeamName(submittedTeamName);
      }
    }
  };

  const handleBonusComplete = (taskId: number) => {
    if (!bonusCompletedTasks.includes(taskId)) {
      setBonusCompletedTasks([...bonusCompletedTasks, taskId]);
    }
  };

  const handleTaskSkip = (taskId: number) => {
    if (!skippedTasks.includes(taskId)) {
      setSkippedTasks([...skippedTasks, taskId]);
    }
  };

  const handleHintUse = (taskId: number) => {
    if (!hintsUsed.includes(taskId)) {
      setHintsUsed([...hintsUsed, taskId]);
    }
  };

  const handleBackToTasks = () => {
    setCurrentScreen("tasks");
    setSelectedTask(null);
  };

  // Show task detail screen when a task is selected
  if (currentScreen === "detail" && selectedTask) {
    return (
      <TaskDetailScreen
        task={selectedTask}
        isCompleted={completedTasks.includes(selectedTask.id)}
        isBonusCompleted={bonusCompletedTasks.includes(selectedTask.id)}
        isSkipped={skippedTasks.includes(selectedTask.id)}
        isHintUsed={hintsUsed.includes(selectedTask.id)}
        onBack={handleBackToTasks}
        onComplete={handleTaskComplete}
        onBonusComplete={handleBonusComplete}
        onSkip={handleTaskSkip}
        onHintUse={handleHintUse}
      />
    );
  }

  // Show main task grid screen
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Ghost className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">
                Versent Spooky Race
              </h1>
              <Skull className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              {teamName ? `Team: ${teamName}` : "Register your team to begin!"}
            </p>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm">Progress</span>
                {timerStarted && (
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {completedTasks.length + skippedTasks.length}/{TASKS.length} tasks
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {totalEarnedPoints}/{totalPoints} pts
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TASKS.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUnlocked={isTaskUnlocked(task.id)}
              isCompleted={completedTasks.includes(task.id)}
              isSkipped={skippedTasks.includes(task.id)}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>

        {/* Completion Message */}
        {(completedTasks.length + skippedTasks.length) === TASKS.length && (
          <div className="mt-8 text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Congratulations!
              </h2>
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">
              You've completed all the spooky challenges and
              earned {totalEarnedPoints} points! 🎃👻
            </p>
          </div>
        )}
      </div>
    </div>
  );
}