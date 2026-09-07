'use client';

import React from 'react';

interface DownloadButtonProps {
  content: string;
  filename?: string;
}

export default function ResultDownloadButton({
  content,
  filename = 'career-analysis-report.md',
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!content) return;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
    >
      <span>📥 결과물 다운로드 (Markdown)</span>
    </button>
  );
}