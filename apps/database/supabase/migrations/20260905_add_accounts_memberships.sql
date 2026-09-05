-- 1. Accounts 테이블 생성 (워크스페이스 및 팀 관리)
CREATE TABLE IF NOT EXISTS public.accounts (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE,
    primary_owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    is_personal boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Memberships 테이블 생성 (워크스페이스 멤버 권한 관리)
CREATE TABLE IF NOT EXISTS public.memberships (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT memberships_account_user_key UNIQUE (account_id, user_id)
);

-- 3. RLS 및 권한 부여
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.accounts TO authenticated, service_role, anon;
GRANT ALL ON TABLE public.memberships TO authenticated, service_role, anon;