'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  try {
    const supabaseServer = await createSupabaseClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();

    if (!currentUser) {
      return { success: false, error: '인증되지 않은 유저입니다.' };
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
    const avatar_url = formData.get('avatar_url') as string;

    const certifications = JSON.parse((formData.get('certifications') as string) || '[]');
    const military_service = JSON.parse((formData.get('military_service') as string) || '[]');
    const portfolios = JSON.parse((formData.get('portfolios') as string) || '[]');

    // upsert를 사용하여 프로필 행이 없으면 생성, 있으면 수정
    const { error } = await (supabaseServer
      .from('profiles' as any)
      .upsert({
        id: currentUser.id,
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
        avatar_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' }) as any);

    if (error) {
      return { success: false, error: `데이터베이스 저장 실패: ${error.message}` };
    }

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (err: any) {
    console.error('Profile update unexpected error:', err);
    return { success: false, error: err?.message || '알 수 없는 서버 오류가 발생했습니다.' };
  }
}