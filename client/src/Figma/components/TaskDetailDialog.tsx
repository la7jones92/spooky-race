import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';
import { Task } from '../types/game';

interface TaskDetailDialogProps {
  task: Task | null;
  isCompleted: boolean;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

export function TaskDetailDialog({ task, isCompleted, isOpen, onClose, onComplete }: TaskDetailDialogProps) {
  if (!task) return null;

  const handleComplete = () => {
    onComplete(task.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="w-5 h-5 text-primary" />
            {task.title}
            <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary border-primary/30">
              {task.points} pts
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View task details and mark as complete when finished.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="mb-2 text-primary">Task Details</h4>
            <p className="text-sm leading-relaxed">
              {task.detailedDescription}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            {!isCompleted ? (
              <Button 
                onClick={handleComplete}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Mark as Complete
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-primary">Task Completed!</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full border-border hover:bg-muted"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}