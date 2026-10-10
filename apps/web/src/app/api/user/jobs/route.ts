import { connection, NextResponse } from 'next/server';
import { requireApprovedApiUser } from '@/lib/auth/api';
import { getSavedJobPostings } from '@/lib/supabase/queries';

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

    // 2. 인증된 사용자의 ID로 공고 조회
    console.log('💼 공고 조회 요청:', user.id);

    const jobs = await getSavedJobPostings(user.id);

    // 3. 공고 목록 반환
    return NextResponse.json(jobs);
  } catch (error: unknown) {
    console.error('❌ /api/user/jobs 오류:', error);

    return NextResponse.json(
      { error: '공고 조회 실패' },
      { status: 500 }
    );
  }
}