import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';
import { getUserProfile } from '@/lib/supabase/queries';

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

    // =========================================================
    // 2. 인증된 사용자 ID 사용
    //
    // 클라이언트에서 전달하는 ?user_id 값을 사용하지 않습니다.
    // 현재 로그인한 Supabase 사용자의 ID를 기준으로 조회합니다.
    // =========================================================
    const { user } = auth;

    console.log('👤 프로필 조회 요청:', user.id);

    // =========================================================
    // 3. 사용자 프로필 조회
    // =========================================================
    const profile = await getUserProfile(user.id);

    // =========================================================
    // 4. 프로필 반환
    // =========================================================
    return NextResponse.json(profile || {});
  } catch (error: unknown) {
    console.error('❌ /api/user/profile 오류:', error);

    return NextResponse.json(
      { error: '프로필 조회 실패' },
      { status: 500 }
    );
  }
}