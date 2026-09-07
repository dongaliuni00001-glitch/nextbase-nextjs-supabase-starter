'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // 프로젝트 내 수파베이스 클라이언트 경로에 맞게 조정

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-4 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-4xl">⏳</div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">관리자 승인 대기 중</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          회원가입 신청이 정상적으로 완료되었습니다.<br />
          관리자의 승인 후 플랫폼의 모든 기능을 이용하실 수 있습니다.<br />
          승인이 완료되면 서비스를 정상적으로 이용하실 수 있습니다.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            승인 상태 확인하기
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="w-full text-muted-foreground">
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}