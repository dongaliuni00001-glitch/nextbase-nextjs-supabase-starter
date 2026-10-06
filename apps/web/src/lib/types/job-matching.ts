import type { Tables } from '@/lib/database.types';

/**
 * ============================================================
 * Database-backed types
 * ============================================================
 */

export type UserProfile = Tables<'profiles'> & {
  /**
   * 기존 UI/레거시 코드 호환 필드
   * 실제 DB에서는 full_name 등을 사용할 수 있으므로 optional로 둔다.
   */
  name?: string | null;
  experience_years?: number | null;
};

export type UserProject = Tables<'projects'>;

export type SavedJobPosting = Tables<'job_postings'> & {
  /**
   * 기존 UI 호환 필드
   */
  position?: string | null;
};

export type SavedResume = Tables<'resumes'>;

export type AttachedFile = Tables<'resume_files'>;

/**
 * ============================================================
 * AI analysis request
 * ============================================================
 */

export interface IntegratedResumeAnalysisRequest {
  resume_text: string;

  profile?: UserProfile | null;

  projects: UserProject[];

  jobs: SavedJobPosting[];

  files: AttachedFile[];

  company_name?: string;

  position?: string;
}

/**
 * ============================================================
 * AI analysis result
 * ============================================================
 */

export interface ProfileAnalysis {
  completeness: number;
  recommendations: string[];
}

export interface ResumeStrength {
  title: string;
  description: string;
  evidence: string;
  relates_to_profile: boolean;
  relates_to_projects: boolean;
  relates_to_jobs: boolean;
}

export interface ResumeWeakness {
  title: string;
  description: string;
  improvement: string;
  can_cover_with_projects?: string;
  can_cover_with_skills?: string;
}

export interface ProjectMatching {
  project_title: string;
  relevance_score: number;
  how_to_mention: string;
  keywords_to_highlight: string[];
}

export interface JobMatching {
  company: string;
  position: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  why_good_fit: string;
  tailoring_tips: string[];
}

export interface InterviewPreparation {
  question: string;
  strategy: string;
  sampleAnswer: string;
}

export interface IntegratedResumeAnalysisResult {
  summary: string;

  profileAnalysis: ProfileAnalysis;

  strengths: ResumeStrength[];

  weaknesses: ResumeWeakness[];

  projectMatching: ProjectMatching[];

  jobMatching: JobMatching[];

  interviewPreparation: InterviewPreparation[];

  competitiveScore: number;

  overallRecommendations: string[];
}