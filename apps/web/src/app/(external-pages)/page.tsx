'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // 프로젝트에 맞는 Button 경로 확인

export function HomeHero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    }

    checkUser();

    // 로그인 상태 변화 실시간 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center">
      {/* 기존 히어로 내용들... */}
      
      <div className="mt-8 flex gap-4">
        {isLoading ? (
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        ) : isLoggedIn ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href="/login">Get started</Link>
          </Button>
        )}
      </div>
    </div>
  );
}