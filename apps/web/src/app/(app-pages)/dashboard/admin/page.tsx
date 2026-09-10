// apps/web/src/app/(app-pages)/dashboard/admin/page.tsx
import { Suspense } from 'react';
import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { approveUser } from './actions'; // 필요시 서버 액션 경로 조정

async function AdminUsersContent() {
  const supabase = await createSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminProfile } = await (supabase
    .from('profiles' as any)
    .select('role' as any)
    .eq('id', user.id)
    .single() as any);

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <p className="text-red-500">서버 환경 변수(SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.</p>;
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: pendingProfiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, status')
    .eq('status', 'pending');

  if (profileError) {
    return <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다: {profileError.message}</p>;
  }

  const pendingUsers = await Promise.all(
    (pendingProfiles || []).map(async (p: any) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        email: authUser.user?.email || '이메일 없음',
      };
    })
  );

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">회원가입 승인 대기 목록</h1>
      {pendingUsers.length === 0 ? (
        <p className="text-muted-foreground">승인 대기 중인 유저가 없습니다.</p>
      ) : (
        <div className="border rounded-lg divide-y bg-card">
          {pendingUsers.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">이메일: {u.email}</p>
              </div>
              <form action={approveUser}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  승인하기
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground p-8">로딩 중...</p>}>
      <AdminUsersContent />
    </Suspense>
  );
}