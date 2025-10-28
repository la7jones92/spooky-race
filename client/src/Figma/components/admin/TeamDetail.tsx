import { AdminTeamView } from "../../lib/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ChevronLeft } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { getCompletedTasksCount, formatTime, getTeamStatus, getLastSubmissionTime } from "../../lib/helpers";

interface TeamDetailProps {
  team: AdminTeamView;
  onBack: () => void;
}

export function TeamDetail({ team, onBack }: TeamDetailProps) {
  const completedCount = getCompletedTasksCount(team);
  const totalTasks = team.teamTasks.length;
  const progressPercentage = (completedCount / totalTasks) * 100;
  const status = getTeamStatus(team);
  const lastSubmission = getLastSubmissionTime(team);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1>{team.name || 'Unnamed Team'}{team.entryCode ? ` (${team.entryCode})` : ''} — Progress Overview</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {completedCount}/{totalTasks} completed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{progressPercentage.toFixed(0)}% complete</span>
            <span>{completedCount} of {totalTasks} tasks</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Started: {formatTime(team.startedAt)}</span>
            <span>•</span>
            <span>Last submission: {lastSubmission}</span>
            <span>•</span>
            <span>
              Status: {status === 'finished' ? '✅ Finished' : '🕸 In progress'}
            </span>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {team.teamTasks.map((teamTask) => (
            <TaskItem key={teamTask.id} teamTask={teamTask} />
          ))}
        </div>
      </div>
    </div>
  );
}
