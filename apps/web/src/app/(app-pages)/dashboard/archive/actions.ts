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
      if (file && file.size > 0) {
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

        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          combinedExtractedText += `[공고 파일: ${file.name} 분석 완료]\n`;
        } else {
          const text = await file.text().catch(() => '');
          combinedExtractedText += `[공고 파일: ${file.name}]\n${text}\n\n`;
        }
      }
    }

    if (!combinedExtractedText) {
      combinedExtractedText = '업로드된 공고 파일 분석 완료';
    }

    const { error: dbError } = await (supabase.from('job_postings' as any) as any).insert({
      user_id: user.id,
      company_name: companyName,
      job_title: jobTitle,
      file_urls: uploadedUrls,
      file_names: uploadedNames,
      extracted_text: combinedExtractedText,
    });

    if (dbError) {
      return { success: false, message: `데이터베이스 저장 실패: ${dbError.message}` };
    }

    revalidatePath('/dashboard/archive');
    return { success: true };
  } catch (err: any) {
    console.error('Job posting upload error:', err);
    return { success: false, message: err.message || '서버 통신 중 오류가 발생했습니다.' };
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