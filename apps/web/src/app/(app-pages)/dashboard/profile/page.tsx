import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  noStore();
  const supabase = await createSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await (supabase
    .from('profiles' as any)
    .select('*')
    .eq('id', user.id)
    .single() as any);

  // 서버 액션을 페이지 내에 정의하여 클라이언트에 prop으로 전달
  async function updateProfile(formData: FormData) {
    'use server';
    const supabaseServer = await createSupabaseClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();

    if (!currentUser) {
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

    const { error } = await (supabaseServer
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
      .eq('id', currentUser.id) as any);

    if (error) {
      throw new Error(`프로필 업데이트 실패: ${error.message}`);
    }

    revalidatePath('/dashboard/profile');
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">커리어 프로필 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          작성하신 프로필은 나중에 AI 자기소개서 컨펌 및 분석 시 깊이 있게 참고됩니다. 빈 항목이 있더라도 자소서 분석 과정에서 AI가 추가 입력을 권장해 드립니다.
        </p>
      </div>

      <ProfileForm profile={profile} action={updateProfile} />
    </div>
  );
}