-- Supabase Postgres şeması
create table if not exists public.storybooks (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  title text not null,
  pages jsonb not null,
  pdf_url text null,
  voice_urls jsonb null,
  created_at timestamptz default now()
);

create table if not exists public.colorings (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  title text not null,
  pdf_url text not null,
  page_count int not null default 1,
  created_at timestamptz default now()
);

-- İndeksler
create index if not exists storybooks_user_created_idx on public.storybooks (user_id, created_at desc);
create index if not exists colorings_user_created_idx on public.colorings (user_id, created_at desc);
