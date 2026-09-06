import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: item, error } = await supabase
    .from('private_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    notFound();
  }

  let bodyData: any = {};
  try {
    bodyData = JSON.parse(item.body || '{}');
  } catch {
    bodyData = { content: item.body };
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{bodyData.company || '기업 미지정'}</Badge>
            <span className="text-xs text-muted-foreground">{bodyData.jobRole || '직무 미지정'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/archive">목록으로</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">자기소개서 본문</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-sm leading-relaxed">
            {bodyData.content || item.description}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

{/* 본문 아래에 AI 분석 결과 카드 추가 */}
<Card className="mt-6">
  <CardHeader>
    <CardTitle className="text-base text-primary">✨ AI 심층 분석 및 첨삭 피드백</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">총평</h4>
      <p className="text-sm">{bodyData.aiFeedback?.summary || '분석 결과가 없습니다.'}</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">강점</h4>
      <p className="text-sm">{bodyData.aiFeedback?.strengths || '-'}</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">보완점 및 개선 제안</h4>
      <p className="text-sm">{bodyData.aiFeedback?.weaknesses || '-'}</p>
    </div>
  </CardContent>
</Card>