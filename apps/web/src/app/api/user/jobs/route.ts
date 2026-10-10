import { NextResponse } from 'next/server';

import { requireApiUser } from '@/lib/auth/api';
import { getSavedJobPostings } from '@/lib/supabase/queries';

// 로그인 세션에 따라 응답이 달라지므로 정적 생성하지 않는다.
export const dynamic = 'force-dynamic';

export async function GET() {
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

    // =========================================================
    // 2. 인증된 사용자 ID 사용
    //
    // 클라이언트에서 ?user_id 값을 받지 않는다.
    // 항상 Supabase 인증 세션의 user.id를 사용한다.
    // =========================================================

    console.log('💼 공고 조회 요청:', user.id);

    const jobs = await getSavedJobPostings(user.id);

    // =========================================================
    // 3. 공고 목록 반환
    // =========================================================

    return NextResponse.json(jobs);
  } catch (error: unknown) {
    console.error('❌ /api/user/jobs 오류:', error);

    return NextResponse.json(
      { error: '공고 조회 실패' },
      { status: 500 }
    );
  }
}