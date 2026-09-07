'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function approveUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  const supabaseServer = await createSupabaseClient();

  await (supabaseServer
    .from('profiles' as any)
    .update({ status: 'approved' })
    .eq('id', userId) as any);

  revalidatePath('/admin/users');
}