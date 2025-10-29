import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trophy, CheckCircle } from 'lucide-react';

interface CompletionScreenProps {
  teamName: string;
  completedTasks: number;
  skippedTasks: number;
  onBackToTasks: () => void;
}

export function CompletionScreen({
  teamName,
  completedTasks,
  skippedTasks,
  onBackToTasks
}: CompletionScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Completion Card */}
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl text-primary mb-2">
                🎉 Congratulations! 🎉
              </CardTitle>
              <CardDescription className="text-lg">
                <span className="text-foreground">{teamName}</span> has completed the Versent Spooky Race!
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className={`grid ${skippedTasks > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 max-w-md mx-auto`}>
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                </div>
                <p className="text-2xl text-primary">{completedTasks}/10</p>
              </div>

              {skippedTasks > 0 && (
                <div className="p-4 bg-muted/20 border border-muted rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Tasks Skipped</span>
                  </div>
                  <p className="text-2xl text-muted-foreground">{skippedTasks}</p>
                </div>
              )}
            </div>

            {/* Back Button */}
            <Button
              onClick={onBackToTasks}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

