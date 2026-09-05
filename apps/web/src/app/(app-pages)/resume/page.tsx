'use client';

import { useState } from 'react';

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert('자기소개서 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        alert(data.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI 자기소개서 분석</h1>
        <p className="text-gray-500">
          자기소개서를 입력하면 Gemini AI가 강점, 보완점, 그리고 면접 피드백을 상세히 분석해 드립니다.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          className="w-full h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
          placeholder="이곳에 자기소개서 내용을 붙여넣으세요..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? 'AI가 분석하는 중... (약 10초 소요)' : '자소서 분석 시작하기'}
        </button>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-zinc-900 border rounded-lg space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold">✨ AI 분석 결과</h2>
          <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}