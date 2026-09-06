'use server';

import { authActionClient } from '@/lib/safe-action'; // safe-action 파일 경로에 맞게 조정
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server'; // 또는 프로젝트 내 Supabase 서버 클라이언트 경로

// 입력값 검증을 위한 Zod 스키마 정의
const resumeSchema = z.object({
  company: z.string().min(1, '기업명을 입력해주세요.'),
  jobRole: z.string().min(1, '직무를 입력해주세요.'),
  questionTitle: z.string().min(1, '문항 제목을 입력해주세요.'),
  content: z.string().min(10, '본문은 최소 10자 이상 입력해주세요.'),
});

export const saveResumeAction = authActionClient
  .schema(resumeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { company, jobRole, questionTitle, content } = parsedInput;
    const { userId } = ctx; // authActionClient가 자동으로 주입해준 사용자 ID

    const supabase = createClient();

    const { data, error } = await supabase
      .from('private_items')
      .insert({
        user_id: userId,
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
      throw new Error(`저장 실패: ${error.message}`);
    }

    return { success: true, data };
  });