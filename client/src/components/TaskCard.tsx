import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lock } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  isUnlocked: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isUnlocked, isCompleted, isSkipped, onClick }: TaskCardProps) {
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
            <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>
              {isUnlocked ? task.title : 'Locked'}
            </span>
          </CardTitle>
          <Badge variant={isCompleted ? 'default' : 'secondary'} className="bg-primary/20 text-primary border-primary/30">
            {task.points + task.bonusPoints} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
          {isUnlocked ? task.description : ''}
        </p>
        {isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-primary">
            <span>✅</span>
            Completed!
          </div>
        )}
        {isSkipped && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>🚫</span>
            Skipped!
          </div>
        )}
      </CardContent>
    </Card>
  );
}