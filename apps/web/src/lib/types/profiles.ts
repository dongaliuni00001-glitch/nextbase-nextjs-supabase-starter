export interface UserProfile {
  id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  major?: string;
  university?: string;
  bio?: string;
  [key: string]: any;
}

export interface UserProject {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  role?: string;
  skills?: string[];
  [key: string]: any;
}

export interface AttachedFile {
  id?: string;
  name: string;
  url: string;
  [key: string]: any;
}

export interface SavedJobPosting {
  id: string;
  title: string;
  company?: string;
  description?: string;
  [key: string]: any;
}