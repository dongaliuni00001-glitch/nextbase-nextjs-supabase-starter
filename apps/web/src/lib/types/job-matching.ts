import { UserProfile, UserProject, AttachedFile } from './profile';
import { StrengthItem, WeaknessItem, InterviewQA } from './ai';

// 저장된 취업 공고
export interface SavedJobPosting {
  id: string;
  user_id?: string;
  company: string;
  position: string;
  description: string;
  requirements: string;
  preferred_qualifications?: string;
  salary_range?: string;
  job_type?: string;
  location?: string;
  apply_deadline?: string;
  source_url?: string;
  created_at: string;
  saved_at?: string;
}

// 통합 분석 요청
export interface IntegratedResumeAnalysisRequest {
  resume_id?: string; // 저장된 자소서 ID (또는 새 텍스트)
  resume_text?: string; // 새로운 자소서 텍스트
  target_job_id?: string; // 분석할 특정 공고
  profile?: UserProfile; // 프로필 정보
  projects?: UserProject[]; // 연동할 프로젝트
  files?: AttachedFile[]; // 증빙 파일
  saved_jobs?: SavedJobPosting[]; // 지원 예정 공고들
}

// 프로필 분석 결과
export interface ProfileAnalysis {
  completeness: number; // 0-100
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

// 프로젝트 매칭 결과
export interface ProjectMatchingResult {
  project_id: string;
  project_title: string;
  relevance_score: number; // 0-100
  how_to_mention: string;
  keywords_to_highlight: string[];
}

// 공고 매칭 결과
export interface JobMatchingResult {
  job_id: string;
  company: string;
  position: string;
  match_score: number; // 0-100
  matched_skills: string[];
  missing_skills: string[];
  tailoring_tips: string[];
  why_good_fit: string;
}

// 통합 분석 결과
export interface IntegratedResumeAnalysisResult {
  summary: string;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  interviewPreparation: InterviewQA[];
  profileAnalysis: ProfileAnalysis;
  projectMatching: ProjectMatchingResult[];
  jobMatching: JobMatchingResult[];
  overallRecommendations: string[];
  competitiveScore: number;
}
