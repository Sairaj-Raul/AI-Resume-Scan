export interface ResumeAnalysisResult {
  candidateName: string;
  score: number;
  goodPoints: string[];
  badPoints: string[];
  error?: string;
}
