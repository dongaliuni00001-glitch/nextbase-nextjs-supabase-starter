// apps/web/src/app/(app-pages)/dashboard/archive/JobPostingList.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { deleteJobPostingAction } from './actions';

export function JobPostingList({ postings }: { postings: any[] }) {
  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 채용 공고 레퍼런스를 삭제하시겠습니까?')) return;
    const res = await deleteJobPostingAction(id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    window.location.reload();
  };

  if (!postings || postings.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-8">등록된 채용 공고 레퍼런스가 없습니다.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {postings.map((post) => {
        const formattedDate = post.created_at ? post.created_at.replace('T', ' ').substring(0, 16) : '';
        return (
          <Card key={post.id} className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{post.company_name}</Badge>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <CardTitle className="text-base font-semibold line-clamp-1">{post.job_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {post.extracted_text || '추출된 내용이 없습니다.'}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-6 py-3 text-xs">
              <span className="text-muted-foreground">파일 수: {post.file_urls?.length || 0}개</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-destructive hover:underline font-medium"
                >
                  삭제
                </button>
                <Link
                  href={`/dashboard/job-postings/${post.id}`}
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
  );
}