'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const RANK_MAPPING: Record<string, string[]> = {
  육군: ['병장', '상병', '일병', '이병', '하사', '중사', '상사', '원사', '소위', '중위', '대위'],
  해군: ['병장', '상병', '일병', '이병', '하사', '중사', '상사', '원사', '소위', '중위', '대위'],
  공군: ['병장', '상병', '일병', '이병', '하사', '중사', '상사', '원사', '소위', '중위', '대위'],
  해병대: ['병장', '상병', '일병', '이병', '하사', '중사', '상사', '원사', '소위', '중위', '대위'],
  사회복무요원: ['사회복무요원'],
  상근예비역: ['병장', '상병', '일병', '이병'],
  기타: ['기타']
};

export function ProfileForm({ profile, action }: { profile: any; action: (formData: FormData) => Promise<any> }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [gender, setGender] = useState(profile?.gender || '');
  
  const [certifications, setCertifications] = useState<any[]>(profile?.certifications || []);
  const [militaryServices, setMilitaryServices] = useState<any[]>(profile?.military_service || []);
  const [portfolios, setPortfolios] = useState<any[]>(profile?.portfolios || []);

  const [certFiles, setCertFiles] = useState<Record<number, File>>({});
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', date: '', proofUrl: '' }]);
  };
  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
    const newFiles = { ...certFiles };
    delete newFiles[index];
    setCertFiles(newFiles);
  };

  const addMilitary = () => {
    setMilitaryServices([...militaryServices, { branch: '육군', dischargeType: '만기전역', rank: '병장', startMonth: '', endMonth: '' }]);
  };
  const removeMilitary = (index: number) => {
    setMilitaryServices(militaryServices.filter((_, i) => i !== index));
  };

  const addPortfolio = () => {
    setPortfolios([...portfolios, { platform: 'GitHub', customPlatform: '', title: '', url: '', description: '' }]);
  };
  const removePortfolio = (index: number) => {
    setPortfolios(portfolios.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        setIsLoading(false);
        return;
      }

      const formData = new FormData(e.currentTarget);
      let avatar_url = profile?.avatar_url || '';

      // 1. 증명사진 클라이언트 직접 업로드
      if (avatarFile) {
        const avatarPath = `${userId}/avatar/${Date.now()}_${avatarFile.name}`;
        const { error: avatarUploadError } = await supabase.storage
          .from('documents')
          .upload(avatarPath, avatarFile);

        if (avatarUploadError) {
          alert(`증명사진 업로드 실패: ${avatarUploadError.message}`);
          setIsLoading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(avatarPath);
        avatar_url = publicUrl;
      }
      formData.set('avatar_url', avatar_url);

      // 2. 자격증 증빙 파일 클라이언트 직접 업로드
      const updatedCertifications = [...certifications];
      for (const [indexStr, file] of Object.entries(certFiles)) {
        const index = Number(indexStr);
        const filePath = `${userId}/certs/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          alert(`자격증 증빙 파일 업로드 실패: ${uploadError.message}`);
          setIsLoading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        updatedCertifications[index].proofUrl = publicUrl;
      }

      formData.set('certifications', JSON.stringify(updatedCertifications));
      formData.set('military_service', JSON.stringify(militaryServices));
      formData.set('portfolios', JSON.stringify(portfolios));

      // 3. 서버 액션 호출 (텍스트 데이터 및 URL만 전달)
      const result = await action(formData);
      
      if (result && !result.success) {
        alert(`저장 실패: ${result.error}`);
      } else {
        alert('프로필이 성공적으로 저장되었습니다!');
      }
    } catch (error: any) {
      console.error(error);
      alert(`저장 중 예기치 못한 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 border p-6 rounded-lg bg-card">
      {/* 기본 정보 및 증명사진 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">기본 정보 및 증명사진</h2>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-32 h-40 border-2 border-dashed rounded-md flex items-center justify-center overflow-hidden bg-muted/20 relative shadow-inner">
              {avatarPreview ? (
                <img src={avatarPreview} alt="증명사진 미리보기" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground text-center p-2">증명사진<br/>(3.5 x 4.5)</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-xs w-36 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-secondary file:text-secondary-foreground cursor-pointer" />
            
            {profile?.avatar_url && !avatarFile && (
              <a href={profile.avatar_url} download target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline whitespace-nowrap bg-blue-50 px-2 py-1 rounded text-center w-36">
                증명사진 다운로드
              </a>
            )}
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <input type="text" name="full_name" defaultValue={profile?.full_name || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="홍길동" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">성별</label>
                <select 
                  name="gender" 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">선택 안 함</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">생년월일 (달력 선택)</label>
                <input type="date" name="birth_date" defaultValue={profile?.birth_date || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">양/음력</label>
                <select name="birth_type" defaultValue={profile?.birth_type || '양력'} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                  <option value="양력">양력</option>
                  <option value="음력">음력</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-sm font-medium">거주 지역</label>
          <input type="text" name="desired_location" defaultValue={profile?.desired_location || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="울산 / 부산" />
        </div>
      </div>

      {/* 학력 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">학력 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">대학교 / 기관</label>
            <input type="text" name="university" defaultValue={profile?.university || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="부경대학교" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">전공</label>
            <input type="text" name="major" defaultValue={profile?.major || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="고분자공학과" />
          </div>
        </div>
      </div>

      {/* 병역 사항 */}
      {gender === '남성' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">병역 사항</h2>
            <button type="button" onClick={addMilitary} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">항목 추가</button>
          </div>
          {militaryServices.map((item, index) => {
            const currentRanks = RANK_MAPPING[item.branch] || ['병장', '상병', '일병', '이병'];
            return (
              <div key={index} className="space-y-3 p-3 border rounded-md bg-background">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">군 구분</label>
                    <select 
                      value={item.branch || '육군'} 
                      onChange={(e) => {
                        const updated = [...militaryServices];
                        updated[index].branch = e.target.value;
                        updated[index].rank = RANK_MAPPING[e.target.value]?.[0] || '병장';
                        setMilitaryServices(updated);
                      }} 
                      className="w-full px-2 py-1 border rounded text-sm bg-background"
                    >
                      <option value="육군">육군</option>
                      <option value="해군">해군</option>
                      <option value="공군">공군</option>
                      <option value="해병대">해병대</option>
                      <option value="사회복무요원">사회복무요원</option>
                      <option value="상근예비역">상근예비역</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">계급 구분</label>
                    <select 
                      value={item.rank || currentRanks[0]} 
                      onChange={(e) => {
                        const updated = [...militaryServices];
                        updated[index].rank = e.target.value;
                        setMilitaryServices(updated);
                      }} 
                      className="w-full px-2 py-1 border rounded text-sm bg-background"
                    >
                      {currentRanks.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">전역 구분</label>
                    <select 
                      value={item.dischargeType || '만기전역'} 
                      onChange={(e) => {
                        const updated = [...militaryServices];
                        updated[index].dischargeType = e.target.value;
                        setMilitaryServices(updated);
                      }} 
                      className="w-full px-2 py-1 border rounded text-sm bg-background"
                    >
                      <option value="만기전역">만기전역</option>
                      <option value="소집해제">소집해제</option>
                      <option value="의병전역">의병전역</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="text-xs text-muted-foreground">복무 시작 (년/월)</label>
                    <input 
                      type="month" 
                      value={item.startMonth || ''} 
                      onChange={(e) => {
                        const updated = [...militaryServices];
                        updated[index].startMonth = e.target.value;
                        setMilitaryServices(updated);
                      }} 
                      className="w-full px-2 py-1 border rounded text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">복무 종료 (년/월)</label>
                    <input 
                      type="month" 
                      value={item.endMonth || ''} 
                      onChange={(e) => {
                        const updated = [...militaryServices];
                        updated[index].endMonth = e.target.value;
                        setMilitaryServices(updated);
                      }} 
                      className="w-full px-2 py-1 border rounded text-sm bg-background"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => removeMilitary(index)} className="text-red-500 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50">항목 삭제</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 보유 자격증 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">보유 자격증</h2>
          <button type="button" onClick={addCertification} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">자격증 추가</button>
        </div>
        {certifications.map((item, index) => (
          <div key={index} className="space-y-2 bg-muted/10 p-3 rounded-md border">
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="자격증명" value={item.name || ''} onChange={(e) => {
                const updated = [...certifications];
                updated[index].name = e.target.value;
                setCertifications(updated);
              }} className="px-2 py-1 border rounded text-sm bg-background" />
              <input type="text" placeholder="발급기관" value={item.issuer || ''} onChange={(e) => {
                const updated = [...certifications];
                updated[index].issuer = e.target.value;
                setCertifications(updated);
              }} className="px-2 py-1 border rounded text-sm bg-background" />
              <input type="month" placeholder="취득년월" value={item.date || ''} onChange={(e) => {
                const updated = [...certifications];
                updated[index].date = e.target.value;
                setCertifications(updated);
              }} className="px-2 py-1 border rounded text-sm bg-background" />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-2">
              <div className="flex items-center space-x-2 w-full">
                <label className="text-xs text-muted-foreground whitespace-nowrap">증빙 서류:</label>
                <input type="file" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setCertFiles({ ...certFiles, [index]: e.target.files[0] });
                  }
                }} className="text-xs w-full" />
                {item.proofUrl && !certFiles[index] && (
                  <a href={item.proofUrl} download target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline whitespace-nowrap bg-blue-50 px-2 py-1 rounded">첨부파일 다운로드</a>
                )}
              </div>
              <button type="button" onClick={() => removeCertification(index)} className="text-red-500 text-xs px-2 py-1 whitespace-nowrap">삭제</button>
            </div>
          </div>
        ))}
      </div>

      {/* 포트폴리오 및 링크 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">포트폴리오 및 링크</h2>
          <button type="button" onClick={addPortfolio} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">링크 추가</button>
        </div>
        {portfolios.map((item, index) => (
          <div key={index} className="space-y-2 bg-muted/10 p-3 rounded-md border">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">플랫폼 선택</label>
                <select 
                  value={item.platform || 'GitHub'} 
                  onChange={(e) => {
                    const updated = [...portfolios];
                    updated[index].platform = e.target.value;
                    setPortfolios(updated);
                  }} 
                  className="w-full px-2 py-1 border rounded text-sm bg-background"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="Notion">Notion</option>
                  <option value="Blog">Blog</option>
                  <option value="Velog">Velog</option>
                  <option value="Tistory">Tistory</option>
                  <option value="직접 입력">직접 입력</option>
                </select>
              </div>
              {item.platform === '직접 입력' && (
                <div>
                  <label className="text-xs text-muted-foreground">직접 입력 플랫폼명</label>
                  <input type="text" placeholder="플랫폼 이름 입력" value={item.customPlatform || ''} onChange={(e) => {
                    const updated = [...portfolios];
                    updated[index].customPlatform = e.target.value;
                    setPortfolios(updated);
                  }} className="w-full px-2 py-1 border rounded text-sm bg-background" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="제목 (예: 캡스톤 디자인 결과물)" value={item.title || ''} onChange={(e) => {
                const updated = [...portfolios];
                updated[index].title = e.target.value;
                setPortfolios(updated);
              }} className="px-2 py-1 border rounded text-sm bg-background" />
              <input type="url" placeholder="URL 링크" value={item.url || ''} onChange={(e) => {
                const updated = [...portfolios];
                updated[index].url = e.target.value;
                setPortfolios(updated);
              }} className="px-2 py-1 border rounded text-sm bg-background" />
            </div>
            <div>
              <textarea placeholder="간략한 설명 또는 내용 요약" rows={2} value={item.description || ''} onChange={(e) => {
                const updated = [...portfolios];
                updated[index].description = e.target.value;
                setPortfolios(updated);
              }} className="w-full px-2 py-1 border rounded text-sm bg-background" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => removePortfolio(index)} className="text-red-500 text-xs px-2 py-1">삭제</button>
            </div>
          </div>
        ))}
      </div>

      {/* 희망 직무 및 커리어 요약 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">희망 및 커리어 요약</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">희망 직무</label>
            <input type="text" name="desired_role" defaultValue={profile?.desired_role || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="R&D / 품질관리(QC)" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">희망 산업군</label>
            <input type="text" name="desired_industry" defaultValue={profile?.desired_industry || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="소재, 화학, 제조업" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">핵심 커리어 요약</label>
          <textarea name="career_summary" rows={4} defaultValue={profile?.career_summary || ''} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="주요 프로젝트 및 경력을 요약해주세요." />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
        {isLoading ? '저장 중...' : '프로필 정보 저장하기'}
      </button>
    </form>
  );
}