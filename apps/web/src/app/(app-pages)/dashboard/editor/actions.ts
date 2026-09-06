'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function saveResumeAction(formData: {
  company: string;
  jobRole: string;
  questionTitle: string;
  content: string;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      step: 'AUTH_CHECK',
      message: `인증 실패: ${userError?.message || '로그인 세션을 찾을 수 없습니다.'}`,
    };
  }

  const itemTitle = `[${formData.company}] ${formData.jobRole} - ${formData.questionTitle}`;

  // 기본 Fallback 데이터
  let aiFeedbackResult = {
    summary: `${formData.company} ${formData.jobRole} 직무 맞춤형 기본 분석 결과입니다.`,
    strengths: '직무 역량과 전공 적합성이 돋보입니다.',
    weaknesses: '구체적인 수치나 성과를 보완하면 더욱 완성도 높은 자소서가 됩니다.',
    keywordAnalysis: '직무역량, 전공적합성, 문제해결',
    recommendation: '구체적인 경험과 본인의 기여도를 명확히 작성해 보세요.',
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY가 설정되지 않았습니다.');
    } else {
      const prompt = `
당신은 전문 채용 담당자이자 대기업 합격 자소서 컨설턴트입니다. 
지원자가 작성한 아래의 자기소개서를 분석하여 반드시 아래의 JSON 형식으로만 피드백을 제공해주세요. (Markdown 코드블록이나 다른 텍스트를 포함하지 말고 순수 JSON만 출력하세요)

[지원 정보]
기업명: ${formData.company}
지원 직무: ${formData.jobRole}
문항/제목: ${formData.questionTitle}

[자기소개서 본문]
${formData.content}

JSON 구조:
{
  "summary": "총평 (지원 직무 관점에서의 종합 평가, 2~3문장)",
  "strengths": "주요 강점 (불릿 포인트 형식으로 2~3줄)",
  "weaknesses": "보완점 및 개선 제안 (불릿 포인트 형식으로 2~3줄)",
  "keywordAnalysis": "핵심 키워드 3~4개를 쉼표(,)로 구분하여",
  "recommendation": "합격을 위한 전문가 코칭 조언 (1~2문장)"
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API 응답 에러:', response.status, errorBody);
      } else {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiFeedbackResult = JSON.parse(cleanedText);
        }
      }
    }
  } catch (err) {
    console.error('Gemini API 연동 중 예외 발생:', err);
  }

  const fullData = {
    ...formData,
    aiFeedback: aiFeedbackResult,
  };

  const { data, error } = await supabase
    .from('private_items')
    .insert({
      user_id: user.id,
      name: itemTitle,
      title: itemTitle,
      description: formData.content,
      body: JSON.stringify(fullData),
    })
    .select();

  if (error) {
    return {
      success: false,
      step: 'DB_INSERT',
      message: `DB 저장 실패 [코드: ${error.code}]: ${error.message}`,
    };
  }

  revalidatePath('/dashboard/archive');
  return { success: true, data };
}

export async function deleteResumeAction(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: '인증 실패: 로그인 정보를 확인할 수 없습니다.',
    };
  }

  const { error } = await supabase
    .from('private_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return {
      success: false,
      message: `삭제 실패: ${error.message}`,
    };
  }

  revalidatePath('/dashboard/archive');
  return { success: true };
}