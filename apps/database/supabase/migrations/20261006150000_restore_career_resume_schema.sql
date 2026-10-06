-- Career domain: restore the resume data model expected by the application.
-- This migration is additive and does not modify or delete existing rows.

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '이력서',
  content text not null default '',
  company text,
  position text,
  linked_projects uuid[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  file_name text not null,
  storage_path text,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resume_files_file_size_nonnegative
    check (file_size is null or file_size >= 0)
);

create index if not exists resumes_user_id_idx
  on public.resumes(user_id);

create index if not exists resume_files_resume_id_idx
  on public.resume_files(resume_id);

alter table public.resumes enable row level security;
alter table public.resume_files enable row level security;