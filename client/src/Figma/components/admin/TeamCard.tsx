import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { AdminTeamView } from "../../lib/types";
import { 
  getTeamCurrentTask, 
  getCompletedTasksCount, 
  getLastSubmissionTime, 
  getTeamStatus,
  calculateTotalPoints
} from "../../lib/helpers";

interface TeamCardProps {
  team: AdminTeamView;
  onViewDetails: () => void;
}

export function TeamCard({ team, onViewDetails }: TeamCardProps) {
  const currentTask = getTeamCurrentTask(team);
  const completedCount = getCompletedTasksCount(team);
  const totalTasks = team.teamTasks.length;
  const lastSubmission = getLastSubmissionTime(team);
  const status = getTeamStatus(team);
  const isCompleted = status === 'finished';
  const progressPercentage = (completedCount / totalTasks) * 100;
  const totalPoints = calculateTotalPoints(team);

  return (
    <Card 
      className={`transition-all duration-300 ${
        isCompleted 
          ? 'border-primary bg-gradient-to-br from-card to-primary/10' 
          : 'border-border'
      } hover:scale-105 hover:shadow-lg hover:shadow-primary/20`}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <h3>{team.name || 'Unnamed Team'} {team.entryCode && `(${team.entryCode})`}</h3>
          <Badge variant="outline" className={
            isCompleted 
              ? 'border-primary/30 text-primary' 
              : 'border-accent/30 text-accent'
          }>
            {isCompleted ? '✅ Finished' : '🕸 In progress'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Last submission: {lastSubmission}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm mb-1">Current Task</div>
          <p>Task {currentTask?.order} — {currentTask?.task?.title}</p>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span>{completedCount} / {totalTasks} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {totalPoints} points
          </Badge>
          <Button 
            onClick={onViewDetails}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            View Team Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
