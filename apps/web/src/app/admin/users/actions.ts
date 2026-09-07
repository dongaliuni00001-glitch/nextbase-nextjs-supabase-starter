'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function approveUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  // RLS를 우회하는 Supabase Admin 클라이언트 생성
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', userId);

  revalidatePath('/admin/users');
}