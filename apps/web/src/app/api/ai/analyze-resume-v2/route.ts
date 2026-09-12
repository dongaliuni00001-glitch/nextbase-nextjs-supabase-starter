import { NextResponse } from 'next/server';
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
} from '@/lib/types/job-matching'; // 또는 profiles.ts 위치에 맞게 조정

export async function POST(request: Request) {
  try {
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

    // ✅ 자소서 텍스트 검증
    const finalResumeText = resumeText || (await getResumeContent(resumeId));
    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // ✅ 프로필 정보 및 배열 타입 명시
    let profile = null;
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

      if (resumeId) {
        console.log('📎 첨부 파일 로드 중...');
        files = await getResumeFiles(resumeId);

        // 자소서에 연동된 프로젝트만 필터링
        const linkedProjects = await getLinkedProjects(resumeId);
        if (linkedProjects.length > 0) {
          projects = linkedProjects;
        }
      }
    }

    // ✅ 특정 공고만 필터링 (optional)
    if (targetJobIds && Array.isArray(targetJobIds)) {
      jobs = jobs.filter((job) => targetJobIds.includes(job.id));
    }

    console.log('📊 수집된 데이터:');
    console.log('- 프로필:', profile ? 'O' : 'X');
    console.log('- 프로젝트:', projects.length + '개');
    console.log('- 공고:', jobs.length + '개');
    console.log('- 파일:', files.length + '개');

    // ✅ 분석 요청 데이터 구성
    const analysisRequest: IntegratedResumeAnalysisRequest = {
      resume_text: finalResumeText,
      profile: profile || undefined,
      projects: projects.length > 0 ? projects : undefined,
      saved_jobs: jobs.length > 0 ? jobs : undefined,
      files: files.length > 0 ? files : undefined,
    };

    // ✅ 분석 실행 (인자 없이 호출)
    const analyzer = new ResumeAnalyzer();
    const result = await analyzer.analyze(analysisRequest);

    if (!result) {
      return NextResponse.json(
        { error: '분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ 분석 완료, 결과 반환');

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
  } catch (error: any) {
    console.error('❌ 서버 오류:', error);
    return NextResponse.json(
      {
        error: error.message || '서버 오류가 발생했습니다.',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

/**
 * 자소서 내용 조회 (ID로)
 */
async function getResumeContent(resumeId?: string): Promise<string | null> {
  if (!resumeId) return null;

  try {
    const resume = await getResume(resumeId);
    return resume?.content || null;
  } catch {
    return null;
  }
}