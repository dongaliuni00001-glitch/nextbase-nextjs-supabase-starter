'use server';

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const resumeSchema = z.object({
  company: z.string().min(1, '기업명을 입력해주세요.'),
  jobRole: z.string().min(1, '직무를 입력해주세요.'),
  questionTitle: z.string().min(1, '문항 제목을 입력해주세요.'),
  content: z.string().min(10, '본문은 최소 10자 이상 입력해주세요.'),
});

export const saveResumeAction = authActionClient
  .schema(resumeSchema)
  .action(async ({ parsedInput }) => {
    const { company, jobRole, questionTitle, content } = parsedInput;

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
            } catch {
              // Server Component context fallback
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Supabase Auth Error:', userError);
      throw new Error(`인증 실패: ${userError?.message || '로그인 세션을 찾을 수 없습니다.'}`);
    }

    const { data, error } = await supabase
      .from('private_items')
      .insert({
        user_id: user.id,
        title: `[${company}] ${jobRole} - ${questionTitle}`,
        body: JSON.stringify({
          company,
          jobRole,
          questionTitle,
          content,
        }),
      })
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw new Error(`저장 실패: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/archive');

    return { success: true, data };
  });