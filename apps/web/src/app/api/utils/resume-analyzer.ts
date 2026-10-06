import 'server-only';

import type {
  IntegratedResumeAnalysisRequest,
  IntegratedResumeAnalysisResult,
} from '@/lib/types/job-matching';

const DEFAULT_MODEL = 'gpt-4o-mini';

const EMPTY_RESULT: IntegratedResumeAnalysisResult = {
  summary: 'AI 분석 결과를 생성하지 못했습니다.',
  profileAnalysis: {
    completeness: 0,
    recommendations: [],
  },
  strengths: [],
  weaknesses: [],
  projectMatching: [],
  jobMatching: [],
  interviewPreparation: [],
  competitiveScore: 0,
  overallRecommendations: [],
};

export class ResumeAnalyzer {
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
    }

    this.apiKey = apiKey;
    this.model = process.env.OPENAI_RESUME_MODEL || DEFAULT_MODEL;
  }

  async analyze(
    request: IntegratedResumeAnalysisRequest
  ): Promise<IntegratedResumeAnalysisResult> {
    const prompt = this.buildPrompt(request);

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                '당신은 전문적인 커리어 컨설턴트이자 채용 담당자이며 기술 면접관입니다. 반드시 요청된 JSON 구조만 반환하세요.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: {
            type: 'json_object',
          },
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error('OpenAI ResumeAnalyzer 오류:', {
        status: response.status,
        body: errorText,
      });

      throw new Error('AI 분석 서비스 호출에 실패했습니다.');
    }

    const data: unknown = await response.json();

    const content = this.extractContent(data);

    if (!content) {
      throw new Error('AI 분석 결과가 비어 있습니다.');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error('AI 분석 JSON 파싱 실패:', error);
      console.error('AI 원본 응답:', content);

      throw new Error('AI 분석 결과 형식이 올바르지 않습니다.');
    }

    return this.normalizeResult(parsed);
  }

  private buildPrompt(
    request: IntegratedResumeAnalysisRequest
  ): string {
    const profile = request.profile ?? null;

    const projectSummary = request.projects.map((project) => ({
      id: project.id,
      title: project.title,
      role: project.role,
      tech_stack: project.tech_stack,
      description: project.description,
    }));

    const jobSummary = request.jobs.map((job) => ({
      id: job.id,
      company:
        job.company ??
        job.company_name ??
        '회사명 미상',
      position:
        job.position ??
        job.job_title ??
        job.title ??
        '직무 미상',
      description:
        job.job_description ??
        job.content ??
        job.extracted_text ??
        '',
    }));

    const fileSummary = request.files.map((file) => ({
      file_name: file.file_name,
      mime_type: file.mime_type,
      file_size: file.file_size,
    }));

    return `
다음 정보를 바탕으로 지원자의 자기소개서를 종합 분석하세요.

당신의 역할:
- 수석 커리어 컨설턴트
- 채용 담당자(Recruiter)
- 기술 면접관

분석 목표:
1. 자기소개서의 핵심 강점
2. 부족하거나 보완해야 할 부분
3. 프로젝트와 자기소개서의 연결성
4. 지원 공고와의 직무 적합성
5. 면접에서 질문받을 가능성이 높은 부분
6. 실제 지원 경쟁력 향상을 위한 개선 방향

반드시 제공된 정보에 근거해서 판단하세요.
정보가 없는 경우 사실을 만들어내지 말고 빈 배열 또는 적절한 기본값을 사용하세요.

[자기소개서]
${request.resume_text}

[지원 회사]
${request.company_name || '지정되지 않음'}

[지원 직무]
${request.position || '지정되지 않음'}

[프로필]
${JSON.stringify(profile ?? {}, null, 2)}

[프로젝트]
${JSON.stringify(projectSummary, null, 2)}

[지원 공고]
${JSON.stringify(jobSummary, null, 2)}

[첨부 파일]
${JSON.stringify(fileSummary, null, 2)}

반드시 아래 JSON 구조를 사용하세요.

{
  "summary": "자기소개서와 전체 데이터를 종합한 핵심 요약",
  "profileAnalysis": {
    "completeness": 0,
    "recommendations": [
      "프로필 개선사항"
    ]
  },
  "strengths": [
    {
      "title": "강점 제목",
      "description": "강점 설명",
      "evidence": "판단 근거",
      "relates_to_profile": true,
      "relates_to_projects": true,
      "relates_to_jobs": true
    }
  ],
  "weaknesses": [
    {
      "title": "보완사항 제목",
      "description": "문제 설명",
      "improvement": "개선 방법",
      "can_cover_with_projects": "프로젝트로 보완할 수 있는 방법",
      "can_cover_with_skills": "기술/역량으로 보완할 수 있는 방법"
    }
  ],
  "projectMatching": [
    {
      "project_title": "프로젝트명",
      "relevance_score": 0,
      "how_to_mention": "자기소개서에서 활용하는 방법",
      "keywords_to_highlight": [
        "키워드"
      ]
    }
  ],
  "jobMatching": [
    {
      "company": "회사명",
      "position": "직무명",
      "match_score": 0,
      "matched_skills": [
        "보유 기술"
      ],
      "missing_skills": [
        "부족 기술"
      ],
      "why_good_fit": "적합성 설명",
      "tailoring_tips": [
        "자소서 맞춤화 팁"
      ]
    }
  ],
  "interviewPreparation": [
    {
      "question": "예상 질문",
      "strategy": "답변 전략",
      "sampleAnswer": "예시 답변"
    }
  ],
  "competitiveScore": 0,
  "overallRecommendations": [
    "종합 개선사항"
  ]
}

점수는 0~100 범위의 정수로 작성하세요.
profileAnalysis.completeness와 competitiveScore는 반드시 숫자로 반환하세요.
`;
  }

  private extractContent(data: unknown): string | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const response = data as {
      choices?: Array<{
        message?: {
          content?: unknown;
        };
      }>;
    };

    const content = response.choices?.[0]?.message?.content;

    return typeof content === 'string' ? content : null;
  }

  private normalizeResult(
    value: unknown
  ): IntegratedResumeAnalysisResult {
    if (!value || typeof value !== 'object') {
      return EMPTY_RESULT;
    }

    const result = value as Partial<IntegratedResumeAnalysisResult>;

    return {
      summary:
        typeof result.summary === 'string'
          ? result.summary
          : EMPTY_RESULT.summary,

      profileAnalysis: {
        completeness: this.normalizeScore(
          result.profileAnalysis?.completeness
        ),
        recommendations: this.normalizeStringArray(
          result.profileAnalysis?.recommendations
        ),
      },

      strengths: Array.isArray(result.strengths)
        ? result.strengths.map((item) => ({
            title: this.stringValue(item?.title),
            description: this.stringValue(item?.description),
            evidence: this.stringValue(item?.evidence),
            relates_to_profile:
              item?.relates_to_profile === true,
            relates_to_projects:
              item?.relates_to_projects === true,
            relates_to_jobs:
              item?.relates_to_jobs === true,
          }))
        : [],

      weaknesses: Array.isArray(result.weaknesses)
        ? result.weaknesses.map((item) => ({
            title: this.stringValue(item?.title),
            description: this.stringValue(item?.description),
            improvement: this.stringValue(item?.improvement),
            can_cover_with_projects:
              this.optionalString(item?.can_cover_with_projects),
            can_cover_with_skills:
              this.optionalString(item?.can_cover_with_skills),
          }))
        : [],

      projectMatching: Array.isArray(result.projectMatching)
        ? result.projectMatching.map((item) => ({
            project_title: this.stringValue(
              item?.project_title
            ),
            relevance_score: this.normalizeScore(
              item?.relevance_score
            ),
            how_to_mention: this.stringValue(
              item?.how_to_mention
            ),
            keywords_to_highlight:
              this.normalizeStringArray(
                item?.keywords_to_highlight
              ),
          }))
        : [],

      jobMatching: Array.isArray(result.jobMatching)
        ? result.jobMatching.map((item) => ({
            company: this.stringValue(item?.company),
            position: this.stringValue(item?.position),
            match_score: this.normalizeScore(
              item?.match_score
            ),
            matched_skills: this.normalizeStringArray(
              item?.matched_skills
            ),
            missing_skills: this.normalizeStringArray(
              item?.missing_skills
            ),
            why_good_fit: this.stringValue(
              item?.why_good_fit
            ),
            tailoring_tips: this.normalizeStringArray(
              item?.tailoring_tips
            ),
          }))
        : [],

      interviewPreparation: Array.isArray(
        result.interviewPreparation
      )
        ? result.interviewPreparation.map((item) => ({
            question: this.stringValue(item?.question),
            strategy: this.stringValue(item?.strategy),
            sampleAnswer: this.stringValue(
              item?.sampleAnswer
            ),
          }))
        : [],

      competitiveScore: this.normalizeScore(
        result.competitiveScore
      ),

      overallRecommendations:
        this.normalizeStringArray(
          result.overallRecommendations
        ),
    };
  }

  private normalizeScore(value: unknown): number {
    const numeric =
      typeof value === 'number'
        ? value
        : Number(value);

    if (!Number.isFinite(numeric)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, Math.round(numeric))
    );
  }

  private normalizeStringArray(
    value: unknown
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is string =>
        typeof item === 'string'
    );
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private optionalString(
    value: unknown
  ): string | undefined {
    return typeof value === 'string'
      ? value
      : undefined;
  }
}