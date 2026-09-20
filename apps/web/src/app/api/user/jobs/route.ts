import { NextResponse } from 'next/server';
import { getSavedJobPostings } from '@/lib/supabase/queries';
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

    const jobs = await getSavedJobPostings(userId || undefined);

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Jobs API error:', error);

    return NextResponse.json(
      { error: '공고 조회 실패' },
      { status: 500 }
    );
  }
}