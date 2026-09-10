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
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('job-postings') // 'job-postings' 버킷 생성 필요
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`파일 업로드 실패: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('job-postings')
    .getPublicUrl(fileName);

  // 2. 텍스트 추출 시뮬레이션 및 실제 연동 파트 
  // (PDF, 이미지, 문서 형식에 따라 OCR 또는 LLM Vision API를 연동하여 텍스트를 추출합니다)
  let extractedText = '';
  
  if (file.type.startsWith('image/') || file.type === 'application/pdf') {
    // TODO: 여기에 OpenAI Vision API 또는 수동/서버 OCR 파싱 로직을 연결할 수 있습니다.
    // 현재는 업로드된 파일 기반 메타 주입 및 기본 텍스트 추출 형태를 구성합니다.
    extractedText = `[자동 추출된 공고문 내용]\n파일 명: ${file.name}\n- 지원 직무 및 요건 분석 대기 중...`;
  } else {
    // 텍스트 기반 파일인 경우 직접 읽기 처리 가능
    extractedText = await file.text().catch(() => '텍스트 추출 불가 파일');
  }

  // 3. DB에 공고문 및 추출 내용 저장
  const { error: dbError } = await supabase.from('job_postings').insert({
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