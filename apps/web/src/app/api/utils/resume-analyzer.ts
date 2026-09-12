import { AIClient } from './ai-client';
import {
  UserProfile,
  UserProject,
  SavedJobPosting,
  AttachedFile,
} from '@/lib/types/profile';
import {
  IntegratedResumeAnalysisRequest,
  IntegratedResumeAnalysisResult,
} from '@/lib/types/job-matching';
import { generateIntegratedResumeAnalysisPrompt } from './prompts';

/**
 * 통합 자소서 분석기
 * - 프로필, 프로젝트, 공고를 모두 고려한 심층 분석
 */
export class ResumeAnalyzer {
  private aiClient: AIClient;

  constructor(provider: 'openai' | 'gemini' = 'openai') {
    this.aiClient = new AIClient(provider);
  }

  /**
   * 통합 분석 실행
   */
  async analyze(
    data: IntegratedResumeAnalysisRequest
  ): Promise<IntegratedResumeAnalysisResult | null> {
    try {
      console.log('🔍 통합 자소서 분석 시작');
      console.log('프로필:', data.profile?.name || '없음');
      console.log('프로젝트 수:', data.projects?.length || 0);
      console.log('취업 공고 수:', data.saved_jobs?.length || 0);

      // 프롬프트 생성
      const prompt = generateIntegratedResumeAnalysisPrompt(data);
      console.log('📝 프롬프트 길이:', prompt.length);

      // AI 호출
      const result = await this.aiClient.generateJSON<IntegratedResumeAnalysisResult>(
        prompt
      );

      if (!result.success) {
        console.error('❌ AI 분석 실패:', result.error);
        return null;
      }

      // 결과 검증 및 보강
      const validatedResult = this.validateAndEnhanceResult(
        result.data!,
        data
      );

      console.log('✅ 분석 완료');
      return validatedResult;
    } catch (error: any) {
      console.error('❌ 분석 오류:', error);
      return null;
    }
  }

  /**
   * 결과 검증 및 보강
   */
  private validateAndEnhanceResult(
    result: IntegratedResumeAnalysisResult,
    data: IntegratedResumeAnalysisRequest
  ): IntegratedResumeAnalysisResult {
    // 기본값 설정
    if (!result.summary) {
      result.summary = '자기소개서 분석을 완료했습니다.';
    }

    if (!result.strengths || result.strengths.length === 0) {
      result.strengths = [
        {
          title: '분석 대기 중',
          description: 'AI 분석 중입니다.',
          evidence: '잠시만 기다려주세요.',
          relates_to_profile: false,
          relates_to_projects: false,
          relates_to_jobs: false,
        },
      ];
    }

    if (!result.profileAnalysis) {
      result.profileAnalysis = {
        completeness: 0,
        strengths: [],
        gaps: [],
        recommendations: [],
      };
    }

    if (!result.projectMatching) {
      result.projectMatching = [];
    }

    if (!result.jobMatching) {
      result.jobMatching = [];
    }

    if (!result.competitiveScore) {
      result.competitiveScore = 0;
    }

    return result;
  }
}

/**
 * 프로젝트와 자소서의 연관성 점수 계산
 */
export function calculateProjectRelevance(
  project: UserProject,
  resumeText: string,
  jobRequirements?: string
): number {
  let score = 0;

  // 프로젝트 제목이 자소서에 언급되었는가?
  if (resumeText.includes(project.title)) {
    score += 30;
  }

  // 기술 스택이 자소서에 포함되었는가?
  const techs = project.tech_stack.split(',').map((t) => t.trim());
  const techMatches = techs.filter((tech) =>
    resumeText.toLowerCase().includes(tech.toLowerCase())
  ).length;
  score += Math.min(techMatches * 10, 30);

  // 공고 요구사항과 기술이 매칭되었는가?
  if (jobRequirements) {
    const jobTechs = jobRequirements
      .toLowerCase()
      .split(',')
      .map((t) => t.trim());
    const jobMatches = techs.filter((tech) =>
      jobRequirements.toLowerCase().includes(tech.toLowerCase())
    ).length;
    score += Math.min(jobMatches * 20, 40);
  }

  return Math.min(score, 100);
}

/**
 * 프로필 완성도 계산
 */
export function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0;
  let total = 0;

  const fields = [
    { field: 'name', weight: 15 },
    { field: 'email', weight: 10 },
    { field: 'skills', weight: 20 },
    { field: 'bio', weight: 15 },
    { field: 'location', weight: 10 },
    { field: 'social_links', weight: 30 },
  ];

  fields.forEach(({ field, weight }) => {
    total += weight;
    const value = profile[field as keyof UserProfile];
    if (value && (typeof value === 'string' ? value.trim().length > 0 : true)) {
      score += weight;
    }
  });

  return Math.round((score / total) * 100);
}

/**
 * 공고 매칭 점수 계산
 */
export function calculateJobMatchScore(
  skills: string[],
  jobRequirements: string
): number {
  if (skills.length === 0) return 0;

  const matchedSkills = skills.filter((skill) =>
    jobRequirements.toLowerCase().includes(skill.toLowerCase())
  ).length;

  return Math.round((matchedSkills / skills.length) * 100);
}