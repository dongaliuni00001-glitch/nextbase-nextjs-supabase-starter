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

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-primary">✨ AI 심층 분석 및 첨삭 리포트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. 종합 평가 (Summary)</h4>
            <p className="text-sm leading-relaxed rounded-md bg-muted/40 p-3">{bodyData.aiFeedback?.summary || '분석 결과가 없습니다.'}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-md border p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600">💪 주요 강점 (Strengths)</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{bodyData.aiFeedback?.strengths || '-'}</p>
            </div>
            <div className="space-y-2 rounded-md border p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600">⚠️ 보완점 및 개선 제안 (Weaknesses)</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{bodyData.aiFeedback?.weaknesses || '-'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🔑 핵심 키워드 매칭</h4>
            <div className="flex flex-wrap gap-2">
              {bodyData.aiFeedback?.keywordAnalysis?.split(', ').map((keyword: string, idx: number) => (
                <span key={idx} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  #{keyword}
                </span>
              )) || '-'}
            </div>
          </div>

          <div className="space-y-2 rounded-md bg-primary/5 p-4 border border-primary/20">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">💡 합격을 위한 전문가 코칭</h4>
            <p className="text-sm text-foreground/90">{bodyData.aiFeedback?.recommendation || '-'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}