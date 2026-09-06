import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EditorPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">자소서 작성·첨삭</h1>
          <p className="text-sm text-muted-foreground">본문 작성, 파일 업로드 및 AI 심층 분석을 진행하는 공간입니다.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI 에디터 준비 중</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            텍스트 직접 입력, 파일 업로드(PDF/Word), 프로젝트 경력 연동 및 AI 첨삭 기능이 구현될 영역입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}