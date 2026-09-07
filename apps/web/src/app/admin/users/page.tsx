import { Suspense } from 'react';
import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { approveUser } from './actions';

async function AdminUsersContent() {
  const supabase = await createSupabaseClient();
  
  // 1. 현재 로그인한 유저 확인 및 관리자 권한(role === 'admin') 체크
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

  // 2. pending 상태인 유저 목록 조회
  const { data: pendingUsers } = await (supabase
    .from('profiles' as any)
    .select('*')
    .eq('status', 'pending') as any);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">회원가입 승인 대기 목록</h1>
      {pendingUsers?.length === 0 ? (
        <p className="text-muted-foreground">승인 대기 중인 유저가 없습니다.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {pendingUsers?.map((u: any) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">유저 ID: {u.id}</p>
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