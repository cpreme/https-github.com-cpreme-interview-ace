
export enum AppStep {
  SETUP = 'SETUP',
  ANALYSIS = 'ANALYSIS',
  CONFIG = 'CONFIG',
  INTERVIEW = 'INTERVIEW',
  FEEDBACK = 'FEEDBACK'
}

export interface GapAnalysis {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendedFocusAreas: string[];
}

export interface InterviewConfig {
  questionCount: number;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  context?: string;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface QuestionFeedback {
  question: string;
  userAnswer: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
}

export interface InterviewFeedback {
  overallScore: number;
  overallSummary: string;
  questionAnalysis: QuestionFeedback[];
}
