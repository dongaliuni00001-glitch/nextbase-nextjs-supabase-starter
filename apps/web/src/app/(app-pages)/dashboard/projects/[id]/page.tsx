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

  const getAiAnalysis = () => {
    if (!project) return null;
    const desc = project.description || '';
    const tech = project.tech_stack || '';
    const role = project.role || '';
    const filesCount = project.file_urls?.length || 0;

    let strength = `담당 역할(${role})과 기술 스택(${tech})의 연계성이 확인됩니다.`;
    let feedback = `상세 내용의 글자 수가 ${desc.length}자입니다. 구체적인 성과 지표(예: 공정 효율 15% 향상, 반응 시간 단축 등)를 추가하면 직무 적합도가 극대화됩니다.`;

    if (desc.includes('%') || desc.includes('향상') || desc.includes('단축') || desc.includes('최적화')) {
      strength += ` 정량적 성과 키워드가 포함되어 있어 직무 역량 어필에 매우 유리합니다.`;
    }

    if (filesCount > 0) {
      strength += ` 첨부된 ${filesCount}개의 증빙 파일이 포트폴리오의 신뢰도를 높여줍니다.`;
    } else {
      feedback += ` 실험 결과서나 관련 증빙 파일을 추가로 업로드하면 서류 평가 경쟁력이 더욱 높아집니다.`;
    }

    return { strength, feedback };
  };

  const aiReport = getAiAnalysis();

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
            <label className="text-sm font-medium">사용 기술 / 스펙</label>
            <Input name="techStack" defaultValue={project.tech_stack} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">상세 내용 및 성과</label>
            <Textarea name="description" defaultValue={project.description} rows={4} className="mt-1" />
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
                <span className="text-muted-foreground block text-xs">사용 기술 / 스펙</span>
                <span className="font-semibold">{project.tech_stack || '미지정'}</span>
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

          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-primary">🤖 AI 프로젝트 실시간 심층 분석 리포트</h3>
              <span className="text-xs text-muted-foreground">입력 데이터 기반 동기화 완료</span>
            </div>
            <div className="p-6 border rounded-xl bg-muted/20 text-sm space-y-3 leading-relaxed">
              <div>
                <span className="font-semibold block text-xs text-muted-foreground mb-1">💡 핵심 강점 및 분석</span>
                <p>{aiReport?.strength}</p>
              </div>
              <div>
                <span className="font-semibold block text-xs text-muted-foreground mb-1">📈 보완점 및 AI 피드백</span>
                <p>{aiReport?.feedback}</p>
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