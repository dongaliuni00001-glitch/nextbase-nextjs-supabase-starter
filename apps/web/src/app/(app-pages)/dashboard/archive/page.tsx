// apps/web/src/app/(app-pages)/dashboard/archive/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<'resumes' | 'jobPostings' | 'projects'>('resumes');
  const [items, setItems] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showJobForm, setShowJobForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('로그인 정보가 없습니다. 다시 로그인해 주세요.');
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchData();
  }, [supabase]);

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
    return <div className="p-12 text-center text-sm text-muted-foreground">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">통합 보관함 및 레퍼런스 관리</h1>
          <p className="text-sm text-muted-foreground">
            탭을 선택하여 채용 공고, 사전 프로젝트, 자소서 첨삭 이력을 깔끔하게 관리하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor">새 자소서 작성하기</Link>
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          데이터 로드 오류: {errorMsg}
        </div>
      )}

      {/* 윈도우 탭 네비게이션 */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'resumes'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          자기소개서 아카이브 ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('jobPostings')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'jobPostings'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          채용 공고 관리 ({jobPostings.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          프로젝트 및 경력 관리
        </button>
      </div>

      {/* 탭 1: 자기소개서 아카이브 */}
      {activeTab === 'resumes' && (
        <div className="space-y-6">
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

                const formattedDate = item.created_at ? item.created_at.replace('T', ' ').substring(0, 16) : '';

                return (
                  <Card key={item.id} className="flex flex-col justify-between">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {bodyData.company || '기업 미지정'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formattedDate}
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
                  </CardCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 탭 2: 채용 공고 관리 */}
      {activeTab === 'jobPostings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">등록된 채용 공고 레퍼런스</h2>
            <Button onClick={() => setShowJobForm(!showJobForm)} variant={showJobForm ? 'outline' : 'default'} size="sm">
              {showJobForm ? '닫기' : '+ 채용 공고 추가하기'}
            </Button>
          </div>

          {showJobForm && (
            <div className="p-4 border rounded-xl bg-card shadow-sm animate-in fade-in-50">
              <JobPostingUploadForm />
            </div>
          )}

          <JobPostingList postings={jobPostings} />
        </div>
      )}

      {/* 탭 3: 프로젝트 및 경력 관리 */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">사전 프로젝트 및 경력 스펙</h2>
            <Button onClick={() => setShowProjectForm(!showProjectForm)} variant={showProjectForm ? 'outline' : 'default'} size="sm">
              {showProjectForm ? '닫기' : '+ 프로젝트 추가하기'}
            </Button>
          </div>

          <div className="space-y-4">
            <ProjectManager />
          </div>
        </div>
      )}
    </div>
  );
}