import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ArchivePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        로그인 정보가 없습니다. 다시 로그인해 주세요.
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from('private_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">보관함 및 이력</h1>
          <p className="text-sm text-muted-foreground">
            작성 및 분석된 자소서와 버전별 히스토리를 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor">새 자소서 작성</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      )}

      {!items || items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">저장된 자기소개서가 없습니다.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/editor">첫 자소서 작성하러 가기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            let bodyData: any = {};
            try {
              bodyData = JSON.parse(item.body || '{}');
            } catch {
              bodyData = { content: item.body };
            }

            return (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {bodyData.company || '기업 미지정'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold line-clamp-1">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {bodyData.content || '내용이 없습니다.'}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
                  <span>직무: {bodyData.jobRole || '미지정'}</span>
                  <Link
                    href={`/dashboard/editor?id=${item.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    상세보기 &rarr;
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}