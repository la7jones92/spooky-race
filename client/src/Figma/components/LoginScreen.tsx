import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Ghost, Skull } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (teamCode: string) => void;
  error?: string | null; // ⬅️ add this
}

export function LoginScreen({ onLogin, error }: LoginScreenProps) { // ⬅️ include error
  const [teamCode, setTeamCode] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null); // ⬅️ add this

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamCode.trim()) {
      onLogin(teamCode.trim());
    }
  };
    // ⬅️ shake the button briefly whenever an error occurs
  useEffect(() => {
    if (!error || !buttonRef.current) return;
    buttonRef.current.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 450, easing: 'ease-in-out' }
    );
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ghost className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold text-primary">
              Versent Spooky Race
            </h1>
            <Skull className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-code">Team Code</Label>
                <Input
                  id="team-code"
                  type="text"
                  placeholder=""
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  className="bg-input-background border-border text-center uppercase placeholder:normal-case"
                  autoFocus
                />
              </div>
              <Button 
                ref={buttonRef}
                type="submit"         
                disabled={!teamCode.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Enter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
