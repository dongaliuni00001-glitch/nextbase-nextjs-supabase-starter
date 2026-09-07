import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { ProfileForm } from './profile-form';
import { updateProfile } from './actions';

export default async function ProfilePage() {
  noStore();
  
  const supabase = await createSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  let profile = null;
  let profileErrorMsg = null;

  try {
    const { data, error } = await (supabase
      .from('profiles' as any)
      .select('*')
      .eq('id', user.id)
      .maybeSingle() as any);

    if (error) {
      profileErrorMsg = error.message;
    } else {
      profile = data;
    }
  } catch (err: any) {
    profileErrorMsg = err?.message || String(err);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">커리어 프로필 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          작성하신 프로필은 나중에 AI 자기소개서 컨펌 및 분석 시 깊이 있게 참고됩니다. 빈 항목이 있더라도 자소서 분석 과정에서 AI가 추가 입력을 권장해 드립니다.
        </p>
      </div>

      {profileErrorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          프로필을 불러오는 중 데이터베이스 오류가 발생했습니다: {profileErrorMsg}
        </div>
      )}

      <ProfileForm profile={profile || {}} action={updateProfile} />
    </div>
  );
}