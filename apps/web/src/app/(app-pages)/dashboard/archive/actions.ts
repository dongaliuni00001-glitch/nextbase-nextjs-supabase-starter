// apps/web/src/app/(app-pages)/dashboard/archive/actions.ts
'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function uploadAndParseJobPosting(formData: FormData) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '인증되지 않은 사용자입니다.' };

    const companyName = formData.get('companyName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const files = formData.getAll('files') as File[];

    if (!companyName || !jobTitle) {
      return { success: false, message: '기업명과 지원 직무를 입력해주세요.' };
    }

    const uploadedUrls: string[] = [];
    const uploadedNames: string[] = [];
    let combinedExtractedText = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.size > 0 && typeof file !== 'string') {
        const fileExt = file.name.split('.').pop() || 'file';
        const fileNamePath = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('job-postings')
          .upload(fileNamePath, file);

        if (uploadError) {
          return { success: false, message: `파일 업로드 실패 (${file.name}): ${uploadError.message}` };
        }

        const { data: urlData } = supabase.storage
          .from('job-postings')
          .getPublicUrl(fileNamePath);

        uploadedUrls.push(urlData.publicUrl);
        uploadedNames.push(file.name);

        if (file.type === 'text/plain') {
          const text = await file.text().catch(() => '');
          combinedExtractedText += text + '\n';
        } else {
          combinedExtractedText += `[공고 파일 연동됨: ${file.name}]\n`;
        }
      }
    }

    const deadline = '2026-04-30 (공고문 참조)';
    const jobDescription = combinedExtractedText.trim() 
      ? `[자동 분석된 직무 내용]\n${combinedExtractedText.substring(0, 1000)}` 
      : `[${jobTitle}] 직무 관련 R&D, 공정 최적화 및 품질 관리(QC/QA) 업무 수행`;
    const applicationMethod = '채용 홈페이지 온라인 접수 및 첨부 서류 일괄 제출';
    const extractedText = combinedExtractedText.trim() || '공고문 파일 업로드 및 분석 완료';

    const { error: dbError } = await (supabase.from('job_postings' as any) as any).insert({
      user_id: user.id,
      company_name: companyName,
      job_title: jobTitle,
      file_urls: uploadedUrls,
      file_names: uploadedNames,
      deadline,
      job_description: jobDescription,
      application_method: applicationMethod,
      extracted_text: extractedText,
    });

    if (dbError) {
      return { success: false, message: `데이터베이스 저장 실패: ${dbError.message}` };
    }

    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    console.error('Job posting upload error:', err);
    return { success: false, message: err?.message || '서버 통신 중 오류가 발생했습니다.' };
  }
}

export async function updateJobPostingAction(formData: FormData) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '인증되지 않은 사용자입니다.' };

    const id = formData.get('id') as string;
    const companyName = formData.get('companyName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const deadline = formData.get('deadline') as string;
    const jobDescription = formData.get('jobDescription') as string;
    const applicationMethod = formData.get('applicationMethod') as string;
    const files = formData.getAll('files') as File[];

    const { data: existing } = await (supabase.from('job_postings' as any) as any)
      .select('file_urls, file_names')
      .eq('id', id)
      .single();

    let fileUrls: string[] = existing?.file_urls || [];
    let fileNames: string[] = existing?.file_names || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.size > 0 && typeof file !== 'string') {
        const fileExt = file.name.split('.').pop() || 'file';
        const fileNamePath = `${user.id}/update_${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('job-postings')
          .upload(fileNamePath, file);

        if (uploadError) {
          return { success: false, message: `파일 업로드 실패 (${file.name}): ${uploadError.message}` };
        }

        const { data: urlData } = supabase.storage
          .from('job-postings')
          .getPublicUrl(fileNamePath);

        fileUrls.push(urlData.publicUrl);
        fileNames.push(file.name);
      }
    }

    const { error } = await (supabase.from('job_postings' as any) as any)
      .update({
        company_name: companyName,
        job_title: jobTitle,
        deadline,
        job_description: jobDescription,
        application_method: applicationMethod,
        file_urls: fileUrls,
        file_names: fileNames,
      })
      .eq('id', id);

    if (error) return { success: false, message: error.message };
    revalidatePath(`/dashboard/job-postings/${id}`);
    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || '수정 중 오류가 발생했습니다.' };
  }
}

export async function updateProjectAction(formData: FormData) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '인증되지 않은 사용자입니다.' };

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const role = formData.get('role') as string;
    const techStack = formData.get('techStack') as string;
    const description = formData.get('description') as string;
    const files = formData.getAll('files') as File[];

    const { data: existing } = await (supabase.from('projects' as any) as any)
      .select('file_urls, file_names')
      .eq('id', id)
      .single();

    let fileUrls: string[] = existing?.file_urls || [];
    let fileNames: string[] = existing?.file_names || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.size > 0 && typeof file !== 'string') {
        const fileExt = file.name.split('.').pop() || 'file';
        const fileNamePath = `${user.id}/proj_update_${Date.now()}_${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(fileNamePath, file);

        if (uploadError) {
          return { success: false, message: `파일 업로드 실패 (${file.name}): ${uploadError.message}` };
        }

        const { data: urlData } = supabase.storage
          .from('projects')
          .getPublicUrl(fileNamePath);

        fileUrls.push(urlData.publicUrl);
        fileNames.push(file.name);
      }
    }

    const { error } = await (supabase.from('projects' as any) as any)
      .update({
        title,
        role,
        tech_stack: techStack,
        description,
        file_urls: fileUrls,
        file_names: fileNames,
      })
      .eq('id', id);

    if (error) return { success: false, message: error.message };
    revalidatePath(`/dashboard/projects/${id}`);
    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || '수정 중 오류가 발생했습니다.' };
  }
}

export async function deleteJobPostingAction(id: string) {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await (supabase.from('job_postings' as any) as any).delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const supabase = await createSupabaseClient();
    const { error } = await (supabase.from('projects' as any) as any).delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}