import {
  UserProfile,
  UserProject,
  AttachedFile,
  SavedJobPosting,
} from '@/lib/types/profile';
import { IntegratedResumeAnalysisRequest } from '@/lib/types/job-matching';

/**
 * 통합 자소서 분석 프롬프트 생성
 * - 프로필 정보 포함
 * - 프로젝트 경험 포함
 * - 취업 공고 매칭 포함
 */
export function generateIntegratedResumeAnalysisPrompt(
  data: IntegratedResumeAnalysisRequest
): string {
  const { resume_text, profile, projects, saved_jobs } = data;

  // 프로필 정보 정리
  const profileSection = profile
    ? `
[사용자 프로필]
- 이름: ${profile.name}
- 경력: ${profile.experience_years || 'N/A'}년
- 보유 기술: ${profile.skills?.join(', ') || '없음'}
- 위치: ${profile.location || '미지정'}
- 자기소개: ${profile.bio || '없음'}
- GitHub: ${profile.social_links?.github || '없음'}
- 포트폴리오: ${profile.social_links?.portfolio || '없음'}
`
    : '';

  // 프로젝트 정보 정리
  const projectsSection =
    projects && projects.length > 0
      ? `
[연동된 프로젝트]
${projects
  .map(
    (p, idx) => `
프로젝트 ${idx + 1}: ${p.title}
- 역할: ${p.role}
- 기술 스택: ${p.tech_stack}
- 설명: ${p.description}
- 주요 성과: ${p.achievements || '없음'}
- GitHub: ${p.github_link || '없음'}
- 링크: ${p.live_link || '없음'}
`
  )
  .join('\n')}
`
      : '';

  // 공고 정보 정리
  const jobsSection =
    saved_jobs && saved_jobs.length > 0
      ? `
[지원 예정 취업 공고]
${saved_jobs
  .map(
    (job, idx) => `
공고 ${idx + 1}: ${job.company} - ${job.position}
- 요구사항: ${job.requirements}
- 우대사항: ${job.preferred_qualifications || '없음'}
- 직무 설명: ${job.description.substring(0, 300)}...
`
  )
  .join('\n')}
`
      : '';

  return `당신은 국내 빅테크 회사의 현직 채용담당자, 커리어 컨설턴트, 그리고 기술 면접관입니다.

사용자의 프로필, 자기소개서, 연동된 프로젝트 경험, 그리고 지원 예정 취업 공고들을 모두 분석하여:
1. 자기소개서의 강점과 약점
2. 프로필의 완성도와 개선점
3. 프로젝트 경험이 공고 요구사항과 얼마나 매칭되는지
4. 면접 준비 전략
5. 공고별 맞춤형 자소서 작성 팁

을 상세하고 실질적으로 분석해주세요.

${profileSection}

${projectsSection}

[자기소개서]
${resume_text}

${jobsSection}

[분석 요청사항]

1. **자소서 분석**
   - 강점 3-5개 (구체적 근거 포함, 프로젝트나 프로필과의 연결 명시)
   - 약점 2-3개 (프로젝트나 기술로 커버 가능한지 표기)
   - 개선 수정안 3-5개

2. **프로필 완성도 분석**
   - 현재 프로필 점수 (0-100)
   - 강점 분석
   - 채워야 할 부분
   - 구체적 개선 방안

3. **프로젝트 매칭 분석**
   각 프로젝트마다:
   - 공고 요구사항과의 연관성 (0-100점)
   - 어떻게 자소서에 녹여야 하는지
   - 강조할 키워드

4. **공고별 맞춤형 분석**
   각 공고마다:
   - 매칭 점수 (0-100)
   - 강점 분석 (지원 시 강조할 부분)
   - 약점 분석 (보완 필요한 부분)
   - 자소서 맞춤형 제시 팁 3개

5. **면접 준비**
   - 예상 질문 3개
   - 각 질문별 답변 전략 (프로젝트/프로필 활용)
   - 샘플 답변

6. **전체 종합 평가**
   - 경쟁력 점수 (0-100)
   - 종합 평가 및 근거

JSON 형식으로 한글로 응답하세요 (JSON 외 텍스트 제외):

{
  "summary": "자소서 핵심 요약",
  "strengths": [
    {
      "title": "강점",
      "description": "설명",
      "evidence": "근거",
      "relates_to_profile": true/false,
      "relates_to_projects": true/false,
      "relates_to_jobs": true/false
    }
  ],
  "weaknesses": [
    {
      "title": "약점",
      "description": "설명",
      "improvement": "개선방안",
      "can_cover_with_projects": "프로젝트X로 커버 가능" 또는 null,
      "can_cover_with_skills": "스킬X로 커버 가능" 또는 null
    }
  ],
  "interviewPreparation": [
    {
      "question": "질문",
      "strategy": "전략",
      "sampleAnswer": "답변",
      "keywords_from_resume": ["키워드"],
      "keywords_from_projects": ["키워드"]
    }
  ],
  "profileAnalysis": {
    "completeness": 75,
    "strengths": ["강점1", "강점2"],
    "gaps": ["부족1", "부족2"],
    "recommendations": ["개선안1", "개선안2"]
  },
  "projectMatching": [
    {
      "project_id": "프로젝트ID",
      "project_title": "프로젝트명",
      "relevance_score": 85,
      "how_to_mention": "자소서에 어떻게 언급할 것인가",
      "keywords_to_highlight": ["키워드1", "키워드2"]
    }
  ],
  "jobMatching": [
    {
      "job_id": "공고ID",
      "company": "회사명",
      "position": "직무",
      "match_score": 82,
      "matched_skills": ["스킬1", "스킬2"],
      "missing_skills": ["필요스킬1"],
      "tailoring_tips": ["팁1", "팁2", "팁3"],
      "why_good_fit": "왜 적합한가"
    }
  ],
  "overallRecommendations": [
    "종합 추천사항 1",
    "종합 추천사항 2",
    "종합 추천사항 3"
  ],
  "competitiveScore": 78
}`;
}