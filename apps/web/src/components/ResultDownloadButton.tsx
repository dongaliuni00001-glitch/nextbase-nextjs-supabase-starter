'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  content: string;
  rawData?: any;
  filenamePrefix?: string;
  filename?: string; // 👈 filename 속성 추가 지원
}

export default function ResultDownloadButton({
  content,
  rawData,
  filenamePrefix = 'career-report',
  filename,
}: DownloadButtonProps) {
  const [format, setFormat] = useState<'md' | 'txt' | 'json' | 'doc' | 'xls' | 'pdf' | 'png' | 'jpeg' | 'html' | 'rtf'>('md');
  const [isProcessing, setIsProcessing] = useState(false);

  // 전달받은 파일명 우선순위 적용
  const actualFilename = filename || filenamePrefix;

  const handleDownload = async () => {
    if (!content) return;

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
      fileContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${actualFilename}</title><style>body { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; white-space: pre-wrap; background: #f9fafb; color: #111827; }</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`;
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
              <title>${actualFilename}</title>
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
    } else if (format === 'png' || format === 'jpeg') {
      setIsProcessing(true);
      try {
        const htmlFormatted = content.replace(/\n/g, '<br>');
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Malgun Gothic', sans-serif; padding: 40px; background: #ffffff; color: #111827; font-size: 14px; line-height: 1.6; box-sizing: border-box; height: 100%; overflow: hidden;">
                ${htmlFormatted}
              </div>
            </foreignObject>
          </svg>
        `;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const mime = format === 'png' ? 'image/png' : 'image/jpeg';
            const ext = format === 'jpeg' ? 'jpg' : 'png';
            const dataUrl = canvas.toDataURL(mime, 0.9);

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${actualFilename}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        };

        img.onerror = () => {
          alert('이미지 변환 중 오류가 발생했습니다.');
          setIsProcessing(false);
        };

        img.src = url;
        return;
      } catch (e) {
        console.error(e);
        setIsProcessing(false);
        alert('이미지 생성에 실패했습니다.');
        return;
      }
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${actualFilename}.${extension}`;
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
        <option value="png">이미지 PNG (.png)</option>
        <option value="jpeg">이미지 JPEG (.jpg)</option>
        <option value="json">백업용 JSON (.json)</option>
      </select>
      
      <Button onClick={handleDownload} disabled={isProcessing} variant="outline" size="sm" className="flex items-center gap-1">
        <span>{isProcessing ? '변환 중...' : '📥 다운로드'}</span>
      </Button>
    </div>
  );
}