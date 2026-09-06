import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ArchivePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">보관함 및 이력</h1>
          <p className="text-sm text-muted-foreground">작성 및 분석된 자소서와 버전별 히스토리를 관리합니다.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>아카이브 보관함</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            기업별·직무별로 분류된 자소서 문서 목록과 버전 관리, 북마크 및 보안 공유 링크 기능이 제공될 영역입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}