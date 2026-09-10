// apps/web/src/app/(app-pages)/dashboard/archive/JobPostingList.tsx
'use client';

import { Button } from '@/components/ui/button';

interface JobPosting {
  id: string;
  company_name: string;
  job_title: string;
  file_url: string;
  extracted_text: string;
  created_at: string;
}

export function JobPostingList({ postings }: { postings: JobPosting[] }) {
  const handleDownloadText = (title: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_추출텍스트.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!postings || postings.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 공고문이 없습니다.</p>;
  }

  return (
    <div className="space-y-4 mt-8 max-w-2xl mx-auto">
      <h3 className="text-lg font-bold">업로드된 공고문 및 추출 결과 목록</h3>
      <div className="grid gap-4">
        {postings.map((item) => (
          <div key={item.id} className="p-4 border rounded-xl bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{item.company_name}</span>
                <span className="text-sm text-muted-foreground">- {item.job_title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                등록 일시: {new Date(item.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none"
              >
                <Button variant="outline" size="sm" className="w-full">
                  원본 파일 보기
                </Button>
              </a>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadText(`${item.company_name}_${item.job_title}`, item.extracted_text)}
                className="flex-1 md:flex-none"
              >
                텍스트 (.txt) 다운로드
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}