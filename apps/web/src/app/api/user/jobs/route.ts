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