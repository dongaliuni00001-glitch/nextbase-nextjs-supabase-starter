import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: '자기소개서 내용을 입력해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const prompt = `다음 자기소개서를 분석하여 지원자의 강점, 보완해야 할 약점, 그리고 면접 대비 피드백을 한국어로 상세히 작성해 주세요:\n\n${resumeText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API 호출 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    const analysisResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 생성하지 못했습니다.';

    return NextResponse.json({ result: analysisResult });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}