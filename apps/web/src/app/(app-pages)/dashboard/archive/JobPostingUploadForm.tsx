// apps/web/src/app/(app-pages)/dashboard/archive/JobPostingUploadForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadAndParseJobPosting } from './actions';

export function JobPostingUploadForm() {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResultText(null);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await uploadAndParseJobPosting(formData);
      setResultText(res.extractedText);
      alert('공고문 업로드 및 텍스트 추출이 완료되었습니다!');
    } catch (error: any) {
      alert(`오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-card max-w-2xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold">채용 공고문 멀티모달 업로드</h2>
      <p className="text-sm text-muted-foreground">
        스크린샷, 이미지, PDF 또는 Word 형태의 공고문을 업로드하면 AI가 핵심 텍스트를 자동 추출합니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">지원 기업명</label>
            <Input name="companyName" placeholder="예: 삼성전자" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">지원 직무</label>
            <Input name="jobTitle" placeholder="예: 고분자 소재 R&D" required className="mt-1" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">공고문 파일 (이미지 / PDF / 문서)</label>
          <Input type="file" name="file" accept="image/*,application/pdf,.doc,.docx" required className="mt-1 cursor-pointer" />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '파일 분석 및 텍스트 추출 중...' : '공고문 업로드 및 분석 시작'}
        </Button>
      </form>

      {resultText && (
        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
          <h3 className="font-semibold text-sm">추출된 공고문 내용 미리보기</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono bg-background p-3 rounded border">
            {resultText}
          </pre>
        </div>
      )}
    </div>
  );
}