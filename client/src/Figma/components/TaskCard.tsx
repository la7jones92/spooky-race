import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lock } from 'lucide-react';
import { TeamTask, TaskStatus } from '../lib/types';

interface TaskCardProps {
  teamTask: TeamTask;
  onClick: () => void;
}

export function TaskCard({ teamTask, onClick }: TaskCardProps) {
  const task = teamTask.task;
  if (!task) return null;

  const isUnlocked = teamTask.status !== TaskStatus.LOCKED;
  const isCompleted = teamTask.status === TaskStatus.COMPLETED;
  const isSkipped = teamTask.status === TaskStatus.SKIPPED;

  const getStatusDisplay = () => {
    switch (teamTask.status) {
      case TaskStatus.LOCKED:
        return { icon: '🔒', text: 'Locked', showDescription: false };
      case TaskStatus.COMPLETED:
        return { icon: '✅', text: 'Completed!', showDescription: false };
      case TaskStatus.SKIPPED:
        return { icon: '🚫', text: 'Skipped!', showDescription: false };
      default:
        return { icon: null, text: null, showDescription: true };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card 
      className={`
        transition-all duration-300 cursor-pointer
        ${isUnlocked 
          ? 'hover:scale-105 hover:shadow-lg hover:shadow-primary/20' 
          : 'opacity-50 cursor-not-allowed'
        }
        ${isCompleted 
          ? 'border-primary bg-gradient-to-br from-card to-primary/10' 
          : 'border-border'
        }
      `}
      onClick={isUnlocked ? onClick : undefined}
    >
      <CardHeader className={isCompleted || isSkipped ? 'pb-4' : 'pb-3'}>
        <CardTitle className="flex items-center gap-2">
          {teamTask.status === TaskStatus.LOCKED && <Lock className="w-4 h-4 text-muted-foreground" />}
          <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>
            {teamTask.status === TaskStatus.LOCKED ? `${statusDisplay.icon} Locked` : task.title}
          </span>
        </CardTitle>
        {(isCompleted || isSkipped) && statusDisplay.text && (
          <div className={`flex items-center gap-2 text-sm ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
            <span>{statusDisplay.icon}</span>
            {statusDisplay.text}
          </div>
        )}
      </CardHeader>
      {statusDisplay.showDescription && (
        <CardContent className="pt-0">
          <p className={`text-sm whitespace-pre-line ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
            {task.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}