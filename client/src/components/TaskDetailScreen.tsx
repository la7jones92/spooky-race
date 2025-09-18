import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Camera, FileText, CheckCircle, Upload, HelpCircle, SkipForward, AlertTriangle } from 'lucide-react';
import { Task } from './TaskCard';

interface TaskDetailScreenProps {
  task: Task;
  isCompleted: boolean;
  isBonusCompleted: boolean;
  isSkipped: boolean;
  isHintUsed: boolean;
  onBack: () => void;
  onComplete: (taskId: number, teamName?: string) => void;
  onBonusComplete: (taskId: number) => void;
  onSkip: (taskId: number) => void;
  onHintUse: (taskId: number) => void;
}

export function TaskDetailScreen({ task, isCompleted, isBonusCompleted, isSkipped, isHintUsed, onBack, onComplete, onBonusComplete, onSkip, onHintUse }: TaskDetailScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textCode, setTextCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBonusPhotoSubmit = () => {
    if (selectedFile) {
      onBonusComplete(task.id);
    }
  };

  const handleCodeSubmit = () => {
    if (!textCode.trim()) return;
    
    // Check if the code is correct
    const correctCode = task.completionCode?.toLowerCase();
    const enteredCode = textCode.trim().toLowerCase();
    
    if (correctCode && enteredCode !== correctCode) {
      setErrorMessage('Incorrect code. Please try again or use a hint.');
      return;
    }
    
    setErrorMessage('');
    onComplete(task.order);
  };

  const handleTeamNameSubmit = () => {
    if (teamName.trim()) {
      setErrorMessage('');
      onComplete(task.order, teamName.trim());
    }
  };

  const handleHintClick = () => {
    onHintUse(task.id);
  };

  const handleSkipClick = () => {
    onSkip(task.id);
  };

  const getSubmissionPlaceholder = (taskId: number) => {
    const placeholders = {
      2: "Enter: RIPPERSBLADE",
      3: "Enter: GHOSTTRAIN",
      4: "Enter: SLASHEDSECRET",
      5: "Enter: FINALCURTAIN",
      6: "Enter: CONDEMNED99",
      7: "Enter: ANCESTORS",
      8: "Enter: CAPTAINSCOIN",
      9: "Enter: CELLSTOALES",
      10: "Enter: LADYINBLACK"
    };
    return placeholders[taskId as keyof typeof placeholders] || "Enter completion code";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">{task.title}</h1>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {task.points} pts
              </Badge>
              <Badge variant="outline" className="border-accent/30 text-accent">
                +{task.bonusPoints} bonus
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Task Details with Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed">{task.detailedDescription}</p>
            
            {/* Submission Form */}
            <div className="border-t border-border pt-6">
              {task.id === 1 ? (
                /* Team Name Registration */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-input-background border-border"
                      disabled={isCompleted}
                    />
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-primary">Team Registered!</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleTeamNameSubmit}
                      disabled={!teamName.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Register Team
                    </Button>
                  )}
                </div>
              ) : (
                /* Code Submission */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="completion-code">Completion Code</Label>
                    <Input
                      id="completion-code"
                      placeholder={getSubmissionPlaceholder(task.id)}
                      value={textCode}
                      onChange={(e) => {
                        setTextCode(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className={`bg-input-background border-border ${
                        errorMessage ? 'border-destructive' : ''
                      }`}
                      disabled={isCompleted || isSkipped}
                    />
                    {errorMessage && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errorMessage}
                      </p>
                    )}
                    {isHintUsed && task.hint && (
                      <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                        <p className="text-sm text-accent">
                          <strong>Hint:</strong> {task.hint}
                        </p>
                      </div>
                    )}
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-primary">Task Completed!</span>
                    </div>
                  ) : isSkipped ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-muted/20 border border-muted rounded-lg">
                      <SkipForward className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Task Skipped</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleCodeSubmit}
                        disabled={!textCode.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Task
                      </Button>
                      
                      <div className="flex gap-2">
                        {/* Hint Button */}
                        {task.hint && !isHintUsed && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="flex-1 border-accent/30 text-accent hover:bg-accent/10">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Hint
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <HelpCircle className="w-5 h-5 text-accent" />
                                  Use Hint?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Using a hint will cost you {task.hintPenalty || 5} points. Your final score for this task will be reduced from {task.points} to {task.points - (task.hintPenalty || 5)} points.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleHintClick} className="bg-accent hover:bg-accent/90">
                                  Show Hint
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Skip Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="flex-1 border-muted-foreground/30 text-muted-foreground hover:bg-muted/10">
                              <SkipForward className="w-4 h-4 mr-2" />
                              Skip
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Skip Task?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Skipping this task means you won't earn any points for it ({task.points} + {task.bonusPoints} points lost). You'll be able to continue to the next task, but this one will be marked as skipped.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleSkipClick} className="bg-destructive hover:bg-destructive/90">
                                Skip Task
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bonus Photo Section */}
        <Card className={`transition-all duration-300 ${
          isCompleted 
            ? "border-accent/30" 
            : "border-border/50 opacity-60"
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              isCompleted ? "text-accent" : "text-muted-foreground"
            }`}>
              <Camera className="w-5 h-5" />
              Bonus Photo Challenge (+{task.bonusPoints} points)
            </CardTitle>
            <CardDescription className={isCompleted ? "" : "text-muted-foreground/70"}>
              {task.bonusPhotoDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bonus-photo" className={isCompleted ? "" : "text-muted-foreground"}>
                  Upload Bonus Photo
                </Label>
                <Input
                  id="bonus-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`bg-input-background border-border ${
                    !isCompleted ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={!isCompleted || isBonusCompleted}
                />
                {selectedFile && isCompleted && !isBonusCompleted && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              {isBonusCompleted ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-accent">Bonus Photo Submitted!</span>
                </div>
              ) : (
                <Button 
                  onClick={handleBonusPhotoSubmit}
                  disabled={!isCompleted || !selectedFile}
                  className={`w-full ${
                    isCompleted 
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Bonus Photo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}