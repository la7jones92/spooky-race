import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lock, CheckCircle } from 'lucide-react';

export interface Task {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  points: number;
}

interface TaskCardProps {
  task: Task;
  isUnlocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isUnlocked, isCompleted, onClick }: TaskCardProps) {
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            {isCompleted && <CheckCircle className="w-4 h-4 text-primary" />}
            <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>
              {task.title}
            </span>
          </CardTitle>
          <Badge variant={isCompleted ? 'default' : 'secondary'} className="bg-primary/20 text-primary border-primary/30">
            {task.points} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
          {isUnlocked ? task.description : 'Locked'}
        </p>
        {isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
            <CheckCircle className="w-4 h-4" />
            Completed!
          </div>
        )}
      </CardContent>
    </Card>
  );
}