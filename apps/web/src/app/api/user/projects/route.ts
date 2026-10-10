import {  connection, NextResponse  } from 'next/server';
import { requireApiUser } from '@/lib/auth/api';
import { getUserProjects } from '@/lib/supabase/queries';

export async function GET() {
  // 요청이 들어온 시점에 실행하도록 한다.
  // try-catch 밖에 두어 Next.js의 프리렌더링 제어를 가로채지 않는다.
  await connection();

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

    console.log('📁 프로젝트 조회 요청:', user.id);

    // =========================================================
    // 2. 인증된 사용자의 프로젝트만 조회
    //
    // 기존에는 URL의 ?user_id= 값을 그대로 사용했지만,
    // 이제는 Supabase 인증 세션의 user.id를 사용합니다.
    // =========================================================
    const projects = await getUserProjects(user.id);

    // =========================================================
    // 3. 프로젝트 목록 반환
    // =========================================================
    return NextResponse.json(projects);
  } catch (error: unknown) {
    console.error('❌ /api/user/projects 오류:', error);

    return NextResponse.json(
      { error: '프로젝트 조회 실패' },
      { status: 500 }
    );
  }
}