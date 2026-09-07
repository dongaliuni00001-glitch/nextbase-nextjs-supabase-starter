'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './ProfileForm';
import { createBrowserClient } from '@supabase/ssr';

export default function DashboardPage({ profile, action }: { profile?: any; action?: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'editor' | 'archive' | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 방법 1: 특정 이메일 주소를 관리자로 지정하는 경우 (예: 관리자 이메일 입력)
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
        if (session.user.email === adminEmail || profile?.is_admin === true) {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    }
    checkAdmin();
  }, [profile]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      {/* 1. 상단 타이틀 및 탭 네비게이션 */}
      <div className="flex flex-col gap-4 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
            <p className="text-sm text-muted-foreground">자소서 첨삭 및 커리어 관리 통합 플랫폼</p>
          </div>
          <Button onClick={() => setActiveTab('editor')}>새 자소서 작성·첨삭</Button>
        </div>

        {/* 탭 버튼 메뉴 바 */}
        <div className="flex space-x-6 overflow-x-auto pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'home' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            🏠 대시보드 홈
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            👤 프로필 및 이력 관리
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            ✍️ 자소서 에디터
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`pb-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'archive' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            📂 데이터 아카이브
          </button>

          {/* ⭐ 관리자 계정일 때만 렌더링되는 탭 */}
          {!loading && isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`pb-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap text-amber-600 ${
                activeTab === 'admin' ? 'border-amber-600 text-amber-600' : 'border-transparent text-muted-foreground hover:text-amber-600'
              }`}
            >
              🔒 관리자 계정 승인 관리
            </button>
          )}
        </div>
      </div>

      {/* 2. 탭별 콘텐츠 영역 */}
      <div className="mt-2">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* 요약 지표 위젯 그리드 */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">보관된 문서 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0건</div>
                  <p className="text-xs text-muted-foreground">작성 및 분석 완료된 항목</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">최근 첨삭 이력</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">최근 진행된 AI 분석 없음</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">서비스 모드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">폐쇄형 스터디</div>
                  <p className="text-xs text-muted-foreground">권한 제어 활성화됨</p>
                </CardContent>
              </Card>
            </div>

            {/* 최근 활동 및 빠른 실행 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>최근 작업 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    저장된 이력이 없습니다. '새 자소서 작성·첨삭'을 통해 첫 번째 문서를 추가해 보세요.
                  </p>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>빠른 실행</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('editor')}>
                    ✍️ 새 자기소개서 입력 및 분석 시작
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('archive')}>
                    📂 전체 보관함 및 버전 관리 보기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <ProfileForm profile={profile} action={action} />
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="border p-6 rounded-lg bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-bold">텍스트 직접 입력 에디터 (우선순위 3번)</h2>
            <p className="text-sm text-muted-foreground">자소서 본문을 입력하고 AI 피드백을 요청할 수 있는 공간입니다.</p>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="border p-6 rounded-lg bg-card shadow-sm space-y-4">
            <h2 className="text-xl font-bold">데이터베이스 Items 아카이브 (우선순위 5번)</h2>
            <p className="text-sm text-muted-foreground">저장된 자소서 원본과 분석 기록 리스트가 표시됩니다.</p>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="border border-amber-200 p-6 rounded-lg bg-amber-50/30 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-amber-900">관리자 계정 승인 관리 (우선순위 4번)</h2>
            <p className="text-sm text-muted-foreground">폐쇄형 스터디 가입 요청 계정을 확인하고 초기 비밀번호를 발급·승인하는 공간입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}