import React from 'react';
import { TaskCard } from './TaskCard';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Ghost, Skull, Trophy, LogOut } from 'lucide-react';
import { GameState } from '../lib/gameLogic';
import { TeamTask } from '../lib/types';

interface TaskGridScreenProps {
  gameState: GameState;
  progress: { completed: number; total: number; percentage: number };
  isGameComplete: boolean;
  onTaskClick: (teamTask: TeamTask) => void;
  onLogout: () => void;
}

export function TaskGridScreen({
  gameState,
  progress,
  isGameComplete,
  onTaskClick,
  onLogout,
}: TaskGridScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Logout Button - positioned at the top right */}
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Ghost className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">
                Versent Spooky Race
              </h1>
              <Skull className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              {gameState.team.name ? `Team: ${gameState.team.name}` : "Register your team to begin!"}
            </p>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Progress</span>
              <Badge
                variant="outline"
                className="border-primary/30 text-primary"
              >
                {progress.completed}/{progress.total} tasks
              </Badge>
            </div>
            <Progress value={progress.percentage} className="h-3" />
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.teamTasks.map((teamTask) => (
            <TaskCard
              key={teamTask.id}
              teamTask={teamTask}
              onClick={() => onTaskClick(teamTask)}
            />
          ))}
        </div>

        {/* Completion Message */}
        {isGameComplete && (
          <div className="mt-8 text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Congratulations!
              </h2>
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">
              You've completed all the spooky challenges! 🎃👻
            </p>
          </div>
        )}
      </div>
    </div>
  );
}