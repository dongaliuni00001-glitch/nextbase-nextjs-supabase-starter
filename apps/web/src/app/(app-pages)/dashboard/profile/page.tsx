import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { ProfileForm } from './profile-form';
import { updateProfile } from './actions';

export default async function ProfilePage() {
  noStore();
  
  try {
    const supabase = await createSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) redirect('/login');

    const { data: profile, error: profileError } = await (supabase
      .from('profiles' as any)
      .select('*')
      .eq('id', user.id)
      .maybeSingle() as any);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">커리어 프로필 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            작성하신 프로필은 나중에 AI 자기소개서 컨펌 및 분석 시 깊이 있게 참고됩니다. 빈 항목이 있더라도 자소서 분석 과정에서 AI가 추가 입력을 권장해 드립니다.
          </p>
        </div>

        <ProfileForm profile={profile || {}} action={updateProfile} />
      </div>
    );
  } catch (err: any) {
    console.error('ProfilePage fatal error:', err);
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-red-600">페이지 로드 중 오류가 발생했습니다.</h1>
        <p className="text-sm text-muted-foreground">서버 콘솔 또는 터미널 로그를 확인해주세요.</p>
        <pre className="p-4 bg-muted rounded-md text-xs overflow-auto">
          {err?.message || String(err)}
        </pre>
      </div>
    );
  }
}