// apps/web/src/app/(app-pages)/dashboard/ProfileForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileForm({ profile, action }: { profile: any; action: any }) {
  const [loading, setLoading] = useState(false);

  return (
    <form action={action} onSubmit={() => setLoading(true)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">이름 또는 닉네임</label>
        <Input 
          name="full_name" 
          defaultValue={profile?.full_name || ''} 
          className="mt-1" 
        />
      </div>
      <div>
        <label className="text-sm font-medium">소속 / 전공</label>
        <Input 
          name="major" 
          defaultValue={profile?.major || ''} 
          className="mt-1" 
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? '저장 중...' : '프로필 수정 저장'}
      </Button>
    </form>
  );
}