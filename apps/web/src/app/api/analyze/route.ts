import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';

export async function POST(req: Request) {
  try {
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

    console.log('🤖 자기소개서 AI 분석 요청');
    console.log('👤 인증된 사용자:', user.id);

    // =========================================================
    // 2. 요청 데이터 파싱
    // =========================================================
    let body: {
      resumeText?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const { resumeText } = body;

    // =========================================================
    // 3. 자기소개서 입력값 검증
    // =========================================================
    if (
      typeof resumeText !== 'string' ||
      !resumeText.trim()
    ) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const trimmedResumeText = resumeText.trim();

    // =========================================================
    // 4. 입력 길이 제한
    // =========================================================
    const MAX_RESUME_LENGTH = 30000;

    if (trimmedResumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        {
          error: `자기소개서는 ${MAX_RESUME_LENGTH.toLocaleString()}자 이하로 입력해주세요.`,
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 5. Gemini API Key 확인
    // =========================================================
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        '❌ GEMINI_API_KEY가 설정되지 않았습니다.'
      );

      return NextResponse.json(
        { error: 'AI 서비스 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    // =========================================================
    // 6. Gemini Prompt 생성
    // =========================================================
    const prompt = `
다음 자기소개서를 분석하여 지원자의 강점, 보완해야 할 약점,
그리고 면접 대비 피드백을 한국어로 상세히 작성해 주세요.

다음 항목을 포함해 주세요.

1. 지원자의 주요 강점
2. 보완이 필요한 약점
3. 자기소개서에서 개선하면 좋은 부분
4. 면접에서 질문받을 가능성이 높은 부분
5. 면접 대비를 위한 구체적인 조언

자기소개서:
${trimmedResumeText}
`.trim();

    // =========================================================
    // 7. Gemini API 호출
    // =========================================================
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    // =========================================================
    // 8. Gemini 응답 JSON 파싱
    // =========================================================
    let data: any;

    try {
      data = await response.json();
    } catch {
      console.error(
        '❌ Gemini 응답 JSON 파싱 실패'
      );

      return NextResponse.json(
        {
          error:
            'AI 서비스에서 올바른 응답을 받지 못했습니다.',
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 9. Gemini API 오류 처리
    // =========================================================
    if (!response.ok) {
      console.error('❌ Gemini API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: data?.error?.message,
      });

      return NextResponse.json(
        {
          error:
            'AI 분석 요청을 처리하지 못했습니다.',
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 10. 분석 결과 추출
    // =========================================================
    const analysisResult =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisResult) {
      console.error(
        '❌ Gemini 분석 결과가 없습니다:',
        data
      );

      return NextResponse.json(
        {
          error:
            '분석 결과를 생성하지 못했습니다.',
        },
        { status: 502 }
      );
    }

    // =========================================================
    // 11. 결과 반환
    // =========================================================
    console.log('✅ Gemini 자기소개서 분석 완료');

    return NextResponse.json({
      success: true,
      result: analysisResult,
    });
  } catch (error: unknown) {
    // =========================================================
    // 12. 서버 오류 처리
    // =========================================================
    console.error(
      '❌ /api/analyze 서버 오류:',
      error
    );

    return NextResponse.json(
      {
        error:
          '서버에서 AI 분석을 처리하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}