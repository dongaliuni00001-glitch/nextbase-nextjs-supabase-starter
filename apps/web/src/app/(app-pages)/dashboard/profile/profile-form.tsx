'use client';

import { useState } from 'react';

export function ProfileForm({ profile, action }: { profile: any; action: (formData: FormData) => Promise<void> }) {
  const [gender, setGender] = useState(profile?.gender || '');
  
  const [certifications, setCertifications] = useState<any[]>(profile?.certifications || []);
  const [militaryServices, setMilitaryServices] = useState<any[]>(profile?.military_service || []);
  const [portfolios, setPortfolios] = useState<any[]>(profile?.portfolios || []);

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', date: '', proof: '' }]);
  };
  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addMilitary = () => {
    setMilitaryServices([...militaryServices, { branch: '', dischargeType: '', period: '', rank: '' }]);
  };
  const removeMilitary = (index: number) => {
    setMilitaryServices(militaryServices.filter((_, i) => i !== index));
  };

  const addPortfolio = () => {
    setPortfolios([...portfolios, { title: '', url: '' }]);
  };
  const removePortfolio = (index: number) => {
    setPortfolios(portfolios.filter((_, i) => i !== index));
  };

  return (
    <form action={action} className="space-y-8 border p-6 rounded-lg bg-card">
      <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />
      <input type="hidden" name="military_service" value={JSON.stringify(militaryServices)} />
      <input type="hidden" name="portfolios" value={JSON.stringify(portfolios)} />

      {/* 기본 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">이름</label>
            <input type="text" name="full_name" defaultValue={profile?.full_name || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="홍길동" />
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
            <label className="text-sm font-medium">생년월일 (YYYY-MM-DD)</label>
            <input type="text" name="birth_date" defaultValue={profile?.birth_date || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="1999-05-12" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">양/음력</label>
            <select name="birth_type" defaultValue={profile?.birth_type || '양력'} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
              <option value="양력">양력</option>
              <option value="음력">음력</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">거주 지역</label>
          <input type="text" name="desired_location" defaultValue={profile?.desired_location || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="울산 / 부산" />
        </div>
      </div>

      {/* 학력 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">학력 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">대학교 / 기관</label>
            <input type="text" name="university" defaultValue={profile?.university || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="부경대학교" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">전공</label>
            <input type="text" name="major" defaultValue={profile?.major || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="고분자공학과" />
          </div>
        </div>
      </div>

      {/* 병역 사항 (남성인 경우에만 노출) */}
      {gender === '남성' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">병역 사항</h2>
            <button type="button" onClick={addMilitary} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">항목 추가</button>
          </div>
          {militaryServices.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 items-center">
              <input type="text" placeholder="군 구분 (예: 해군)" value={item.branch || ''} onChange={(e) => {
                const updated = [...militaryServices];
                updated[index].branch = e.target.value;
                setMilitaryServices(updated);
              }} className="px-2 py-1 border rounded text-sm" />
              <input type="text" placeholder="전역 구분 (예: 만기전역)" value={item.dischargeType || ''} onChange={(e) => {
                const updated = [...militaryServices];
                updated[index].dischargeType = e.target.value;
                setMilitaryServices(updated);
              }} className="px-2 py-1 border rounded text-sm" />
              <input type="text" placeholder="계급 및 복무기간" value={item.period || ''} onChange={(e) => {
                const updated = [...militaryServices];
                updated[index].period = e.target.value;
                setMilitaryServices(updated);
              }} className="px-2 py-1 border rounded text-sm" />
              <button type="button" onClick={() => removeMilitary(index)} className="text-red-500 text-sm">삭제</button>
            </div>
          ))}
        </div>
      )}

      {/* 보유 자격증 (동적 추가) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">보유 자격증</h2>
          <button type="button" onClick={addCertification} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">자격증 추가</button>
        </div>
        {certifications.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-center bg-muted/10 p-3 rounded-md">
            <input type="text" placeholder="자격증명" value={item.name || ''} onChange={(e) => {
              const updated = [...certifications];
              updated[index].name = e.target.value;
              setCertifications(updated);
            }} className="px-2 py-1 border rounded text-sm" />
            <input type="text" placeholder="발급기관" value={item.issuer || ''} onChange={(e) => {
              const updated = [...certifications];
              updated[index].issuer = e.target.value;
              setCertifications(updated);
            }} className="px-2 py-1 border rounded text-sm" />
            <input type="text" placeholder="취득일 (YYYY-MM)" value={item.date || ''} onChange={(e) => {
              const updated = [...certifications];
              updated[index].date = e.target.value;
              setCertifications(updated);
            }} className="px-2 py-1 border rounded text-sm" />
            <input type="text" placeholder="증빙 서류" value={item.proof || ''} onChange={(e) => {
              const updated = [...certifications];
              updated[index].proof = e.target.value;
              setCertifications(updated);
            }} className="px-2 py-1 border rounded text-sm" />
            <button type="button" onClick={() => removeCertification(index)} className="text-red-500 text-sm text-center">삭제</button>
          </div>
        ))}
      </div>

      {/* 포트폴리오 / 링크 URL (동적 추가) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">포트폴리오 및 링크</h2>
          <button type="button" onClick={addPortfolio} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md">링크 추가</button>
        </div>
        {portfolios.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 items-center">
            <input type="text" placeholder="플랫폼 / 제목 (예: GitHub)" value={item.title || ''} onChange={(e) => {
              const updated = [...portfolios];
              updated[index].title = e.target.value;
              setPortfolios(updated);
            }} className="px-2 py-1 border rounded text-sm" />
            <input type="url" placeholder="URL 링크" value={item.url || ''} onChange={(e) => {
              const updated = [...portfolios];
              updated[index].url = e.target.value;
              setPortfolios(updated);
            }} className="px-2 py-1 border rounded text-sm col-span-1" />
            <button type="button" onClick={() => removePortfolio(index)} className="text-red-500 text-sm">삭제</button>
          </div>
        ))}
      </div>

      {/* 희망 직무 및 커리어 요약 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">희망 및 커리어 요약</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">희망 직무</label>
            <input type="text" name="desired_role" defaultValue={profile?.desired_role || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="R&D / 품질관리(QC)" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">희망 산업군</label>
            <input type="text" name="desired_industry" defaultValue={profile?.desired_industry || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="소재, 화학, 제조업" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">핵심 커리어 요약</label>
          <textarea name="career_summary" rows={4} defaultValue={profile?.career_summary || ''} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="주요 프로젝트 및 경력을 요약해주세요." />
        </div>
      </div>

      <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
        프로필 정보 저장하기
      </button>
    </form>
  );
}