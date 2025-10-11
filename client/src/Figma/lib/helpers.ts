import { AdminTeamView, TeamTask, TaskStatus } from "./types";

export const getTeamCurrentTask = (team: AdminTeamView): TeamTask | null => {
  const unlocked = team.teamTasks.find(tt => tt.status === TaskStatus.UNLOCKED);
  if (unlocked) return unlocked;
  
  const completed = team.teamTasks.filter(tt => tt.status === TaskStatus.COMPLETED);
  if (completed.length === team.teamTasks.length) {
    return team.teamTasks[team.teamTasks.length - 1]; // Last task if all complete
  }
  
  return team.teamTasks[0]; // First task if nothing unlocked
};

export const getCompletedTasksCount = (team: AdminTeamView): number => {
  return team.teamTasks.filter(tt => tt.status === TaskStatus.COMPLETED).length;
};

export const formatTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const getTeamStatus = (team: AdminTeamView): 'in-progress' | 'finished' => {
  return team.finishedAt ? 'finished' : 'in-progress';
};

export const getLastSubmissionTime = (team: AdminTeamView): string => {
  const completedTasks = team.teamTasks
    .filter(tt => tt.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  
  if (completedTasks.length === 0) return "No submissions";
  return formatTime(completedTasks[0].completedAt);
};

export const calculateTotalPoints = (team: AdminTeamView): number => {
  return team.totalPoints + team.totalBonusPoints - team.totalHintPenalties;
};
