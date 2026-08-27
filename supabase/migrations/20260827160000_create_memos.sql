-- 로컬스토리지 메모 구조를 Postgres로 이전
create type public.memo_category as enum (
  'personal',
  'work',
  'study',
  'idea',
  'other'
);

create table public.memos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category public.memo_category not null default 'personal',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memos_title_not_blank check (char_length(trim(title)) > 0),
  constraint memos_content_not_blank check (char_length(trim(content)) > 0)
);

create index memos_category_idx on public.memos (category);
create index memos_created_at_idx on public.memos (created_at desc);
create index memos_updated_at_idx on public.memos (updated_at desc);
create index memos_tags_gin_idx on public.memos using gin (tags);

create or replace function public.set_memos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger memos_set_updated_at
before update on public.memos
for each row
execute procedure public.set_memos_updated_at();

comment on table public.memos is '메모 앱 본문. 기존 LocalStorage memo-app-memos JSON을 대체한다.';

alter table public.memos enable row level security;

grant select, insert, update, delete on table public.memos to anon, authenticated;

create policy "anon can read memos"
on public.memos
for select
to anon, authenticated
using (true);

create policy "anon can insert memos"
on public.memos
for insert
to anon, authenticated
with check (true);

create policy "anon can update memos"
on public.memos
for update
to anon, authenticated
using (true)
with check (true);

create policy "anon can delete memos"
on public.memos
for delete
to anon, authenticated
using (true);
