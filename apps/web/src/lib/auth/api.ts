import 'server-only';

import { createSupabaseClient } from '@/supabase-clients/server';

/**
 * 로그인한 사용자 인증
 *
 * 승인 상태와 관계없이 로그인 여부만 확인한다.
 * 회원 상태 확인 등 승인 전에도 필요한 기능에서 사용한다.
 */
export async function requireApiUser() {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    supabase,
    user,
  };
}

/**
 * 승인된 사용자 인증
 *
 * 로그인 여부와 profiles.status를 모두 검증한다.
 * 프로젝트 조회, AI 분석 등 승인 후에만 허용할 기능에서 사용한다.
 */
export async function requireApprovedApiUser() {
  const auth = await requireApiUser();

  if (!auth) {
    return {
      ok: false as const,
      status: 401,
      error: '로그인이 필요합니다.',
    };
  }

  const { data: profile, error } = await auth.supabase
    .from('profiles')
    .select('status')
    .eq('id', auth.user.id)
    .maybeSingle();

  if (error) {
    // 프로필 조회 실패 시 접근을 허용하지 않는다.
    console.error('API 회원 승인 상태 확인 실패:', error.message);

    return {
      ok: false as const,
      status: 500,
      error: '회원 권한을 확인할 수 없습니다.',
    };
  }

  if (!profile || profile.status !== 'approved') {
    return {
      ok: false as const,
      status: 403,
      error: '승인된 회원만 이용할 수 있습니다.',
    };
  }

  return {
    ok: true as const,
    ...auth,
  };
}
```