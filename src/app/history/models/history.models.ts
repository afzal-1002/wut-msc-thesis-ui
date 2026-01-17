export interface AIHistoryResult {
  issueKey: string;
  projectKey?: string;
  aiProvider: string;
  createdAt: string; // ISO date
  estimatedHours: number;
  actualHours?: number;
  explanationEnabled?: boolean;
  userPromptProvided?: boolean;
}

export interface AccuracyTrendResult {
  timeBucket: string; // e.g. date or week label
  meanAbsoluteError: number;
}

export interface ModelComparisonResult {
  issueKey?: string;
  actualHours: number;
  geminiEstimate?: number;
  deepSeekEstimate?: number;
}

export interface ExplainabilityHistoryResult {
  explanationEnabled: boolean;
  avgError: number;
  avgResponseTimeSec: number;
}

export interface HumanInLoopHistoryResult {
  userPromptProvided: boolean;
  avgError: number;
  errorVariance?: number;
}

export interface StabilityHistoryResult {
  timeBucket?: string;
  estimationVariance: number;
  responseTimeVariance: number;
}

export interface AIResponseArchive {
  issueKey: string;
  projectKey?: string;
  aiProvider: string;
  createdAt: string;
  estimatedHours: number;
  actualHours?: number;
  explanationEnabled?: boolean;
  userPromptProvided?: boolean;
  prompt?: string;
  rawResponse?: string;
}
