// apps/web/src/app/(app-pages)/dashboard/admin/actions.ts
'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) return;

  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 관리자 권한 재확인
  const { data: adminProfile } = await (supabase
    .from('profiles' as any)
    .select('role' as any)
    .eq('id', user.id)
    .single() as any);

  if (adminProfile?.role !== 'admin') {
    throw new Error('권한이 없습니다.');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('서버 환경 변수가 설정되지 않았습니다.');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 유저 상태를 active(또는 승인 완료 상태)로 변경
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId);

  if (error) {
    console.error('유저 승인 중 오류 발생:', error.message);
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/admin');
}