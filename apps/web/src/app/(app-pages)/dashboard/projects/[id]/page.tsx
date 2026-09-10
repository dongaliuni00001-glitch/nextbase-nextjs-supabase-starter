// apps/web/src/app/(app-pages)/dashboard/projects/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );

  useEffect(() => {
    async function fetchProject() {
      const { data } = await (supabase.from('projects' as any) as any)
        .select('*')
        .eq('id', id)
        .single();
      setProject(data);
      setLoading(false);
    }
    fetchProject();
  }, [id, supabase]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">로딩 중...</div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-sm text-destructive">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs text-muted-foreground">프로젝트 상세 정보</span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">{project.title}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/archive">&larr; 보관함으로 돌아가기</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm bg-card p-6 border rounded-xl shadow-sm">
        <div>
          <span className="text-muted-foreground block text-xs">담당 역할</span>
          <span className="font-semibold">{project.role || '미지정'}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-xs">사용 기술 / 스펙</span>
          <span className="font-semibold">{project.tech_stack || '미지정'}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">상세 내용 및 성과</h3>
        <div className="p-6 border rounded-xl bg-card text-sm whitespace-pre-wrap leading-relaxed">
          {project.description || '작성된 내용이 없습니다.'}
        </div>
      </div>

      <div className="space-y-3 border-t pt-6">
        <h3 className="font-semibold text-sm">첨부된 증빙 파일 목록</h3>
        {(!project.file_urls || project.file_urls.length === 0) ? (
          <p className="text-xs text-muted-foreground">등록된 증빙 파일이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {project.file_urls.map((url: string, index: number) => {
              const name = project.file_names?.[index] || `증빙 파일 ${index + 1}`;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card text-xs">
                  <span className="font-medium truncate max-w-md">{name}</span>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      다운로드 / 보기 &rarr;
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}