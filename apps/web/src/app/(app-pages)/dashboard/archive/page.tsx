// apps/web/src/app/(app-pages)/dashboard/archive/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteResumeAction } from '../editor/actions';
import { JobPostingUploadForm } from './JobPostingUploadForm';
import { JobPostingList } from './JobPostingList';
import { ProjectManager } from './ProjectManager';

export default function ArchivePage() {
  const [items, setItems] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        setLoading(false);
        return;
      }

      // 1. 자기소개서 분석 아카이브 목록
      const { data: itemsData, error: itemsError } = await supabase
        .from('private_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) {
        setErrorMsg(itemsError.message);
      } else {
        setItems(itemsData || []);
      }

      // 2. 채용 공고문 목록
      const { data: postingsData, error: postingsError } = await (supabase
        .from('job_postings' as any) as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!postingsError) {
        setJobPostings(postingsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 자기소개서 분석 기록을 삭제하시겠습니까?')) return;

    const result = await deleteResumeAction(id);
    if (!result.success) {
      alert(result.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">불러오는 중...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 p-4 sm:p-6 lg:p-8">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">통합 보관함 및 레퍼런스 관리</h1>
          <p className="text-sm text-muted-foreground">
            채용 공고, 사전 프로젝트 경력, 그리고 AI 자소서 첨삭 이력을 한곳에서 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor">새 자소서 작성하기</Link>
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다: {errorMsg}
        </div>
      )}

      {/* 섹션 1: 채용 공고문 멀티모달 업로드 및 목록 */}
      <div className="space-y-6 border-b pb-8">
        <h2 className="text-xl font-bold tracking-tight">1. 채용 공고 레퍼런스 관리</h2>
        <JobPostingUploadForm />
        <JobPostingList postings={jobPostings} />
      </div>

      {/* 섹션 2: 사전 프로젝트 및 경력 관리 */}
      <div className="space-y-6 border-b pb-8">
        <h2 className="text-xl font-bold tracking-tight">2. 사전 프로젝트 및 스펙 관리</h2>
        <ProjectManager />
      </div>

      {/* 섹션 3: 자기소개서 분석 아카이브 */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight">3. 자기소개서 첨삭 아카이브</h2>
        {items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">저장된 자기소개서 첨삭 이력이 없습니다.</p>
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
                        {new Date(item.created_at).toLocaleString()}
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
                  <CardFooter className="flex items-center justify-between border-t px-6 py-3 text-xs">
                    <span className="text-muted-foreground">직무: {bodyData.jobRole || '미지정'}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:underline font-medium"
                      >
                        삭제
                      </button>
                      <Link
                        href={`/dashboard/analysis/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        상세보기 &rarr;
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}