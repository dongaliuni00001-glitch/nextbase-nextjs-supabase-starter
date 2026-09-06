'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveResumeAction } from './actions';
import { useRouter } from 'next/navigation';

export default function EditorPage() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await saveResumeAction({ company, jobRole, questionTitle, content });

      // 서버 액션 처리 결과가 실패인 경우
      if (!result || !result.success) {
        alert(`저장 실패 원인: ${result?.error || '알 수 없는 서버 오류'}`);
        return;
      }
      
      alert('성공적으로 저장되었습니다! AI 심층 분석 페이지로 이동합니다.');
      router.push('/dashboard/archive');
    } catch (error: any) {
      alert(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">자소서 작성·첨삭 에디터</h1>
        <p className="text-sm text-muted-foreground">
          지원 정보를 입력하고 본문을 작성하여 AI 심층 분석 및 문장 교정을 받아보세요.
        </p>
      </div>

      <form onSubmit={handleAiAnalysis} className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. 지원 정보 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">지원 기업명</Label>
                <Input
                  id="company"
                  placeholder="예: 삼성전자, 현대자동차"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobRole">지원 직무</Label>
                <Input
                  id="jobRole"
                  placeholder="예: 고분자 연구개발, 공정 품질 관리"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionTitle">자기소개서 문항</Label>
                <Input
                  id="questionTitle"
                  placeholder="예: 지원동기 및 직무 역량"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. 컨텍스트 및 파일 연동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>프로젝트/경력 모듈 불러오기</Label>
                <div className="rounded-md border p-3 text-xs text-muted-foreground">
                  연동된 프로젝트 경력이 없습니다.
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUpload">참조 문서 업로드 (PDF/Word)</Label>
                <Input id="fileUpload" type="file" accept=".pdf,.doc,.docx" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">3. 자기소개서 본문 작성</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">본문 내용 (실시간 편집)</Label>
              <Textarea
                id="content"
                placeholder="자기소개서 본문을 직접 입력하거나 붙여넣으세요. (최소 200자 이상 권장)"
                className="min-h-[350px] resize-y font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="text-right text-xs text-muted-foreground">
                현재 글자수: {content.length}자
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button type="button" variant="outline">
              임시 저장
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 및 분석 요청 중...' : '✨ AI 심층 분석 및 첨삭 요청'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}