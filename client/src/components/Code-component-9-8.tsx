import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Camera, FileText, CheckCircle, Upload } from 'lucide-react';
import { Task } from './TaskCard';

interface TaskDetailScreenProps {
  task: Task;
  isCompleted: boolean;
  onBack: () => void;
  onComplete: (taskId: number) => void;
}

export function TaskDetailScreen({ task, isCompleted, onBack, onComplete }: TaskDetailScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textCode, setTextCode] = useState('');
  const [submissionType, setSubmissionType] = useState<'photo' | 'code'>('photo');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePhotoSubmit = () => {
    if (selectedFile) {
      onComplete(task.id);
    }
  };

  const handleCodeSubmit = () => {
    if (textCode.trim()) {
      onComplete(task.id);
    }
  };

  const getSubmissionPlaceholder = (taskId: number) => {
    const placeholders = {
      1: "Enter: PUMPKIN2024",
      2: "Enter: WEBSTICKY",
      3: "Enter: GHOSTTALE",
      4: "Enter your candy count (e.g., 127)",
      5: "Enter: WITCHBREW",
      6: "Enter: NOVAMPIRE",
      7: "Enter: SKELETON",
      8: "Enter: MELODY",
      9: "Enter: BLACKPATH",
      10: "Enter: SPOOKYDANCE"
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
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {task.points} pts
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Task Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{task.detailedDescription}</p>
          </CardContent>
        </Card>

        {/* Completion Status */}
        {isCompleted ? (
          <Card className="border-primary bg-gradient-to-br from-card to-primary/10">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                <span className="text-lg text-primary">Task Completed!</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Submission Form */
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Completion</CardTitle>
              <CardDescription>
                Choose how you'd like to submit proof of completion for this task.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={submissionType} onValueChange={(value) => setSubmissionType(value as 'photo' | 'code')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photo" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photo Upload
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Code Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photo" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="photo-upload">Upload a photo as proof</Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-input-background border-border"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handlePhotoSubmit}
                    disabled={!selectedFile}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Photo
                  </Button>
                </TabsContent>

                <TabsContent value="code" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="completion-code">Enter completion code</Label>
                    <Input
                      id="completion-code"
                      placeholder={getSubmissionPlaceholder(task.id)}
                      value={textCode}
                      onChange={(e) => setTextCode(e.target.value)}
                      className="bg-input-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the code you found or discovered during this task.
                    </p>
                  </div>
                  <Button 
                    onClick={handleCodeSubmit}
                    disabled={!textCode.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Code
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Make sure your photo clearly shows the completed task
            </p>
            <p className="text-sm text-muted-foreground">
              • Codes are usually found at the task location or given by staff
            </p>
            <p className="text-sm text-muted-foreground">
              • Ask for help if you're stuck - Halloween should be fun!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}