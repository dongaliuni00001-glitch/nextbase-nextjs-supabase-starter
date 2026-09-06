import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정 및 보안</h1>
          <p className="text-sm text-muted-foreground">계정 보안, 비밀번호 변경 및 시스템 권한을 관리합니다.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>보안 및 계정 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            관리자 주도 계정 발급에 따른 최초 로그인 비밀번호 변경 및 세션 권한 제어 설정 영역입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}