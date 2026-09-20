import { NextResponse } from 'next/server';

import { requireApiUser } from '@/lib/auth/api';
import { ResumeAnalyzer } from '@/app/api/utils/resume-analyzer';

import {
  getUserProfile,
  getUserProjects,
  getSavedJobPostings,
  getResume,
  getResumeFiles,
  getLinkedProjects,
} from '@/lib/supabase/queries';

import type {
  IntegratedResumeAnalysisRequest,
  UserProject,
  SavedJobPosting,
  AttachedFile,
} from '@/lib/types/job-matching';

/**
 * POST /api/ai/analyze-resume-v2
 *
 * 통합 자기소개서 AI 분석 API
 *
 * 인증:
 * - 클라이언트에서 userId를 받지 않는다.
 * - Supabase 세션에서 인증된 사용자 ID를 가져온다.
 *
 * 지원 입력:
 * - resumeText: 직접 입력한 자기소개서
 * - resumeId: 저장된 자기소개서 ID
 * - companyName: 지원 회사
 * - position: 지원 직무
 * - targetJobIds: 분석할 채용공고 ID 목록
 *
 * 사용자 데이터:
 * - profile
 * - projects
 * - saved jobs
 * - resume files
 * - resume linked projects
 */
export async function POST(request: Request) {
  try {
    // =========================================================
    // 1. API 인증
    // =========================================================

    const auth = await requireApiUser();

    if (!auth) {
      return NextResponse.json(
        {
          error: '로그인이 필요합니다.',
        },
        {
          status: 401,
        }
      );
    }

    const { user } = auth;

    console.log('🔐 인증된 사용자:', user.id);

    // =========================================================
    // 2. Request Body 파싱
    // =========================================================

    let body: {
      resumeText?: unknown;
      resumeId?: unknown;
      companyName?: unknown;
      position?: unknown;
      targetJobIds?: unknown;
      selectedJobIds?: unknown;
      selectedProjectIds?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: '잘못된 요청 형식입니다.',
        },
        {
          status: 400,
        }
      );
    }

    const resumeText =
      typeof body.resumeText === 'string'
        ? body.resumeText
        : undefined;

    const resumeId =
      typeof body.resumeId === 'string' && body.resumeId.trim()
        ? body.resumeId.trim()
        : undefined;

    const companyName =
      typeof body.companyName === 'string'
        ? body.companyName.trim()
        : undefined;

    const position =
      typeof body.position === 'string'
        ? body.position.trim()
        : undefined;

    /*
     * 현재 클라이언트의 새로운 구조는 targetJobIds를 사용한다.
     *
     * 기존 클라이언트/코드에서 selectedJobIds를 보낼 가능성도 있으므로
     * 당분간 호환성을 유지한다.
     */
    const rawTargetJobIds =
      Array.isArray(body.targetJobIds)
        ? body.targetJobIds
        : Array.isArray(body.selectedJobIds)
          ? body.selectedJobIds
          : undefined;

    const targetJobIds = rawTargetJobIds
      ? rawTargetJobIds.filter(
          (id): id is string =>
            typeof id === 'string' && id.trim().length > 0
        )
      : undefined;

    // =========================================================
    // 3. 자기소개서 내용 확보
    // =========================================================

    let finalResumeText = resumeText;

    if (!finalResumeText?.trim() && resumeId) {
      console.log('📄 저장된 자기소개서 조회:', resumeId);

      finalResumeText = await getResumeContent(
        resumeId,
        user.id
      );
    }

    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        {
          error: '자기소개서 내용을 입력해주세요.',
        },
        {
          status: 400,
        }
      );
    }

    finalResumeText = finalResumeText.trim();

    // 너무 큰 요청으로 인한 비용/성능 문제 방지
    const MAX_RESUME_LENGTH = 30000;

    if (finalResumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        {
          error: `자기소개서는 ${MAX_RESUME_LENGTH.toLocaleString()}자 이하로 입력해주세요.`,
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 4. 사용자 관련 데이터 준비
    // =========================================================

    let profile: any = null;
    let projects: UserProject[] = [];
    let jobs: SavedJobPosting[] = [];
    let files: AttachedFile[] = [];

    // =========================================================
    // 5. 프로필 조회
    // =========================================================

    try {
      console.log('👤 사용자 프로필 로드 중...');

      profile = await getUserProfile(user.id);
    } catch (error) {
      console.error('❌ 프로필 조회 실패:', error);

      /*
       * 프로필이 없더라도 자기소개서 분석 자체는 계속 진행한다.
       */
      profile = null;
    }

    // =========================================================
    // 6. 프로젝트 조회
    // =========================================================

    try {
      console.log('📁 프로젝트 로드 중...');

      projects = await getUserProjects(user.id);

      if (!Array.isArray(projects)) {
        projects = [];
      }
    } catch (error) {
      console.error('❌ 프로젝트 조회 실패:', error);
      projects = [];
    }

    // =========================================================
    // 7. 취업 공고 조회
    // =========================================================

    try {
      console.log('💼 취업 공고 로드 중...');

      jobs = await getSavedJobPostings(user.id);

      if (!Array.isArray(jobs)) {
        jobs = [];
      }
    } catch (error) {
      console.error('❌ 취업 공고 조회 실패:', error);
      jobs = [];
    }

    // =========================================================
    // 8. 저장된 자기소개서 관련 파일 조회
    // =========================================================

    if (resumeId) {
      try {
        console.log('📎 자기소개서 첨부 파일 조회 중...');

        files = await getResumeFiles(resumeId);

        if (!Array.isArray(files)) {
          files = [];
        }
      } catch (error) {
        console.error('❌ 자기소개서 파일 조회 실패:', error);
        files = [];
      }

      // =======================================================
      // 9. 자기소개서 연결 프로젝트 조회
      // =======================================================

      try {
        console.log('🔗 자기소개서 연결 프로젝트 조회 중...');

        const linkedProjects = await getLinkedProjects(resumeId);

        if (Array.isArray(linkedProjects) && linkedProjects.length > 0) {
          projects = linkedProjects;
        }
      } catch (error) {
        console.error('❌ 연결 프로젝트 조회 실패:', error);
      }
    }

    // =========================================================
    // 10. 특정 채용공고만 분석하는 경우 필터링
    // =========================================================

    if (targetJobIds) {
      const targetJobIdSet = new Set(targetJobIds);

      jobs = jobs.filter((job) => targetJobIdSet.has(job.id));
    }

    console.log('📊 분석 데이터 준비 완료');
    console.log('- 사용자:', user.id);
    console.log('- 프로필:', profile ? '있음' : '없음');
    console.log('- 프로젝트:', `${projects.length}개`);
    console.log('- 취업 공고:', `${jobs.length}개`);
    console.log('- 파일:', `${files.length}개`);
    console.log('- 자기소개서:', `${finalResumeText.length}자`);

    // =========================================================
    // 11. AI 분석 요청 데이터 생성
    // =========================================================

    const analysisRequest: IntegratedResumeAnalysisRequest = {
      resume_text: finalResumeText,
      profile: profile || undefined,
      projects,
      jobs,
      files,
      company_name: companyName || undefined,
      position: position || undefined,
    };

    // =========================================================
    // 12. AI 분석 실행
    // =========================================================

    console.log('🤖 ResumeAnalyzer 실행 중...');

    const analyzer = new ResumeAnalyzer();

    const result = await analyzer.analyze(analysisRequest);

    console.log('✅ ResumeAnalyzer 분석 완료');

    // =========================================================
    // 13. 성공 응답
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    // =========================================================
    // 14. 서버 오류 처리
    // =========================================================

    console.error(
      '❌ /api/ai/analyze-resume-v2 서버 오류:',
      error
    );

    return NextResponse.json(
      {
        error: '서버에서 분석을 처리하는 중 오류가 발생했습니다.',
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * 저장된 자기소개서 내용을 조회한다.
 *
 * 중요한 보안 원칙:
 * - resumeId만으로 다른 사용자의 자기소개서를 가져오지 않는다.
 * - 조회된 resume의 소유자가 현재 로그인 사용자와 일치하는지 확인한다.
 */
async function getResumeContent(
  resumeId: string,
  userId: string
): Promise<string | null> {
  try {
    const resume = await getResume(resumeId);

    if (!resume) {
      return null;
    }

    /*
     * 프로젝트의 Resume 타입에 따라 소유자 필드 이름이
     * user_id 또는 userId일 수 있으므로 둘 다 확인한다.
     *
     * 둘 다 존재하지 않는 기존 데이터 구조에서는
     * getResume() 자체가 RLS로 보호되어 있다는 전제하에
     * content를 반환한다.
     */
    const resumeUserId =
      (resume as { user_id?: string }).user_id ??
      (resume as { userId?: string }).userId;

    if (resumeUserId && resumeUserId !== userId) {
      console.warn(
        '⚠️ 자기소개서 접근 권한 없음:',
        resumeId,
        userId
      );

      return null;
    }

    return (
      (resume as { content?: string | null }).content ??
      null
    );
  } catch (error) {
    console.error('❌ Resume 조회 실패:', error);

    return null;
  }
}