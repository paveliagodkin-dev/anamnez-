-- =============================================
-- ANAMNEZ — Усиленная защита базы данных
-- Запусти в Supabase → SQL Editor
-- =============================================

-- =============================================
-- 1. ЗАЩИТА ПРОФИЛЕЙ
-- Пользователи не могут менять роль, очки,
-- статус верификации и счётчик случаев
-- =============================================

drop policy if exists "profiles_update" on public.profiles;

create policy "profiles_update" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- запрещаем самостоятельное повышение роли
    and role = (select role from public.profiles where id = auth.uid())
    -- запрещаем прямую накрутку очков
    and score = (select score from public.profiles where id = auth.uid())
    -- запрещаем изменение счётчика решённых случаев
    and cases_solved = (select cases_solved from public.profiles where id = auth.uid())
    -- запрещаем самоверификацию
    and is_verified = (select is_verified from public.profiles where id = auth.uid())
  );

-- =============================================
-- 2. RLS ДЛЯ ЛАЙКОВ ПОСТОВ
-- Только авторизованные пользователи
-- =============================================

alter table public.post_likes enable row level security;

create policy "post_likes_select" on public.post_likes
  for select using (true);

create policy "post_likes_insert" on public.post_likes
  for insert with check (auth.uid() = user_id);

create policy "post_likes_delete" on public.post_likes
  for delete using (auth.uid() = user_id);

-- =============================================
-- 3. RLS ДЛЯ ЛАЙКОВ КОММЕНТАРИЕВ
-- =============================================

alter table public.comment_likes enable row level security;

create policy "comment_likes_select" on public.comment_likes
  for select using (true);

create policy "comment_likes_insert" on public.comment_likes
  for insert with check (auth.uid() = user_id);

create policy "comment_likes_delete" on public.comment_likes
  for delete using (auth.uid() = user_id);

-- =============================================
-- 4. RLS ДЛЯ ВАРИАНТОВ ОТВЕТОВ
-- Варианты видны всем, но is_correct и explanation
-- скрыты до того как пользователь ответил
-- =============================================

alter table public.case_options enable row level security;

-- Все видят варианты (без правильного ответа — скрывается на уровне API)
create policy "case_options_select" on public.case_options
  for select using (true);

-- Только admin/moderator могут создавать варианты
create policy "case_options_insert" on public.case_options
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- =============================================
-- 5. RLS ДЛЯ УЧАСТНИКОВ ПЕРЕПИСКИ
-- Пользователь видит только свои переписки
-- =============================================

create policy "conversation_members_select" on public.conversation_members
  for select using (auth.uid() = user_id);

create policy "conversation_members_insert" on public.conversation_members
  for insert with check (auth.uid() = user_id);

-- =============================================
-- 6. ЗАЩИТА СЛУЧАЕВ
-- Создавать могут только врачи и модераторы
-- =============================================

drop policy if exists "cases_select" on public.cases;

create policy "cases_select" on public.cases
  for select using (is_published = true);

create policy "cases_insert" on public.cases
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('doctor', 'admin', 'moderator')
    )
  );

create policy "cases_update" on public.cases
  for update using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- =============================================
-- 7. ЗАЩИТА ОТ СПАМА В ПОСТАХ
-- Ограничение: не более 10 постов в час
-- =============================================

create or replace function check_post_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.posts
  where author_id = NEW.author_id
    and created_at > now() - interval '1 hour';

  if recent_count >= 10 then
    raise exception 'Слишком много постов. Подожди немного.';
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger post_rate_limit_trigger
  before insert on public.posts
  for each row execute procedure check_post_rate_limit();

-- =============================================
-- 8. ЗАЩИТА ОТ СПАМА В КОММЕНТАРИЯХ
-- Ограничение: не более 20 комментариев в час
-- =============================================

create or replace function check_comment_rate_limit()
returns trigger as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.comments
  where author_id = NEW.author_id
    and created_at > now() - interval '1 hour';

  if recent_count >= 20 then
    raise exception 'Слишком много комментариев. Подожди немного.';
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger comment_rate_limit_trigger
  before insert on public.comments
  for each row execute procedure check_comment_rate_limit();
