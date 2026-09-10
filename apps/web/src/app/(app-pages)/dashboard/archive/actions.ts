// apps/web/src/app/(app-pages)/dashboard/archive/actions.ts
'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';

export async function uploadAndParseJobPosting(formData: FormData) {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('인증되지 않은 사용자입니다.');

  const file = formData.get('file') as File;
  const companyName = formData.get('companyName') as string;
  const jobTitle = formData.get('jobTitle') as string;

  if (!file || file.size === 0) {
    throw new Error('업로드할 파일이 없습니다.');
  }

  // 1. Supabase Storage에 파일 업로드
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('job-postings') // 'job-postings' 버킷 생성 필요
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`파일 업로드 실패: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('job-postings')
    .getPublicUrl(fileName);

  // 2. 텍스트 추출 시뮬레이션 및 실제 연동 파트 
  let extractedText = '';
  
  if (file.type.startsWith('image/') || file.type === 'application/pdf') {
    extractedText = `[자동 추출된 공고문 내용]\n파일 명: ${file.name}\n- 지원 직무 및 요건 분석 대기 중...`;
  } else {
    extractedText = await file.text().catch(() => '텍스트 추출 불가 파일');
  }

  // 3. DB에 공고문 및 추출 내용 저장 (as any 타입 캐스팅 적용)
  const { error: dbError } = await (supabase.from('job_postings' as any) as any).insert({
    user_id: user.id,
    company_name: companyName,
    job_title: jobTitle,
    file_url: publicUrl,
    extracted_text: extractedText,
  });

  if (dbError) {
    throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true, publicUrl, extractedText };
}