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

  // 1. 현재 요청을 보낸 유저 세션 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      step: 'AUTH_CHECK',
      message: `인증 실패: ${userError?.message || '로그인 세션을 찾을 수 없습니다. (user가 null입니다)'}`,
    };
  }

  // 2. private_items 테이블에 데이터 삽입
  const { data, error } = await supabase
    .from('private_items')
    .insert({
      user_id: user.id,
      title: `[${formData.company}] ${formData.jobRole} - ${formData.questionTitle}`,
      body: JSON.stringify(formData),
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