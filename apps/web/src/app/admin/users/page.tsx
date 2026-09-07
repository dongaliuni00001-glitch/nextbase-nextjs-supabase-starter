import { Suspense } from 'react';
import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { approveUser } from './actions';

async function AdminUsersContent() {
  const supabase = await createSupabaseClient();
  
  // 1. 현재 로그인한 유저 확인 및 관리자 권한 체크
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: adminProfile } = await (supabase
    .from('profiles' as any)
    .select('role')
    .eq('id', user.id)
    .single() as any);

  if (adminProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // 2. Admin 클라이언트로 pending 유저 및 이메일 조회
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pendingProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, status')
    .eq('status', 'pending');

  const pendingUsers = await Promise.all(
    (pendingProfiles || []).map(async (p) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        email: authUser.user?.email || '이메일 없음',
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">회원가입 승인 대기 목록</h1>
      {pendingUsers.length === 0 ? (
        <p className="text-muted-foreground">승인 대기 중인 유저가 없습니다.</p>
      ) : (
        <div className="border rounded-lg divide-y">
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
    <div className="p-8 max-w-4xl mx-auto">
      <Suspense fallback={<p className="text-muted-foreground">로딩 중...</p>}>
        <AdminUsersContent />
      </Suspense>
    </div>
  );
}