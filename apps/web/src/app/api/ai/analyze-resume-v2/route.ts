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
<<<<<<< HEAD
    // =========================================================
    // 1. API 인증
    // =========================================================
    const auth = await requireApiUser();

    if (!auth) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { user } = auth;

    // =========================================================
    // 2. 요청 body 파싱
    // =========================================================
    let body: {
      resumeText?: string;
      resumeId?: string;
      userId?: string;
      companyName?: string;
      position?: string;
      targetJobIds?: string[];
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

=======
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

>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    const {
      resumeText,
      resumeId,
      userId,
      companyName,
      position,
      targetJobIds,
    } = body;

    console.log('📋 통합 자소서 분석 요청');
    console.log('👤 인증된 사용자:', user.id);

<<<<<<< HEAD
    // =========================================================
    // 3. Task 1에서는 기존 userId 구조를 일단 유지
    //
    // 주의:
    // 현재 단계에서는 기존 클라이언트 userId를 제거하지 않습니다.
    // Task 2에서 userId를 완전히 제거하고 user.id를 사용하도록
    // 변경할 예정입니다.
    // =========================================================

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // =========================================================
    // 4. 인증 사용자와 요청 userId가 다른 경우 차단
    //
    // Task 2에서 userId 자체를 제거하면 이 부분도 없어집니다.
    // 현재는 기존 프론트엔드 구조를 유지하면서
    // 다른 사용자의 데이터 접근을 방지합니다.
    // =========================================================

    if (userId !== user.id) {
      return NextResponse.json(
        { error: '사용자 정보가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // =========================================================
    // 5. 자기소개서 내용 확인
    // =========================================================

    const finalResumeText =
      typeof resumeText === 'string' && resumeText.trim()
        ? resumeText
        : await getResumeContent(resumeId);

=======
    // ==========================================
    // 3. 자소서 텍스트 검증
    // ==========================================
    const finalResumeText =
      resumeText || (await getResumeContent(resumeId));

>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // =========================================================
    // 6. 기본 데이터 초기화
    // =========================================================

    let profile: any = null;
=======
    // ==========================================
    // 4. 사용자 관련 데이터 준비
    // ==========================================
    let profile: any = null;
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    let projects: UserProject[] = [];
    let jobs: SavedJobPosting[] = [];
    let files: AttachedFile[] = [];

<<<<<<< HEAD
    // =========================================================
    // 7. 사용자 데이터 조회
    // =========================================================
=======
    if (userId) {
      console.log('👤 사용자 정보 로드 중...');

      profile = await getUserProfile(userId);
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

<<<<<<< HEAD
    console.log('👤 사용자 정보 로드 중...');
=======
      console.log('📁 프로젝트 로드 중...');

      projects = await getUserProjects(userId);
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

<<<<<<< HEAD
    profile = await getUserProfile(userId);
=======
      console.log('💼 취업 공고 로드 중...');

      jobs = await getSavedJobPostings(userId);
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

<<<<<<< HEAD
    console.log('📁 프로젝트 로드 중...');
=======
      // ==========================================
      // 5. 자소서 첨부 파일 및 연결 프로젝트
      // ==========================================
      if (resumeId) {
        console.log('📎 첨부 파일 로드 중...');

        files = await getResumeFiles(resumeId);
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

<<<<<<< HEAD
    projects = await getUserProjects(userId);

    console.log('💼 취업 공고 로드 중...');

    jobs = await getSavedJobPostings(userId);

    // =========================================================
    // 8. Resume 관련 데이터 조회
    // =========================================================

    if (resumeId) {
      console.log('📎 첨부 파일 로드 중...');

      files = await getResumeFiles(resumeId);

      // 자소서에 연동된 프로젝트만 사용
      const linkedProjects = await getLinkedProjects(resumeId);

      if (linkedProjects.length > 0) {
        projects = linkedProjects;
=======
        const linkedProjects = await getLinkedProjects(resumeId);

        if (linkedProjects.length > 0) {
          projects = linkedProjects;
        }
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
      }
    }

<<<<<<< HEAD
    // =========================================================
    // 9. 특정 채용공고만 분석하는 경우 필터링
    // =========================================================

    if (Array.isArray(targetJobIds)) {
=======
    // ==========================================
    // 6. 특정 채용공고 필터링
    // ==========================================
    if (targetJobIds && Array.isArray(targetJobIds)) {
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
      jobs = jobs.filter((job) => targetJobIds.includes(job.id));
    }

    // =========================================================
    // 10. 디버깅 로그
    // =========================================================

    console.log('📊 수집된 데이터:');
    console.log('- 인증 사용자:', user.id);
    console.log('- 프로필:', profile ? 'O' : 'X');
    console.log('- 프로젝트:', `${projects.length}개`);
    console.log('- 공고:', `${jobs.length}개`);
    console.log('- 파일:', `${files.length}개`);

<<<<<<< HEAD
    // =========================================================
    // 11. AI 분석 요청 데이터 생성
    // =========================================================

=======
    // ==========================================
    // 7. 분석 요청 데이터 구성
    // ==========================================
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    const analysisRequest: IntegratedResumeAnalysisRequest = {
      resume_text: finalResumeText,
      profile: profile || undefined,
      projects: projects.length > 0 ? projects : undefined,
      saved_jobs: jobs.length > 0 ? jobs : undefined,
      files: files.length > 0 ? files : undefined,
    };

<<<<<<< HEAD
    // =========================================================
    // 12. AI 분석 실행
    // =========================================================

    console.log('🤖 ResumeAnalyzer 실행 중...');

=======
    // ==========================================
    // 8. AI 분석 실행
    // ==========================================
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    const analyzer = new ResumeAnalyzer();

    const result = await analyzer.analyze(analysisRequest);

    if (!result) {
      return NextResponse.json(
        { error: '분석 결과를 생성하지 못했습니다.' },
        { status: 500 }
      );
    }

    // =========================================================
    // 13. 결과 반환
    // =========================================================

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
        company_name: companyName || null,
        position: position || null,
      },
    });
<<<<<<< HEAD
  } catch (error: unknown) {
    // =========================================================
    // 14. 서버 오류 처리
    // =========================================================

    console.error('❌ /api/ai/analyze-resume-v2 서버 오류:', error);

=======
  } catch (error: unknown) {
    console.error('❌ 서버 오류:', error);

>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    return NextResponse.json(
      {
<<<<<<< HEAD
        error: '서버에서 분석을 처리하는 중 오류가 발생했습니다.',
=======
        error: '서버 오류가 발생했습니다.',
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================
 * 자기소개서 내용 조회
 * ============================================================
 *
 * resumeId가 전달된 경우 DB에서 자기소개서 내용을 조회합니다.
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
<<<<<<< HEAD
  } catch (error) {
    console.error('❌ Resume 조회 실패:', error);

=======
  } catch (error) {
    console.error('자소서 조회 오류:', error);

>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    return null;
  }
}