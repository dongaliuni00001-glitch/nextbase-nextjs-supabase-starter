// apps/web/src/app/(app-pages)/dashboard/archive/ProjectManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ProjectManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await (supabase.from('projects' as any) as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    let fileUrl = '';
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(fileName, file);

      if (uploadError) {
        setErrorMsg(`파일 업로드 실패 (Storage 'projects' 버킷 확인): ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('projects')
        .getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    }

    const { error } = await (supabase.from('projects' as any) as any).insert({
      user_id: user.id,
      title,
      role,
      tech_stack: techStack,
      description,
      file_url: fileUrl,
    });

    if (error) {
      setErrorMsg(`데이터베이스 저장 실패: ${error.message}`);
    } else {
      setTitle('');
      setRole('');
      setTechStack('');
      setDescription('');
      setFile(null);
      alert('프로젝트와 레퍼런스 파일이 등록되었습니다!');
      fetchProjects();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-card shadow-sm max-w-2xl mx-auto">
      <h3 className="text-lg font-bold">사전 프로젝트 및 경력 관리</h3>
      <p className="text-sm text-muted-foreground">
        자소서 AI 첨삭 시 참조할 본인의 프로젝트 경험과 관련 파일(포트폴리오, 수료증 등)을 등록하세요.
      </p>

      <form onSubmit={handleAddProject} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">프로젝트명</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 수중 가열 팩 최적화 캡스톤" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">담당 역할</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="예: 팀장 / R&D 담당" required className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">사용 기술 / 스펙</label>
          <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="예: 고분자 배합, FT-IR 분석" className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">상세 내용 및 성과</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="프로젝트 주요 내용 및 수치화된 성과 입력" rows={3} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">관련 증빙 파일 (선택)</label>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
        </div>

        {errorMsg && <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md">{errorMsg}</div>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '등록 중...' : '프로젝트 및 파일 등록'}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        <h3 className="font-semibold text-sm">등록된 프로젝트 목록 ({projects.length}개)</h3>
        {projects.length === 0 ? (
          <p className="text-xs text-muted-foreground">연동된 프로젝트 경력이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="p-4 border rounded-lg bg-background text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{p.title} <span className="text-muted-foreground font-normal">({p.role})</span></span>
                  {p.file_url && (
                    <a href={p.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        증빙 파일 다운로드/보기
                      </Button>
                    </a>
                  )}
                </div>
                <div>기술/스펙: {p.tech_stack}</div>
                <div className="text-muted-foreground line-clamp-2">{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}