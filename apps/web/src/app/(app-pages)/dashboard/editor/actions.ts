'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveResumeAction(formData: {
  company: string;
  jobRole: string;
  questionTitle: string;
  content: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  // 템플릿의 기본 private_items 테이블을 활용하여 자소서 메타데이터와 본문 저장
  const { data, error } = await supabase
    .from('private_items')
    .insert({
      user_id: user.id,
      title: `[${formData.company}] ${formData.jobRole} - ${formData.questionTitle}`,
      // 텍스트 본문과 메타데이터를 구조화하여 저장
      body: JSON.stringify({
        company: formData.company,
        jobRole: formData.jobRole,
        questionTitle: formData.questionTitle,
        content: formData.content,
      }),
    })
    .select();

  if (error) {
    throw new Error(`저장 실패: ${error.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/archive');

  return { success: true, data };
}