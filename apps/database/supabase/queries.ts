import 'server-only';

import { createSupabaseClient } from '@/supabase-clients/server';
import type { Tables } from '@/lib/database.types';

export type UserProfile = Tables<'profiles'>;
export type UserProject = Tables<'projects'>;
export type SavedJobPosting = Tables<'job_postings'>;
export type SavedResume = Tables<'resumes'>;
export type AttachedFile = Tables<'resume_files'>;

/**
 * 사용자 프로필 조회
 *
 * userId는 API Route에서 requireApiUser()로 인증된
 * 현재 로그인 사용자의 ID를 전달하는 것을 전제로 합니다.
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('프로필 조회 오류:', error);
    throw new Error('프로필 조회에 실패했습니다.');
  }

  return data;
}

/**
 * 사용자의 프로젝트 목록 조회
 */
export async function getUserProjects(
  userId: string,
): Promise<UserProject[]> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('프로젝트 조회 오류:', error);
    throw new Error('프로젝트 조회에 실패했습니다.');
  }

  return data ?? [];
}

/**
 * 특정 자소서에 연결된 프로젝트 조회
 */
export async function getLinkedProjects(
  resumeId: string,
): Promise<UserProject[]> {
  const supabase = await createSupabaseClient();

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('linked_projects')
    .eq('id', resumeId)
    .maybeSingle();

  if (resumeError) {
    console.error('자소서 연결 프로젝트 조회 오류:', resumeError);
    throw new Error('자소서 정보를 조회하지 못했습니다.');
  }

  if (!resume?.linked_projects?.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', resume.linked_projects);

  if (error) {
    console.error('연결 프로젝트 조회 오류:', error);
    throw new Error('연결된 프로젝트를 조회하지 못했습니다.');
  }

  return data ?? [];
}

/**
 * 특정 자소서의 첨부 파일 조회
 */
export async function getResumeFiles(
  resumeId: string,
): Promise<AttachedFile[]> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('resume_files')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('자소서 파일 조회 오류:', error);
    throw new Error('자소서 첨부 파일을 조회하지 못했습니다.');
  }

  return data ?? [];
}

/**
 * 저장된 취업 공고 조회
 *
 * userId를 전달하면 해당 사용자의 공고만 조회합니다.
 *
 * 현재 API의 기존 호출 구조를 유지하기 위해
 * userId를 optional로 둡니다.
 *
 * 향후 보안 작업에서는 API Route가 항상
 * requireApiUser()의 user.id를 전달하도록 통일합니다.
 */
export async function getSavedJobPostings(
  userId?: string,
): Promise<SavedJobPosting[]> {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from('job_postings')
    .select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) {
    console.error('취업 공고 조회 오류:', error);
    throw new Error('취업 공고 조회에 실패했습니다.');
  }

  return data ?? [];
}

/**
 * 특정 자소서 조회
 */
export async function getResume(
  resumeId: string,
): Promise<SavedResume | null> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .maybeSingle();

  if (error) {
    console.error('자소서 조회 오류:', error);
    throw new Error('자소서 조회에 실패했습니다.');
  }

  return data;
}

/**
 * 특정 사용자의 자소서 목록 조회
 *
 * 현재 API에서 직접 사용하지 않더라도
 * Resume 데이터 접근 계층을 한 곳으로 통일하기 위해 제공합니다.
 */
export async function getUserResumes(
  userId: string,
): Promise<SavedResume[]> {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('사용자 자소서 조회 오류:', error);
    throw new Error('자소서 목록 조회에 실패했습니다.');
  }

  return data ?? [];
}
```
