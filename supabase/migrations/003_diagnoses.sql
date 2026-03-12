-- =============================================
-- ANAMNEZ - Diagnoses (symptom checker)
-- =============================================

create table public.diagnoses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  description text not null,
  symptoms text[] not null,
  severity text check (severity in ('low', 'medium', 'high', 'emergency')) default 'medium',
  when_to_see_doctor text,
  created_at timestamptz default now()
);

alter table public.diagnoses enable row level security;
create policy "diagnoses_select" on public.diagnoses for select using (true);

-- Поиск диагнозов по симптому
create or replace function search_diagnoses_by_symptom(search_term text)
returns table(
  id uuid,
  name text,
  category text,
  description text,
  symptoms text[],
  severity text,
  when_to_see_doctor text
) as $$
  select d.id, d.name, d.category, d.description, d.symptoms, d.severity, d.when_to_see_doctor
  from public.diagnoses d
  where
    d.symptoms && array[lower(search_term)]
    or exists (
      select 1 from unnest(d.symptoms) as s
      where lower(s) like '%' || lower(search_term) || '%'
    )
    or lower(d.name) like '%' || lower(search_term) || '%'
  order by
    case d.severity
      when 'emergency' then 1
      when 'high' then 2
      when 'medium' then 3
      when 'low' then 4
    end,
    d.name;
$$ language sql stable security definer;
