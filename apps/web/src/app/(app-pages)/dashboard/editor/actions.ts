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

  // AI 분석 피드백 구조 추가
  const aiFeedbackResult = {
    summary: `${formData.company} ${formData.jobRole} 직무에 맞춘 분석 결과입니다.`,
    strengths: '직무 역량과 경험이 구체적으로 잘 드러납니다.',
    weaknesses: '두 번째 문장의 호흡이 다소 길어 가독성을 높일 수 있습니다.',
    revisedContent: formData.content,
  };

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
      message: `DB 저장 실패 [코드: ${error.code}]: ${error.message} (상세: ${error.details})`,
    };
  }

  revalidatePath('/dashboard/archive');
  return { success: true, data };
}