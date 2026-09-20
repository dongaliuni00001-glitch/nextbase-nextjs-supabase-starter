import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { requireApiUser } from '@/lib/auth/api';
import { getUserProfile } from '@/lib/supabase/queries';
=======
import { getUserProjects } from '@/lib/supabase/queries';
import { requireApiUser } from '@/lib/auth/api';
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

export async function GET() {
  try {
<<<<<<< HEAD
    // =========================================================
    // 1. API 인증
    // =========================================================
    const auth = await requireApiUser();
=======
    const auth = await requireApiUser();

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe

    if (!auth) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    const { user } = auth;

    console.log('👤 프로필 조회 요청:', user.id);

    // =========================================================
    // 2. 인증된 사용자 자신의 프로필만 조회
    //
    // 기존에는 URL의 ?user_id= 값을 그대로 신뢰했습니다.
    // 이제는 Supabase 인증 세션의 user.id를 사용합니다.
    // =========================================================
    const profile = await getUserProfile(user.id);

    // =========================================================
    // 3. 프로필 반환
    // =========================================================
    return NextResponse.json(profile || {});
  } catch (error: unknown) {
    console.error('❌ /api/user/profile 오류:', error);

=======
    const projects = await getUserProjects(userId);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects API error:', error);

>>>>>>> ebf3f146eb50c1a1c4d0226adea7f7a4356f9cfe
    return NextResponse.json(
      { error: '프로젝트 조회 실패' },
      { status: 500 }
    );
  }
}