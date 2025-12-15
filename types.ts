
export interface DailyLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Task {
  id: string;
  name: string;
  dailyGoal: number;
  weeklyDays: number;
  startDate: string;
  endDate: string;
  logs: DailyLog[];
  createdBy: string; // Name of the user who created the task
}

export interface AnalysisResult {
  basicAnalysis: string[];
  goalPerformance: string[];
  averageAndPrediction: string[];
  suggestions: string[];
  timestamp: number;
}

export interface User {
  email: string;
  name: string;
  password?: string; // In a real app, never store plain text passwords on client
}
