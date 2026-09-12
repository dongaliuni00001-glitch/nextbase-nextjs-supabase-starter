/**
 * Supabase 데이터베이스 쿼리 함수
 * 프로필, 프로젝트, 공고 등 사용자 데이터 조회
 */

import {
  UserProfile,
  UserProject,
  SavedResume,
  AttachedFile,
} from '@/lib/types/profile';
import { SavedJobPosting } from '@/lib/types/job-matching';

// Note: 실제 Supabase 클라이언트 초기화는 별도 파일에서 수행
// 여기서는 쿼리 구조만 정의합니다

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log(`👤 프로필 조회: ${userId}`);
    // TODO: Supabase 쿼리 구현
    // const { data, error } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('id', userId)
    //   .single();
    return null;
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return null;
  }
}

/**
 * 사용자의 모든 프로젝트 조회
 */
export async function getUserProjects(userId: string): Promise<UserProject[]> {
  try {
    console.log(`📁 프로젝트 조회: ${userId}`);
    // TODO: Supabase 쿼리 구현
    // const { data, error } = await supabase
    //   .from('projects')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });
    return [];
  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    return [];
  }
}

/**
 * 자소서에 연동된 프로젝트 조회
 */
export async function getLinkedProjects(resumeId: string): Promise<UserProject[]> {
  try {
    console.log(`🔗 연동 프로젝트 조회: ${resumeId}`);
    // TODO: Supabase 쿼리 구현
    return [];
  } catch (error) {
    console.error('연동 프로젝트 조회 오류:', error);
    return [];
  }
}

/**
 * 첨부 파일 조회
 */
export async function getResumeFiles(resumeId: string): Promise<AttachedFile[]> {
  try {
    console.log(`📎 파일 조회: ${resumeId}`);
    // TODO: Supabase 쿼리 구현
    return [];
  } catch (error) {
    console.error('파일 조회 오류:', error);
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
    console.log(`💼 공고 조회: ${userId || '전체'}`);
    // TODO: Supabase 쿼리 구현
    return [];
  } catch (error) {
    console.error('공고 조회 오류:', error);
    return [];
  }
}

/**
 * 특정 자소서 조회
 */
export async function getResume(resumeId: string): Promise<SavedResume | null> {
  try {
    console.log(`📝 자소서 조회: ${resumeId}`);
    // TODO: Supabase 쿼리 구현
    return null;
  } catch (error) {
    console.error('자소서 조회 오류:', error);
    return null;
  }
}

/**
 * 자소서 내용 조회
 */
export async function getResumeContent(resumeId?: string): Promise<string | null> {
  if (!resumeId) return null;

  try {
    const resume = await getResume(resumeId);
    return resume?.content || null;
  } catch {
    return null;
  }
}
