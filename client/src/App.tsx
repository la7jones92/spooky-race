import React, { useState, useEffect } from "react";
import { TaskCard, Task } from "./components/TaskCard";
import { TaskDetailScreen } from "./components/TaskDetailScreen";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Ghost, Skull, Trophy, Clock } from "lucide-react";

const TASKS: Task[] = [
  {
    id: 1,
    title: "👻 Name of the Night",
    description:
      "Register your team and discover the ghostly secret",
    detailedDescription:
      "Welcome to the Versent Spooky Race! To begin your Halloween adventure, first register your team with a creative, spooky name. Then discover the mysterious ghostly name that haunts this place. Look for clues left behind by spirits of the past - the answer lies where shadows meet moonlight.",
    points: 10,
    bonusPoints: 5,
    bonusPhotoDescription: "Take a spooky team photo at the starting location with everyone making their best ghost faces!",
  },
  {
    id: 2,
    title: "⚔️ Ripper's Reach",
    description: "Find the legendary blade of the notorious figure",
    detailedDescription:
      "Locate the infamous weapon that once belonged to a dark historical figure. This task will test your knowledge of local legends and your ability to follow cryptic directions through the streets.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the historical marker or plaque related to this dark figure's story",
    completionCode: "RIPPERSBLADE",
    hint: "Look for the infamous knife display near the old courthouse area",
    hintPenalty: 5,
  },
  {
    id: 3,
    title: "🚂 Platform Poltergeist",
    description: "Encounter the restless spirit at the station",
    detailedDescription:
      "Visit the old railway platform where a ghostly presence is said to linger. Look for signs of supernatural activity and document your findings. The poltergeist only appears to those who know where to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture a photo of the old railway platform with your team recreating a Victorian-era train waiting pose",
    completionCode: "GHOSTTRAIN",
    hint: "The spirit haunts Platform 1 at Flinders Street Station",
    hintPenalty: 7,
  },
  {
    id: 4,
    title: "🍻 The Slashed Secret",
    description: "Uncover the hidden truth in the tavern",
    detailedDescription:
      "Head to the historic pub where a dark secret has been buried for decades. Search for clues among the old bottles and beneath the ancient floorboards. The truth has been slashed away but not forgotten.",
    points: 15,
    bonusPoints: 10,
    bonusPhotoDescription: "Take a photo of your team toasting with drinks (non-alcoholic is fine) at the historic tavern location",
    completionCode: "SLASHEDSECRET",
    hint: "Check the old Mitre Tavern on Bank Place",
    hintPenalty: 5,
  },
  {
    id: 5,
    title: "🎭 The Final Bow",
    description: "Witness the last performance of the phantom actor",
    detailedDescription:
      "Find the old theater where a legendary performer met their tragic end. Look for traces of their final show and the dramatic conclusion that still echoes through the halls. The curtain never truly fell.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Stage a dramatic theatrical pose with your team in front of the old theater, recreating a final bow scene",
    completionCode: "FINALCURTAIN",
    hint: "The Princess Theatre on Spring Street holds the tragic tale",
    hintPenalty: 8,
  },
  {
    id: 6,
    title: "🏢 Count of the Condemned",
    description: "Tally the souls trapped in the fortress",
    detailedDescription:
      "Visit the imposing structure where many met their fate. Count the markers of those who never left and piece together their stories. Each soul has left a trace for those brave enough to look.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Photograph the imposing fortress structure with your team looking appropriately solemn and respectful",
    completionCode: "CONDEMNED99",
    hint: "Look for the Old Melbourne Gaol on Russell Street",
    hintPenalty: 6,
  },
  {
    id: 7,
    title: "🛒 Underfoot Ancestors",
    description: "Discover what lies beneath the market grounds",
    detailedDescription:
      "Explore the area beneath the old market where ancient secrets are buried. Look for signs of those who came before and the stories written in stone beneath your feet. History runs deep in these grounds.",
    points: 30,
    bonusPoints: 15,
    bonusPhotoDescription: "Take a photo of any historical markers, plaques, or stone inscriptions you find beneath the market area",
    completionCode: "ANCESTORS",
    hint: "The Queen Victoria Market sits atop the old Melbourne Cemetery",
    hintPenalty: 10,
  },
  {
    id: 8,
    title: "🚢 Captain on Collins",
    description: "Follow the maritime ghost's final voyage",
    detailedDescription:
      "Trace the path of the phantom captain who still walks Collins Street. Find the nautical clues he left behind and discover where his final journey ended. The captain's spirit guards his greatest treasure.",
    points: 20,
    bonusPoints: 10,
    bonusPhotoDescription: "Capture your team in a nautical-themed pose on Collins Street, with someone acting as the phantom captain",
    completionCode: "CAPTAINSCOIN",
    hint: "Follow Collins Street to the old shipping district near the Yarra",
    hintPenalty: 6,
  },
  {
    id: 9,
    title: "🚔 Cells to Ales",
    description: "From lockup to liberation, follow the prisoner's path",
    detailedDescription:
      "Trace the journey from the old city jail to the freedom of the local alehouse. Follow the path taken by countless souls who moved from confinement to celebration. Find where justice met jubilation in Melbourne's dark history.",
    points: 25,
    bonusPoints: 15,
    bonusPhotoDescription: "Document the journey with a photo showing both the old jail location and the alehouse destination in one creative shot",
    completionCode: "CELLSTOALES",
    hint: "Start at the Old Melbourne Gaol and end at Young & Jackson's",
    hintPenalty: 8,
  },
  {
    id: 10,
    title: "🍺 Last Orders with the Lady in Black",
    description: "Meet the mysterious woman who never left the bar",
    detailedDescription:
      "Complete your journey at the historic watering hole where the Lady in Black still waits for her last drink. Find her favorite spot and leave an offering. She'll reveal the final secret to those who show proper respect.",
    points: 35,
    bonusPoints: 20,
    bonusPhotoDescription: "Take a respectful final photo of your team raising a glass to the Lady in Black at her favorite spot",
    completionCode: "LADYINBLACK",
    hint: "The Croft Institute on Croft Alley holds her spirit",
    hintPenalty: 12,
  },
];

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