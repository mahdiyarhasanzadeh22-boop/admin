create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
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

alter table public.requests enable row level security;

create index if not exists requests_created_at_idx on public.requests (created_at desc);
