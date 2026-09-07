import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
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

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">커리어 프로필 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          작성하신 프로필은 나중에 AI 자기소개서 컨펌 및 분석 시 깊이 있게 참고됩니다. 빈 항목이 있더라도 자소서 분석 과정에서 AI가 추가 입력을 권장해 드립니다.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}