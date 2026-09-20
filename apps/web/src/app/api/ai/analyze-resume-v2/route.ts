import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';
import { ResumeAnalyzer } from '@/app/api/utils/resume-analyzer';

import {
  getUserProfile,
  getUserProjects,
  getLinkedProjects,
  getResumeFiles,
  getSavedJobPostings,
  getResume,
} from '@/lib/supabase/queries';

import {
  IntegratedResumeAnalysisRequest,
  UserProject,
  SavedJobPosting,
  AttachedFile,
} from '@/lib/types/job-matching';

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. API 인증
    // ==========================================
    const auth = await requireApiUser();

    if (!auth) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 현재 1번 작업에서는 인증 확인만 합니다.
    // user.id를 실제 데이터 조회 기준으로 사용하는 것은 2번 작업에서 통일합니다.
    const { user } = auth;

    console.log('🔐 인증된 사용자:', user.id);

    // ==========================================
    // 2. 요청 데이터 파싱
    // ==========================================
    const body = await request.json();

    const {
      resumeText,
      resumeId,
      userId,
      companyName,
      position,
      targetJobIds,
    } = body;

    console.log('📋 통합 자소서 분석 요청');

    // ==========================================
    // 3. 자소서 텍스트 검증
    // ==========================================
    const finalResumeText =
      resumeText || (await getResumeContent(resumeId));

    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. 사용자 관련 데이터 준비
    // ==========================================
    let profile: any = null;
    let projects: UserProject[] = [];
    let jobs: SavedJobPosting[] = [];
    let files: AttachedFile[] = [];

    if (userId) {
      console.log('👤 사용자 정보 로드 중...');

      profile = await getUserProfile(userId);

      console.log('📁 프로젝트 로드 중...');

      projects = await getUserProjects(userId);

      console.log('💼 취업 공고 로드 중...');

      jobs = await getSavedJobPostings(userId);

      // ==========================================
      // 5. 자소서 첨부 파일 및 연결 프로젝트
      // ==========================================
      if (resumeId) {
        console.log('📎 첨부 파일 로드 중...');

        files = await getResumeFiles(resumeId);

        const linkedProjects = await getLinkedProjects(resumeId);

        if (linkedProjects.length > 0) {
          projects = linkedProjects;
        }
      }
    }

    // ==========================================
    // 6. 특정 채용공고 필터링
    // ==========================================
    if (targetJobIds && Array.isArray(targetJobIds)) {
      jobs = jobs.filter((job) => targetJobIds.includes(job.id));
    }

    console.log('📊 수집된 데이터:');
    console.log('- 인증 사용자:', user.id);
    console.log('- 프로필:', profile ? 'O' : 'X');
    console.log('- 프로젝트:', `${projects.length}개`);
    console.log('- 공고:', `${jobs.length}개`);
    console.log('- 파일:', `${files.length}개`);

    // ==========================================
    // 7. 분석 요청 데이터 구성
    // ==========================================
    const analysisRequest: IntegratedResumeAnalysisRequest = {
      resume_text: finalResumeText,
      profile: profile || undefined,
      projects: projects.length > 0 ? projects : undefined,
      saved_jobs: jobs.length > 0 ? jobs : undefined,
      files: files.length > 0 ? files : undefined,
    };

    // ==========================================
    // 8. AI 분석 실행
    // ==========================================
    const analyzer = new ResumeAnalyzer();

    const result = await analyzer.analyze(analysisRequest);

    if (!result) {
      return NextResponse.json(
        { error: '분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ 분석 완료, 결과 반환');

    // ==========================================
    // 9. 결과 반환
    // ==========================================
    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        resume_length: finalResumeText.length,
        profile_included: !!profile,
        projects_analyzed: projects.length,
        jobs_analyzed: jobs.length,
        files_included: files.length,
      },
    });
  } catch (error: unknown) {
    console.error('❌ 서버 오류:', error);

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 자소서 내용 조회 (ID로)
 */
async function getResumeContent(
  resumeId?: string
): Promise<string | null> {
  if (!resumeId) {
    return null;
  }

  try {
    const resume = await getResume(resumeId);

    return resume?.content || null;
  } catch (error) {
    console.error('자소서 조회 오류:', error);

    return null;
  }
}