'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증되지 않은 유저입니다.');
  }

  const full_name = formData.get('full_name') as string;
  const gender = formData.get('gender') as string;
  const birth_date = formData.get('birth_date') as string;
  const birth_type = formData.get('birth_type') as string;
  const university = formData.get('university') as string;
  const major = formData.get('major') as string;
  const desired_role = formData.get('desired_role') as string;
  const desired_industry = formData.get('desired_industry') as string;
  const desired_location = formData.get('desired_location') as string;
  const career_summary = formData.get('career_summary') as string;

  const certifications = JSON.parse((formData.get('certifications') as string) || '[]');
  const military_service = JSON.parse((formData.get('military_service') as string) || '[]');
  const portfolios = JSON.parse((formData.get('portfolios') as string) || '[]');

  const { error } = await (supabase
    .from('profiles' as any)
    .update({
      full_name,
      gender,
      birth_date,
      birth_type,
      university,
      major,
      certifications,
      military_service,
      portfolios,
      desired_role,
      desired_industry,
      desired_location,
      career_summary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id) as any);

  if (error) {
    throw new Error(`프로필 업데이트 실패: ${error.message}`);
  }

  revalidatePath('/dashboard/profile');
}
