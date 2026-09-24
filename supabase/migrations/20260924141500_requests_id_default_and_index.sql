-- Keep IDs compatible with existing text IDs while allowing inserts without an explicit ID.
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

