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

    const { data: profile } = await (supabaseServer
      .from('profiles' as any)
      .select('avatar_url')
      .eq('id', currentUser.id)
      .single() as any);

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

    const rawCerts = JSON.parse((formData.get('certifications') as string) || '[]');
    const military_service = JSON.parse((formData.get('military_service') as string) || '[]');
    const portfolios = JSON.parse((formData.get('portfolios') as string) || '[]');

    // 증명사진(아바타) 업로드 처리
    const avatarFile = formData.get('avatar_file') as File;
    let avatar_url = profile?.avatar_url || '';

    if (avatarFile && avatarFile.size > 0) {
      const avatarPath = `${currentUser.id}/avatar/${Date.now()}_${avatarFile.name}`;
      const { error: avatarUploadError } = await supabaseServer.storage
        .from('documents')
        .upload(avatarPath, avatarFile);

      if (avatarUploadError) {
        return { success: false, error: `증명사진 업로드 실패: ${avatarUploadError.message}` };
      }

      const { data: { publicUrl } } = supabaseServer.storage
        .from('documents')
        .getPublicUrl(avatarPath);
      avatar_url = publicUrl;
    }

    // 자격증 증빙 파일 업로드 처리
    const certifications: any[] = [];
    for (let i = 0; i < rawCerts.length; i++) {
      const cert = rawCerts[i];
      const file = formData.get(`cert_file_${i}`) as File;
      let proofUrl = cert.proofUrl || '';

      if (file && file.size > 0) {
        const filePath = `${currentUser.id}/certs/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseServer.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          return { success: false, error: `자격증 증빙 파일(${cert.name}) 업로드 실패: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabaseServer.storage
          .from('documents')
          .getPublicUrl(filePath);
        proofUrl = publicUrl;
      }
      certifications.push({ ...cert, proofUrl });
    }

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