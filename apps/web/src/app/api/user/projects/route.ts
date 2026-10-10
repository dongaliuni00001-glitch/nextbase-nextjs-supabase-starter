import { connection, NextResponse } from 'next/server';
import { requireApprovedApiUser } from '@/lib/auth/api';
import { getUserProjects } from '@/lib/supabase/queries';

export async function GET() {
  // 요청 시점에 실행하여 프리렌더링 관련 오류를 방지한다.
  await connection();

  try {
    // 1. 로그인 및 회원 승인 상태 확인
    const auth = await requireApprovedApiUser();

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user } = auth;

    console.log('📁 프로젝트 조회 요청:', user.id);

    // 2. 인증된 사용자 본인의 프로젝트만 조회
    const projects = await getUserProjects(user.id);

    // 3. 프로젝트 목록 반환
    return NextResponse.json(projects);
  } catch (error: unknown) {
    console.error('❌ /api/user/projects 오류:', error);

    return NextResponse.json(
      { error: '프로젝트 조회 실패' },
      { status: 500 }
    );
  }
}