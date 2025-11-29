
export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AIUsageMetrics {
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCost: number; // in USD (estimated)
  };
  latency: number; // in milliseconds
  model: string;
}

export interface AtsScore {
  overallScore: number;
  impactScore: number;
  brevityScore: number;
  styleScore: number;
  sectionScore: number;
}

export interface ResumeSection {
  name: string;
  completeness: number; // 0-100
  issues: string[];
}

// Extended with metrics
export interface ResumeAnalysisResult extends AIUsageMetrics {
  atsScore: AtsScore;
  summary: string;
  topSkills: string[];
  missingKeywords: string[];
  improvements: string[];
  sections: ResumeSection[];
  parsedContent?: {
    name: string;
    email: string;
    experienceYears: number;
  };
}

// Extended with metrics
export interface JobMatchResult extends AIUsageMetrics {
  matchPercentage: number;
  matchLevel: 'Low' | 'Moderate' | 'High' | 'Excellent';
  missingSkills: string[];
  matchingSkills: string[];
  gapAnalysis: string;
  culturalFitAnalysis: string;
}

// Extended with metrics
export interface TailoredContent extends AIUsageMetrics {
  coverLetter: string;
  tailoredSummary: string;
  tailoredSkills: string[];
}

export interface CareerAdviceResult {
  text: string;
  links: {
    title: string;
    url: string;
  }[];
}

export interface ChartData {
  name: string;
  value: number;
  fullMark?: number;
}

export interface HistoryItem {
  id: string;
  date: string;
  fileName: string;
  score: number;
  jobRole?: string;
}
