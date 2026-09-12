// 사용자 프로필 정보
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  education?: EducationItem[];
  social_links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  field: string;
  graduation_date?: string;
}