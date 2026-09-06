import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-sm text-muted-foreground">자소서 첨삭 및 커리어 관리 메인 화면입니다.</p>
        </div>
        <Link href="/dashboard/editor">
          <Button>새 자소서 작성·첨삭</Button>
        </Link>
      </div>

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
            <Link href="/dashboard/editor" className="block">
              <Button variant="outline" className="w-full justify-start">
                ✍️ 새 자기소개서 입력 및 분석 시작
              </Button>
            </Link>
            <Link href="/dashboard/archive" className="block">
              <Button variant="outline" className="w-full justify-start">
                📂 전체 보관함 및 버전 관리 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}