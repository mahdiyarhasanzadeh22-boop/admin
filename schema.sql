create table if not exists public.requests (
  id text primary key not null default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  project_type text not null default '',
  budget_range text not null default '',
  proposed_price_toman text not null default '',
  preferred_contact text not null default '',
  description text not null default '',
  status text not null default 'جدید' check (status in ('جدید', 'در حال بررسی', 'تکمیل‌شده')),
  category text not null default 'عمومی',
  page_url text not null default ''
);

-- Migrate the first version of the table without deleting existing requests.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'createdAt')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'created_at') then
    alter table public.requests rename column "createdAt" to created_at;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'fullName')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'full_name') then
    alter table public.requests rename column "fullName" to full_name;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'projectType')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'project_type') then
    alter table public.requests rename column "projectType" to project_type;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'budgetRange')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'budget_range') then
    alter table public.requests rename column "budgetRange" to budget_range;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'proposedPriceToman')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'proposed_price_toman') then
    alter table public.requests rename column "proposedPriceToman" to proposed_price_toman;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'preferredContact')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'preferred_contact') then
    alter table public.requests rename column "preferredContact" to preferred_contact;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'pageUrl')
    and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'requests' and column_name = 'page_url') then
    alter table public.requests rename column "pageUrl" to page_url;
  end if;
end $$;

alter table public.requests enable row level security;

do $$
declare
  id_type text;
begin
  select data_type into id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'requests' and column_name = 'id';

  if id_type = 'text' then
    alter table public.requests alter column id set default gen_random_uuid()::text;
  elsif id_type = 'uuid' then
    alter table public.requests alter column id set default gen_random_uuid();
  end if;
end $$;

create index if not exists requests_created_at_idx on public.requests (created_at desc);

