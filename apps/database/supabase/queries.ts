import { createClient } from '@supabase/supabase-js';
import {
  UserProfile,
  SavedResume,
  UserProject,
  AttachedFile,
  SavedJobPosting,
} from '../types/profile';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('프로필 조회 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('프로필 조회 실패:', error);
    return null;
  }
}

/**
 * 사용자의 모든 프로젝트 조회
 */
export async function getUserProjects(userId: string): Promise<UserProject[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('프로젝트 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    return [];
  }
}

/**
 * 자소서에 연동된 프로젝트 조회
 */
export async function getLinkedProjects(
  resumeId: string
): Promise<UserProject[]> {
  try {
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('linked_projects')
      .eq('id', resumeId)
      .single();

    if (resumeError) return [];

    if (!resumeData?.linked_projects?.length) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', resumeData.linked_projects);

    if (error) return [];

    return data || [];
  } catch (error) {
    console.error('연동 프로젝트 조회 실패:', error);
    return [];
  }
}

/**
 * 첨부 파일 조회
 */
export async function getResumeFiles(resumeId: string): Promise<AttachedFile[]> {
  try {
    const { data, error } = await supabase
      .from('resume_files')
      .select('*')
      .eq('resume_id', resumeId);

    if (error) return [];

    return data || [];
  } catch (error) {
    console.error('파일 조회 실패:', error);
    return [];
  }
}

/**
 * 저장된 취업 공고 조회
 */
export async function getSavedJobPostings(
  userId?: string
): Promise<SavedJobPosting[]> {
  try {
    let query = supabase.from('job_postings').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) return [];

    return data || [];
  } catch (error) {
    console.error('공고 조회 실패:', error);
    return [];
  }
}

/**
 * 특정 자소서 조회
 */
export async function getResume(resumeId: string): Promise<SavedResume | null> {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) return null;

    return data;
  } catch (error) {
    console.error('자소서 조회 실패:', error);
    return null;
  }
}