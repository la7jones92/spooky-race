import { RefreshCw, Ghost } from "lucide-react";
import { Button } from "../ui/button";
import { TeamCard } from "./TeamCard";
import { AdminTeamView } from "../../lib/types";

interface DashboardProps {
  teams: AdminTeamView[];
  lastUpdated: string;
  onSelectTeam: (teamId: string) => void;
  onRefresh: () => void;
}

export function Dashboard({ teams, lastUpdated, onSelectTeam, onRefresh }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="h-6 w-6 text-primary" />
              <h1>Spooky Race Admin Portal 👻</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team}
              onViewDetails={() => onSelectTeam(team.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
