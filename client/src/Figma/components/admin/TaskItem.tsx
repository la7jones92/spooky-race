import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Lock, Image as ImageIcon, Award } from "lucide-react";
import { TeamTask, TaskStatus } from "../../lib/types";
import { useState } from "react";
import { PhotoModal } from "./PhotoModal";
import { formatTime } from "../../lib/helpers";

interface TaskItemProps {
  teamTask: TeamTask;
}

export function TaskItem({ teamTask }: TaskItemProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const isCompleted = teamTask.status === TaskStatus.COMPLETED;
  const isSkipped = teamTask.status === TaskStatus.SKIPPED;
  const isLocked = teamTask.status === TaskStatus.LOCKED;
  const isUnlocked = teamTask.status === TaskStatus.UNLOCKED;
  
  const task = teamTask.task;
  if (!task) return null;

  const totalPoints = teamTask.pointsAwarded + teamTask.bonusAwarded;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="outline" className="border-primary/30 text-primary">✅ Completed</Badge>;
    }
    if (isSkipped) {
      return <Badge variant="outline" className="border-destructive/30 text-destructive">⏭️ Skipped</Badge>;
    }
    if (isLocked) {
      return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">🔒 Locked</Badge>;
    }
    return <Badge variant="outline" className="border-accent/30 text-accent">⏳ In progress</Badge>;
  };

  return (
    <>
      <Card className={`transition-all duration-300 ${
        isCompleted 
          ? 'border-primary/30 bg-gradient-to-br from-card to-primary/5' 
          : 'border-border'
      }`}>
        <CardHeader className={isCompleted || isSkipped ? 'pb-4' : 'pb-3'}>
          <div className="flex items-center justify-between mb-1">
            <CardTitle>Task {teamTask.order} — {task.title}</CardTitle>
            {getStatusBadge()}
          </div>
          {isCompleted && teamTask.completedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Submitted at {formatTime(teamTask.completedAt)} • +{totalPoints} pts</span>
              {teamTask.bonusAwarded > 0 && (
                <>
                  <Award className="h-4 w-4 text-accent ml-2" />
                  <span className="text-accent">+{teamTask.bonusAwarded} bonus</span>
                </>
              )}
            </div>
          )}
          {isSkipped && teamTask.skippedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Skipped at {formatTime(teamTask.skippedAt)}</span>
            </div>
          )}
          {isLocked && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>{task.points} points available</span>
              {task.bonusPoints > 0 && (
                <span className="text-accent">• +{task.bonusPoints} bonus possible</span>
              )}
            </div>
          )}
        </CardHeader>
        {isCompleted && (
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {task.description}
            </div>
            {teamTask.bonusPhoto?.url && (
              <div 
                className="aspect-video rounded-md border border-border overflow-hidden bg-black/20 cursor-pointer hover:opacity-80 transition-opacity relative group"
                onClick={() => setPhotoModalOpen(true)}
              >
                <img
                  src={teamTask.bonusPhoto.url}
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            {teamTask.hintUsed && (
              <div className="text-sm text-muted-foreground">
                💡 Hint used (-{task.hintPointsPenalty} pts)
              </div>
            )}
          </CardContent>
        )}
        {isUnlocked && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {task.points} points available • {task.bonusPoints > 0 && `+${task.bonusPoints} bonus possible • `}Currently in progress
            </div>
          </CardContent>
        )}
      </Card>

      {teamTask.bonusPhoto?.url && (
        <PhotoModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          photoUrl={teamTask.bonusPhoto.url}
          taskTitle={`Task ${teamTask.order} — ${task.title}`}
          completedAt={formatTime(teamTask.completedAt)}
        />
      )}
    </>
  );
}
