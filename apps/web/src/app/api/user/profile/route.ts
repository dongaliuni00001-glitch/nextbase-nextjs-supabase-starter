import { NextResponse } from 'next/server';
import { getUserProjects } from '@/lib/supabase/queries';
import { requireApiUser } from '@/lib/auth/api';

export async function GET(request: Request) {
  try {
    const auth = await requireApiUser();

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const projects = await getUserProjects(userId);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects API error:', error);

    return NextResponse.json(
      { error: '프로젝트 조회 실패' },
      { status: 500 }
    );
  }
}