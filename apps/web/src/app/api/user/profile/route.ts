import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId);
    return NextResponse.json(profile || {});
  } catch (error) {
    return NextResponse.json(
      { error: '프로필 조회 실패' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getUserProjects } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  try {
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
    return NextResponse.json(
      { error: '프로젝트 조회 실패' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSavedJobPostings } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const jobs = await getSavedJobPostings(userId || undefined);
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: '공고 조회 실패' },
      { status: 500 }
    );
  }
}