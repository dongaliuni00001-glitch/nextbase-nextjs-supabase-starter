// apps/web/src/app/(app-pages)/dashboard/archive/JobPostingUploadForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadAndParseJobPosting } from './actions';

export function JobPostingUploadForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await uploadAndParseJobPosting(formData);
      if (res?.success) {
        setSuccessMsg('채용 공고가 성공적으로 등록되었습니다!');
        (e.target as HTMLFormElement).reset();
        window.location.reload(); // 목록 새로고침
      } else {
        setErrorMsg(res?.message || '업로드 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-xl bg-card shadow-sm max-w-2xl mx-auto">
      <h3 className="font-semibold text-base">새 채용 공고 레퍼런스 업로드</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">기업명</label>
          <Input name="companyName" placeholder="예: 삼성전자" required className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">지원 직무</label>
          <Input name="jobTitle" placeholder="예: 고분자 R&D 연구원" required className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">공고문 파일 (이미지, PDF, 문서 등)</label>
        <Input type="file" name="file" required className="mt-1" />
      </div>
      {errorMsg && <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md">{errorMsg}</div>}
      {successMsg && <div className="p-3 text-xs text-green-600 bg-green-500/10 rounded-md">{successMsg}</div>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '업로드 및 텍스트 추출 중...' : '공고문 업로드 및 분석'}
      </Button>
    </form>
  );
}