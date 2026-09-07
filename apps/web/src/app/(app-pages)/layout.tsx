import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getCachedIsUserLoggedIn } from '@/rsc-data/supabase';
import { AppSidebar } from './app-sidebar';

import { createSupabaseClient } from '@/supabase-clients/server';

async function AuthGuard({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // profiles 테이블에서 유저의 status 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();

  // status가 pending인 경우 승인 대기 페이지로 리다이렉트
  if (profile?.status === 'pending') {
    redirect('/pending-approval');
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Suspense fallback={null}>
            <DynamicBreadcrumb />
          </Suspense>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex min-h-[calc(100svh-3.5rem)] flex-1 flex-col bg-muted/15">
          <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
