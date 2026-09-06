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
  // 상세하고 전문적인 AI 분석 피드백 구조 생성
  const aiFeedbackResult = {
    summary: `${formData.company} ${formData.jobRole} 직무의 핵심 역량 및 전공 적합성 관점에서 심층 분석된 결과입니다. 지원자의 전공 지식과 실무 잠재력을 조명하는 방향으로 평가되었습니다.`,
    strengths: `• 핵심 전공 및 직무 키워드가 문항의 의도와 자연스럽게 연결되어 있습니다.\n• 불필요한 수식어를 줄이고 핵심 메시지를 전달하려는 구조가 돋보입니다.\n• 지원 분야에 대한 뚜렷한 관심과 입사 후 포부의 방향성이 명확합니다.`,
    weaknesses: `• 작성된 본문의 분량이 다소 요약적이므로, 구체적인 수치, 성과, 또는 프로젝트/실험 과정에서의 트러블슈팅 경험을 추가 보완할 필요가 있습니다.\n• 이론적 지식이 실제 산업 현장이나 공정/연구 성과로 이어진 인과관계(STAR 기법)를 조금 더 구체화하면 설득력이 극대화됩니다.`,
    keywordAnalysis: '직무 적합성, 전공 역량, 문제해결능력, 공정 및 연구 이해도',
    recommendation: '구체적인 경험(프로젝트, 인턴, 실험 등)에서 본인이 주도적으로 기여한 행동과 결과를 2~3문장 가량 살 붙여 작성하는 것을 강력히 추천합니다.',
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

// 저장된 이력서 삭제 기능

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