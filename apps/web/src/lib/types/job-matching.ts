import { UserProfile, UserProject, AttachedFile } from './profile';

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

export interface ProfileAnalysis {
  completeness: number; // 0-100
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface ProjectMatchingResult {
  project_id: string;
  project_title: string;
  relevance_score: number; // 0-100
  how_to_mention: string;
  keywords_to_highlight: string[];
}

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

export interface StrengthItem {
  title: string;
  description: string;
  evidence: string;
  relates_to_profile?: boolean;
  relates_to_projects?: boolean;
  relates_to_jobs?: boolean;
}

export interface WeaknessItem {
  title: string;
  description: string;
  improvement: string;
  can_cover_with_projects?: string; // 프로젝트로 커버 가능한지
  can_cover_with_skills?: string; // 기술로 커버 가능한지
}

export interface InterviewQA {
  question: string;
  strategy: string;
  sampleAnswer: string;
  keywords_from_resume?: string[]; // 자소서에서 추출한 키워드
  keywords_from_projects?: string[]; // 프로젝트에서 추출한 키워드
}