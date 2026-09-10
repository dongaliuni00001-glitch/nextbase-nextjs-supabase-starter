// apps/web/src/app/(app-pages)/dashboard/job-postings/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteJobPostingAction } from '../../archive/actions';

export default function JobPostingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [posting, setPosting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [extractedText, setExtractedText] = useState('');

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );

  const fetchPosting = async () => {
    const { data } = await (supabase.from('job_postings' as any) as any)
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setPosting(data);
      setCompanyName(data.company_name);
      setJobTitle(data.job_title);
      setExtractedText(data.extracted_text || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosting();
  }, [id, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await (supabase.from('job_postings' as any) as any)
      .update({
        company_name: companyName,
        job_title: jobTitle,
        extracted_text: extractedText,
      })
      .eq('id', id);

    if (error) {
      alert(`수정 실패: ${error.message}`);
    } else {
      alert('수정되었습니다.');
      setIsEditing(false);
      fetchPosting();
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 공고를 삭제하시겠습니까?')) return;
    const res = await deleteJobPostingAction(id);
    if (res.success) {
      router.push('/dashboard/archive');
    } else {
      alert(res.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">로딩 중...</div>;
  }

  if (!posting) {
    return <div className="p-12 text-center text-sm text-destructive">공고를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs text-muted-foreground">채용 공고 상세 정보</span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">{posting.company_name} - {posting.job_title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/archive">&larr; 보관함으로</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4 p-6 border rounded-xl bg-card shadow-sm">
          <h3 className="font-semibold text-base">공고 정보 수정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">기업명</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">지원 직무</label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">공고 텍스트 / 분석 내용</label>
            <Textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} rows={6} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card p-4 border rounded-xl shadow-sm">
            <div>
              <span className="text-xs text-muted-foreground block">지원 직무</span>
              <span className="font-semibold text-base">{posting.job_title}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              수정하기
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">공고문 내용 / 요약</h3>
            <div className="p-6 border rounded-xl bg-card text-sm whitespace-pre-wrap leading-relaxed">
              {posting.extracted_text || '작성된 내용이 없습니다.'}
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold text-sm">첨부된 공고문 파일 목록</h3>
            {(!posting.file_urls || posting.file_urls.length === 0) ? (
              <p className="text-xs text-muted-foreground">첨부된 파일이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {posting.file_urls.map((url: string, index: number) => {
                  const name = posting.file_names?.[index] || `공고 파일 ${index + 1}`;
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
      )}
    </div>
  );
}