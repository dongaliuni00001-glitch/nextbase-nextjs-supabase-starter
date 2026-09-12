// 저장된 자소서
export interface SavedResume {
  id: string;
  user_id: string;
  title: string;
  content: string;
  company_name?: string;
  position?: string;
  target_job_id?: string; // 목표 공고
  linked_projects?: string[]; // 연동된 프로젝트 ID
  linked_files?: string[]; // 연동된 증빙 파일 ID
  created_at: string;
  updated_at: string;
}

// 첨부 파일
export interface AttachedFile {
  id: string;
  resume_id: string;
  file_name: string;
  file_url: string;
  file_type: string; // 'pdf', 'image', 'document'
  description?: string;
  created_at: string;
}

// 사용자 프로젝트
export interface UserProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  role: string;
  tech_stack: string;
  start_date?: string;
  end_date?: string;
  live_link?: string;
  github_link?: string;
  achievements?: string;
  created_at: string;
  updated_at: string;
}