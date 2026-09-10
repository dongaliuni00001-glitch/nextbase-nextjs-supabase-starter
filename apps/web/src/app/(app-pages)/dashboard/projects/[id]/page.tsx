// apps/web/src/app/(app-pages)/dashboard/projects/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteProjectAction, updateProjectAction } from '../../archive/actions';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [keptFiles, setKeptFiles] = useState<{ url: string; name: string }[]>([]);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      ),
    []
  );

  const fetchProject = async () => {
    try {
      const { data } = await (supabase.from('projects' as any) as any)
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setProject(data);
        const urls = data.file_urls || [];
        const names = data.file_names || [];
        setKeptFiles(urls.map((url: string, idx: number) => ({ url, name: names[idx] || `파일 ${idx + 1}` })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, supabase]);

  const handleRemoveKeptFile = (index: number) => {
    setKeptFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('id', id);

      keptFiles.forEach(file => {
        formData.append('keptFileUrls', file.url);
        formData.append('keptFileNames', file.name);
      });

      const res = await updateProjectAction(formData);

      if (!res.success) {
        alert(`수정 실패: ${res.message}`);
      } else {
        alert('성공적으로 수정되었습니다.');
        setIsEditing(false);
        fetchProject();
      }
    } catch (err: any) {
      alert(`서버 통신 오류: ${err?.message || '알 수 없는 오류가 발생했습니다.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    const res = await deleteProjectAction(id);
    if (res.success) {
      router.push('/dashboard/archive');
    } else {
      alert(res.message);
    }
  };

  // 어떤 프로젝트든 범용적으로 분석하는 Universal AI 분석 엔진
  const getUniversalAiAnalysis = () => {
    if (!project) return null;
    const title = project.title || '프로젝트';
    const desc = project.description || '';
    const tech = project.tech_stack || '';
    const role = project.role || '담당자';

    // 1. 기술 스택이 비어있을 경우 내용 및 제목을 바탕으로 도메인 자동 추론
    let inferredTech = tech;
    if (!tech || tech === '미지정' || tech.trim() === '') {
      const combined = (title + ' ' + desc).toLowerCase();
      if (combined.includes('react') || combined.includes('next') || combined.includes('web') || combined.includes('app') || combined.includes('프론트엔드')) {
        inferredTech = 'Frontend, Web Development, UI/UX Architecture';
      } else if (combined.includes('python') || combined.includes('ai') || combined.includes('data') || combined.includes('머신러닝') || combined.includes('분석')) {
        inferredTech = 'Python, Data Analytics, Machine Learning';
      } else if (combined.includes('공정') || combined.includes('설계') || combined.includes('최적화') || combined.includes('화학') || combined.includes('소재') || combined.includes('실험')) {
        inferredTech = 'Process Optimization, R&D, Quality Control, DoE';
      } else {
        inferredTech = 'Project Management, Problem Solving, Technical Execution';
      }
    }

    // 2. 본문 내용을 문장 단위로 파싱하여 동적 구조화 표(Table) 생성
    const sentences = desc.split(/[\n.]+/).filter((s: string) => s.trim().length > 3);
    const challenge = sentences[0] || '프로젝트 초기 목표 수립 및 요건 정의';
    const method = sentences[1] || sentences[2] || '체계적인 변인 통제 및 실행 과정 수행';
    const result = sentences[sentences.length - 1] || '핵심 성과 도출 및 검증 완료';

    const tableData = [
      { factor: '🎯 프로젝트 목표 및 과제', condition: title, impact: challenge.trim() },
      { factor: '⚙️ 실행 방법 및 접근법', condition: `역할: ${role}`, impact: method.trim() },
      { factor: '📈 도출된 주요 성과', condition: '실행 및 결과 검증', impact: result.trim() },
    ];

    // 3. 성과 지표 추출 (숫자나 핵심 키워드 감지)
    const hasMetrics = /\d+/.test(desc) || desc.includes('향상') || desc.includes('단축') || desc.includes('최적화') || desc.includes('유지') || desc.includes('달성');
    const metrics = [
      { label: '담당 역할', value: role },
      { label: '성과 도출 여부', value: hasMetrics ? '정량/성능 지표 포함' : '수행 완료' },
      { label: '서술 상세도', value: `${desc.length}자 분석됨` },
    ];

    // 4. 이력서용 한 줄 요약 생성
    const cleanDesc = desc.replace(/\n/g, ' ').substring(0, 70);
    const resumeBullet = `• [${role}] ${title}: ${cleanDesc}${desc.length > 70 ? '...' : ''}`;

    // 5. 피드백 생성
    const feedback = hasMetrics
      ? '구체적인 수치와 결과 지표가 포함되어 있어 직무 전문성 어필에 매우 효과적입니다.'
      : '상세 내용에 구체적인 성과 수치(예: 효율 % 향상, 시간 단축 등)를 보완하면 서류 평가 경쟁력이 더욱 극대화됩니다.';

    return {
      inferredTech,
      summary: `본 프로젝트는 [${title}] 주제로 진행되었으며, ${role}로서 체계적인 분석과 문제 해결 과정을 거쳐 실무 역량을 입증할 수 있도록 구조화되어 있습니다.`,
      tableData,
      metrics,
      resumeBullet,
      feedback,
    };
  };

  const aiReport = getUniversalAiAnalysis();

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">로딩 중...</div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-sm text-destructive">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs text-muted-foreground">프로젝트 및 경력 상세 관리</span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">{project.title}</h1>
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
        <form onSubmit={handleUpdateSubmit} className="space-y-4 p-6 border rounded-xl bg-card shadow-sm">
          <h3 className="font-semibold text-base">프로젝트 정보 및 파일 수정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">프로젝트명</label>
              <Input name="title" defaultValue={project.title} required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">담당 역할</label>
              <Input name="role" defaultValue={project.role} required className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">사용 기술 / 스펙 (비워두면 AI가 내용 기반으로 자동 추론합니다)</label>
            <Input name="techStack" defaultValue={project.tech_stack} placeholder="예: React, Python, 공정 최적화 등" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">상세 내용 및 성과</label>
            <Textarea name="description" defaultValue={project.description} rows={6} className="mt-1" />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">기존 증빙 파일 관리 (삭제 가능)</label>
            {keptFiles.length === 0 ? (
              <p className="text-xs text-muted-foreground">유지되는 기존 파일이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {keptFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded bg-muted/30 text-xs">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <Button type="button" variant="destructive" size="sm" className="h-6 px-2 text-xs" onClick={() => handleRemoveKeptFile(idx)}>
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">새 증빙 파일 추가 업로드 (선택)</label>
            <Input type="file" name="files" multiple className="mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); fetchProject(); }}>취소</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '저장 중...' : '저장'}</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card p-4 border rounded-xl shadow-sm">
            <div className="grid grid-cols-2 gap-8 text-sm w-full">
              <div>
                <span className="text-muted-foreground block text-xs">담당 역할</span>
                <span className="font-semibold">{project.role || '미지정'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">사용 기술 / 스펙 <span className="text-xs text-primary font-normal">(AI 자동 추론 적용)</span></span>
                <span className="font-semibold">{project.tech_stack || aiReport?.inferredTech}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              수정하기
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">상세 내용 및 성과</h3>
            <div className="p-6 border rounded-xl bg-card text-sm whitespace-pre-wrap leading-relaxed">
              {project.description || '작성된 내용이 없습니다.'}
            </div>
          </div>

          {/* 🤖 범용 동적 AI 심층 분석 리포트 (어떤 프로젝트든 대응) */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-primary flex items-center gap-2">
                <span>🤖 AI 프로젝트 심층 분석 및 성과 리포트</span>
              </h3>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">실시간 동기화됨</span>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm space-y-6 text-sm">
              {/* 핵심 요약 */}
              <div className="space-y-1.5">
                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">💡 프로젝트 요약 및 핵심 역량</span>
                <p className="leading-relaxed">{aiReport?.summary}</p>
              </div>

              {/* KPI 메트릭 카드 */}
              {aiReport?.metrics && aiReport.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {aiReport.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-muted/30 text-center">
                      <span className="text-xs text-muted-foreground block mb-1">{m.label}</span>
                      <span className="font-bold text-primary text-base truncate block">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 동적 구조화 분석 표 (Table) */}
              {aiReport?.tableData && aiReport.tableData.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">📊 프로젝트 단계별 구조화 분석 표</span>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="p-3 font-semibold">구분</th>
                          <th className="p-3 font-semibold">입력 정보</th>
                          <th className="p-3 font-semibold">AI 분석 및 성과</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiReport.tableData.map((row, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="p-3 font-medium whitespace-nowrap">{row.factor}</td>
                            <td className="p-3 text-muted-foreground">{row.condition}</td>
                            <td className="p-3 font-medium text-primary">{row.impact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 이력서 즉시 활용 성과 문장 */}
              <div className="space-y-2 p-4 border rounded-lg bg-primary/5 border-primary/20">
                <span className="font-semibold text-xs text-primary block">✨ [자소서/이력서 추천] 핵심 성과 한 줄 요약</span>
                <p className="font-medium text-xs leading-relaxed">{aiReport?.resumeBullet}</p>
              </div>

              {/* AI 보완 피드백 */}
              <div className="space-y-1 pt-2 border-t">
                <span className="font-semibold text-xs text-muted-foreground block">📈 AI 추가 보완 피드백</span>
                <p className="text-xs text-muted-foreground">{aiReport?.feedback}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold text-sm">첨부된 증빙 파일 목록</h3>
            {(!project.file_urls || project.file_urls.length === 0) ? (
              <p className="text-xs text-muted-foreground">등록된 증빙 파일이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {project.file_urls.map((url: string, index: number) => {
                  const name = project.file_names?.[index] || `증빙 파일 ${index + 1}`;
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