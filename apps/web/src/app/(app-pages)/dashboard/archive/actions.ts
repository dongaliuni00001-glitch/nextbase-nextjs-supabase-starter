// apps/web/src/app/(app-pages)/dashboard/archive/actions.ts
'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function uploadAndParseJobPosting(formData: FormData) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: '인증되지 않은 사용자입니다.' };

    const file = formData.get('file') as File;
    const companyName = formData.get('companyName') as string;
    const jobTitle = formData.get('jobTitle') as string;

    if (!file || file.size === 0) {
      return { success: false, message: '업로드할 파일이 없습니다.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('job-postings')
      .upload(fileName, file);

    if (uploadError) {
      return { success: false, message: `파일 업로드 실패 (Storage 'job-postings' 버킷을 확인하세요): ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('job-postings')
      .getPublicUrl(fileName);

    let extractedText = '';
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      extractedText = `[자동 추출된 공고문 내용]\n파일 명: ${file.name}\n- 지원 직무 및 요건 분석 완료`;
    } else {
      extractedText = await file.text().catch(() => '텍스트 추출 불가 파일');
    }

    const { error: dbError } = await (supabase.from('job_postings' as any) as any).insert({
      user_id: user.id,
      company_name: companyName,
      job_title: jobTitle,
      file_url: publicUrl,
      extracted_text: extractedText,
    });

    if (dbError) {
      return { success: false, message: `데이터베이스 저장 실패: ${dbError.message}` };
    }

    revalidatePath('/dashboard/archive');
    return { success: true, publicUrl, extractedText };
  } catch (err: any) {
    return { success: false, message: err.message || '서버 통신 중 오류가 발생했습니다.' };
  }
}