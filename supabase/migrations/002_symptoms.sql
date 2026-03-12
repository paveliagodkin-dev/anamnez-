-- =============================================
-- ANAMNEZ - Symptoms Search Migration
-- Запусти в Supabase → SQL Editor
-- =============================================

-- Добавляем массив симптомов к кейсам
alter table public.cases add column if not exists symptoms text[] default '{}';

-- Функция поиска кейсов по симптомам
create or replace function search_cases_by_symptoms(search_terms text[])
returns table(
  id uuid,
  title text,
  slug text,
  specialty text,
  difficulty text,
  description text,
  history text,
  vitals jsonb,
  symptoms text[],
  solve_count integer,
  correct_count integer,
  is_daily boolean,
  created_at timestamptz
) as $$
  select
    c.id, c.title, c.slug, c.specialty, c.difficulty,
    c.description, c.history, c.vitals, c.symptoms,
    c.solve_count, c.correct_count, c.is_daily, c.created_at
  from public.cases c
  where c.is_published = true
  and (
    -- Точное совпадение симптома из массива
    c.symptoms && search_terms
    or
    -- Поиск по тексту (title, description, history)
    exists (
      select 1 from unnest(search_terms) as t
      where
        lower(c.title) like '%' || lower(t) || '%'
        or lower(c.description) like '%' || lower(t) || '%'
        or lower(coalesce(c.history, '')) like '%' || lower(t) || '%'
    )
  )
  order by c.created_at desc
  limit 20;
$$ language sql stable security definer;
