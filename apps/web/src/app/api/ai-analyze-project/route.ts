import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { project, keptFiles, selectedJobs } = await request.json();

    if (!project) {
      return NextResponse.json({ error: '프로젝트 정보가 없습니다.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
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

    반드시 아래의 JSON 구조에 맞춰 한글로 응답해 주세요. 순수 JSON 객체만 반환하세요.
    {
      "domainLabel": "프로젝트 도메인 분류",
      "summary": "프로젝트 종합 요약 한 문장",
      "expertCritique": {
        "technicalDepth": "기술적 깊이 평가",
        "problemSolving": "문제 해결 평가",
        "businessImpact": "비즈니스 임팩트 평가"
      },
      "starPortfolio": {
        "situation": "Situation",
        "task": "Task",
        "action": "Action",
        "result": "Result"
      },
      "interviewQAs": [
        { "question": "질문 1", "strategy": "전략 1" },
        { "question": "질문 2", "strategy": "전략 2" },
        { "question": "질문 3", "strategy": "전략 3" }
      ],
      "metrics": [
        { "label": "담당 역할", "value": "역할명" },
        { "label": "연동된 증빙 자료", "value": "개수" },
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
          "correlation": "교차 분석",
          "tailoringTips": ["팁 1", "팁 2", "팁 3"]
        }
      ]
    }
    `;

    // 💡 패키지 설치 없이 네이티브 fetch로 OpenAI REST API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      throw new Error(`OpenAI API 오류: ${errText}`);
    }

    const resData = await openaiResponse.json();
    const content = resData.choices[0].message.content;
    const aiResult = JSON.parse(content || '{}');

    return NextResponse.json(aiResult);
  } catch (error: any) {
    console.error('OpenAI API 연동 오류:', error);
    return NextResponse.json({ error: error.message || 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}