import React, { useState, useEffect } from "react";
import { TaskCard, Task } from "./components/TaskCard";
import { TaskDetailScreen } from "./components/TaskDetailScreen";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Ghost, Skull, Trophy, Clock } from "lucide-react";

const TASKS: Task[] = [
  {
    id: 1,
    title: "Find the Hidden Pumpkin",
    description:
      "Look for a carved jack-o'-lantern in the main lobby",
    detailedDescription:
      "Search the main lobby area for a carved pumpkin. It might be hiding behind decorations or in a corner. Take a photo when you find it to prove you completed this task!",
    points: 10,
  },
  {
    id: 2,
    title: "Collect Spider Web Clues",
    description:
      "Gather 3 fake spider webs from different rooms",
    detailedDescription:
      "Find and collect 3 artificial spider webs placed in different rooms around the building. Each web has a small Halloween sticker on it. Bring all 3 stickers to show completion.",
    points: 15,
  },
  {
    id: 3,
    title: "Ghost Story Challenge",
    description: "Tell a spooky story to another player",
    detailedDescription:
      "Create and tell a short ghost story (at least 1 minute long) to another participant. The story must include: a haunted location, a mysterious sound, and a surprising twist ending.",
    points: 20,
  },
  {
    id: 4,
    title: "Candy Corn Count",
    description: "Count all the candy corn in the mystery jar",
    detailedDescription:
      "Find the large glass jar filled with candy corn in the designated area. Count all the pieces and write your guess on the provided sheet. The closest guess wins bonus points!",
    points: 15,
  },
  {
    id: 5,
    title: "Witch's Brew Ingredients",
    description: "Identify 5 mysterious potion ingredients",
    detailedDescription:
      "Visit the witch's cauldron station and identify 5 different 'magical' ingredients by smell and touch (don't worry, they're all safe!). Write down your guesses on the answer sheet.",
    points: 25,
  },
  {
    id: 6,
    title: "Vampire's Mirror",
    description: "Find the mirror that shows no reflection",
    detailedDescription:
      "Locate the special 'vampire mirror' that appears to show no reflection. This is actually a one-way mirror with special lighting. Take a selfie in front of it to prove you found it.",
    points: 20,
  },
  {
    id: 7,
    title: "Skeleton Key Puzzle",
    description: "Solve the bone-chilling riddle",
    detailedDescription:
      "Find the skeleton display and solve the riddle written on the scroll beneath it. The answer is a Halloween-themed word. Enter your answer in the puzzle box to unlock the next clue.",
    points: 30,
  },
  {
    id: 8,
    title: "Haunted Music Box",
    description: "Play the eerie melody on the old music box",
    detailedDescription:
      "Locate the antique music box and wind it up to play the haunting melody. Listen carefully to the tune - you'll need to hum it back to the game master to prove you completed this task.",
    points: 20,
  },
  {
    id: 9,
    title: "Black Cat's Path",
    description: "Follow the paw prints to the secret location",
    detailedDescription:
      "Find the black cat paw prints on the floor and follow them to their destination. The path will lead you to a hidden area where you'll find a special Halloween token as proof of completion.",
    points: 25,
  },
  {
    id: 10,
    title: "Master of the Spooky Race",
    description: "Complete the final Halloween challenge",
    detailedDescription:
      "Congratulations on making it this far! For the final challenge, you must perform a spooky dance while wearing the provided Halloween costume piece. Show your moves to the judge to claim victory!",
    points: 35,
  },
];

export default function App() {
  const [completedTasks, setCompletedTasks] = useState<
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
    (sum, task) => sum + task.points,
    0,
  );
  const earnedPoints = TASKS.filter((task) =>
    completedTasks.includes(task.id),
  ).reduce((sum, task) => sum + task.points, 0);

  const progress = (completedTasks.length / TASKS.length) * 100;

  const isTaskUnlocked = (taskId: number) => {
    if (taskId === 1) return true;
    return completedTasks.includes(taskId - 1);
  };

  const handleTaskClick = (task: Task) => {
    // Start timer when first task is opened
    if (task.id === 1 && !timerStarted) {
      setTimerStarted(true);
    }

    setSelectedTask(task);
    setCurrentScreen("detail");
  };

  const handleTaskComplete = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
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
        onBack={handleBackToTasks}
        onComplete={handleTaskComplete}
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
                Spooky Race
              </h1>
              <Skull className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Complete Halloween challenges to win!
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
                  {completedTasks.length}/{TASKS.length} tasks
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {earnedPoints}/{totalPoints} pts
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
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>

        {/* Completion Message */}
        {completedTasks.length === TASKS.length && (
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
              earned {earnedPoints} points! 🎃👻
            </p>
          </div>
        )}
      </div>
    </div>
  );
}