import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Lock, Image as ImageIcon } from "lucide-react";
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
              <span>Submitted at {formatTime(teamTask.completedAt)}</span>
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
              <span>Task not yet unlocked</span>
            </div>
          )}
        </CardHeader>
        {isCompleted && (
          <CardContent className="space-y-4">
            {teamTask.submissions && teamTask.submissions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm">Submitted Code:</div>
                {teamTask.submissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className={`px-3 py-2 rounded-md border ${
                      submission.result === 'SUCCESS' 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-destructive/30 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-sm">{submission.providedCode}</code>
                      <Badge variant="outline" className={
                        submission.result === 'SUCCESS'
                          ? 'border-primary/30 text-primary'
                          : 'border-destructive/30 text-destructive'
                      }>
                        {submission.result === 'SUCCESS' ? '✓ Correct' : '✗ Incorrect'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(submission.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {teamTask.bonusPhoto?.url && (
              <div 
                className="aspect-video rounded-md border border-border overflow-hidden bg-black/20 cursor-pointer hover:opacity-80 transition-opacity relative group"
                onClick={() => setPhotoModalOpen(true)}
              >
                <img
                  src={teamTask.bonusPhoto.url}
                  alt={task.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            {teamTask.hintUsed && (
              <div className="text-sm text-muted-foreground">
                💡 Hint used
              </div>
            )}
          </CardContent>
        )}
        {isUnlocked && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Currently in progress
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
