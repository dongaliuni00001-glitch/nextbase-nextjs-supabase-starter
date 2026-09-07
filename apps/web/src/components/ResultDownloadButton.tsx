'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  content: string;
  rawData?: any;
  filenamePrefix?: string;
  filename?: string;
}

export default function ResultDownloadButton({
  content,
  rawData,
  filenamePrefix = 'career-report',
  filename,
}: DownloadButtonProps) {
  const [format, setFormat] = useState<'md' | 'txt' | 'json' | 'doc' | 'xls' | 'pdf' | 'html' | 'rtf'>('md');
  const [isProcessing, setIsProcessing] = useState(false);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 생성
  const getFormattedDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDownload = async () => {
    if (!content) return;

    const dateStr = getFormattedDate();
    // 파일명에 'md'가 섞여 들어오는 경우 깔끔하게 제거
    const rawBaseName = filename || filenamePrefix || 'career-report';
    const baseName = rawBaseName.replace(/\bmd\b/gi, '').replace(/-md/gi, '').trim() || 'career-report';
    const finalFilename = `${baseName}-${dateStr}`;

    let fileContent = content;
    let mimeType = 'text/markdown;charset=utf-8';
    let extension = 'md';

    if (format === 'txt') {
      mimeType = 'text/plain;charset=utf-8';
      extension = 'txt';
    } else if (format === 'json') {
      fileContent = JSON.stringify(rawData || { content }, null, 2);
      mimeType = 'application/json;charset=utf-8';
      extension = 'json';
    } else if (format === 'doc') {
      mimeType = 'application/msword;charset=utf-8';
      extension = 'doc';
      fileContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title></head><body style="font-family: malgun gothic; line-height: 1.6; white-space: pre-wrap;">${content.replace(/\n/g, '<br>')}</body></html>`;
    } else if (format === 'xls') {
      mimeType = 'application/vnd.ms-excel;charset=utf-8';
      extension = 'xls';
      fileContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table border="1"><tr><td>${content.replace(/\n/g, '</td></tr><tr><td>')}</td></tr></table></body></html>`;
    } else if (format === 'html') {
      mimeType = 'text/html;charset=utf-8';
      extension = 'html';
      fileContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${finalFilename}</title><style>body { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; white-space: pre-wrap; background: #f9fafb; color: #111827; }</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`;
    } else if (format === 'rtf') {
      mimeType = 'application/rtf;charset=utf-8';
      extension = 'rtf';
      fileContent = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil Malgun Gothic;}}\\f0\\fs20 ${content.replace(/\n/g, '\\par\n')}}`;
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${finalFilename}</title>
              <style>
                body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; padding: 40px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              ${content.replace(/\n/g, '<br>')}
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      return;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalFilename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as any)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
      >
        <option value="md">Markdown (.md)</option>
        <option value="txt">Plain Text (.txt)</option>
        <option value="html">웹문서 HTML (.html)</option>
        <option value="rtf">범용 서식 RTF (.rtf)</option>
        <option value="doc">MS Word / 한글 호환 (.doc)</option>
        <option value="xls">Excel / 한셀 호환 (.xls)</option>
        <option value="pdf">PDF 문서 (.pdf)</option>
        <option value="json">백업용 JSON (.json)</option>
      </select>
      
      <Button onClick={handleDownload} disabled={isProcessing} variant="outline" size="sm" className="flex items-center gap-1">
        <span>{isProcessing ? '변환 중...' : '📥 다운로드'}</span>
      </Button>
    </div>
  );
}