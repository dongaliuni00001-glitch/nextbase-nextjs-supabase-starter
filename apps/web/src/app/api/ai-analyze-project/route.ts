import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { project, keptFiles, selectedJobs } = await request.json();

    if (!project) {
      return NextResponse.json({ error: '프로젝트 정보가 없습니다.' }, { status: 400 });
    }

    const fileNames = (keptFiles || []).map((f: any) => f.name || f).join(', ');

    const prompt = `
    당신은 엄격하고 전문적인 수석 커리어 컨설턴트, 인사담당자(Recruiter), 그리고 기술 면접관입니다.
    사용자의 프로젝트 정보와 첨부된 증빙 파일, 그리고 지원하려는 채용 공고들을 면밀히 분석하여 전문가 수준의 심층 평가, STAR 기법 기반 이력서/자소서용 포트폴리오 텍스트, 기술 면접 Q&A, 그리고 직무 정합성 분석 레포트를 JSON 형식으로 생성해 주세요.

    [프로젝트 정보]
    - 제목: ${project.title}
    - 설명: ${project.description}
    - 역할: ${project.role}
    - 기술 스택/역량: ${project.tech_stack}
    - 연동된 증빙 파일 목록: ${fileNames || '없음'}

    [지원 공고 목록]
    ${JSON.stringify(selectedJobs || [])}

    반드시 아래의 JSON 구조에 맞춰 한글로 응답해 주세요. (다른 마크다운 설명 없이 순수 JSON 객체만 반환)
    {
      "domainLabel": "프로젝트 도메인 분류",
      "summary": "프로젝트 종합 요약 한 문장",
      "expertCritique": {
        "technicalDepth": "기술적 깊이 및 실무 타당성에 대한 전문 평가",
        "problemSolving": "문제 해결 및 트러블슈팅 과정에 대한 분석",
        "businessImpact": "현업 투입 시 기대되는 비즈니스 임팩트 평가"
      },
      "starPortfolio": {
        "situation": "STAR 기법 - Situation",
        "task": "STAR 기법 - Task",
        "action": "STAR 기법 - Action",
        "result": "STAR 기법 - Result"
      },
      "interviewQAs": [
        { "question": "예상 면접 질문 1", "strategy": "AI 방어 및 답변 가이드 전략 1" },
        { "question": "예상 면접 질문 2", "strategy": "AI 방어 및 답변 가이드 전략 2" },
        { "question": "예상 면접 질문 3", "strategy": "AI 방어 및 답변 가이드 전략 3" }
      ],
      "metrics": [
        { "label": "담당 역할", "value": "역할명" },
        { "label": "연동된 증빙 자료", "value": "검증된 개수" },
        { "label": "AI 심층 등급", "value": "S등급" }
      ],
      "chartData": [
        { "phase": "1단계", "value": 30 },
        { "phase": "2단계", "value": 60 },
        { "phase": "3단계", "value": 85 },
        { "phase": "4단계", "value": 100 }
      ],
      "jobReports": [
        {
          "jobId": "공고 ID",
          "matchScore": 92,
          "correlation": "실시간 교차 분석 내용",
          "tailoringTips": [
            "자소서 반영 팁 1",
            "증빙 자료 교차 활용 팁 2",
            "성과 어필 전략 3"
          ]
        }
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(aiResult);
  } catch (error: any) {
    console.error('OpenAI API 연동 오류:', error);
    return NextResponse.json({ error: error.message || 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}