import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { updateProfile } from './actions';
import { unstable_noStore as noStore } from 'next/cache';

export default async function ProfilePage() {
  noStore();
  const supabase = await createSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await (supabase
    .from('profiles' as any)
    .select('*')
    .eq('id', user.id)
    .single() as any);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">커리어 프로필 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          플랫폼에 등록될 개인 정보 및 커리어 역량을 상세히 관리하세요.
        </p>
      </div>

      <form action={updateProfile} className="space-y-6 border p-6 rounded-lg bg-card">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              <input
                type="text"
                name="full_name"
                defaultValue={profile?.full_name || ''}
                required
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">나이</label>
              <input
                type="number"
                name="age"
                defaultValue={profile?.age || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="26"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">성별</label>
              <select
                name="gender"
                defaultValue={profile?.gender || ''}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="">선택 안 함</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">거주 지역</label>
              <input
                type="text"
                name="desired_location"
                defaultValue={profile?.desired_location || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="울산 / 부산"
              />
            </div>
          </div>
        </div>

        {/* 학력 및 자격 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">학력 및 자격</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">대학교 / 기관</label>
              <input
                type="text"
                name="university"
                defaultValue={profile?.university || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="부경대학교"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">전공</label>
              <input
                type="text"
                name="major"
                defaultValue={profile?.major || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="고분자공학과"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">보유 자격증</label>
            <input
              type="text"
              name="certifications"
              defaultValue={profile?.certifications || ''}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="위험물산업기사, 네트워크관리사 2급"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">병역 사항</label>
            <input
              type="text"
              name="military_service"
              defaultValue={profile?.military_service || ''}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="해군 병장 만기 전역 (CBR 방어 및 소방 지원)"
            />
          </div>
        </div>

        {/* 희망 직무 및 커리어 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">희망 및 포트폴리오</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">희망 직무</label>
              <input
                type="text"
                name="desired_role"
                defaultValue={profile?.desired_role || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="R&D / 품질관리(QC) / QA"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">희망 직종/산업</label>
              <input
                type="text"
                name="desired_industry"
                defaultValue={profile?.desired_industry || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="소재, 화학, 제조업"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">포트폴리오 / 링크 URL</label>
            <input
              type="url"
              name="portfolio_url"
              defaultValue={profile?.portfolio_url || ''}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="https://github.com/... 또는 노션 링크"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">핵심 프로젝트 및 경력 요약</label>
            <textarea
              name="career_summary"
              rows={4}
              defaultValue={profile?.career_summary || ''}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="캡스톤 디자인 프로젝트 (수중 발열팩 최적화) 등 주요 경험을 요약해주세요."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          프로필 정보 저장하기
        </button>
      </form>
    </div>
  );
}