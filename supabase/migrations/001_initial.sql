-- =============================================
-- ANAMNEZ - Supabase Migration
-- Запусти в Supabase → SQL Editor
-- =============================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS (профили поверх auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  specialty text, -- кардиолог, невролог, студент и т.д.
  role text default 'user' check (role in ('user', 'doctor', 'moderator', 'admin')),
  is_verified boolean default false, -- верификация email
  verification_token text,
  score integer default 0, -- очки за правильные диагнозы
  cases_solved integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CASES (клинические случаи)
-- =============================================
create table public.cases (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  specialty text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
  description text not null,
  vitals jsonb, -- { "bp": "120/80", "hr": "90", "spo2": "98%" }
  history text,
  is_daily boolean default false,
  daily_date date,
  author_id uuid references public.profiles(id),
  solve_count integer default 0,
  correct_count integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- Варианты ответов
create table public.case_options (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  letter text not null, -- А, Б, В, Г
  text text not null,
  is_correct boolean default false,
  explanation text -- объяснение показывается после ответа
);

-- Ответы пользователей
create table public.case_answers (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  option_id uuid references public.case_options(id),
  is_correct boolean,
  answered_at timestamptz default now(),
  unique(case_id, user_id)
);

-- =============================================
-- FEED (лента постов)
-- =============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  section text default 'feed' check (section in ('feed', 'history', 'longevity', 'news')),
  likes_count integer default 0,
  comments_count integer default 0,
  is_pinned boolean default false,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Лайки
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- =============================================
-- COMMENTS
-- =============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id), -- для вложенных
  content text not null,
  likes_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.comment_likes (
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- =============================================
-- MESSAGES (личные сообщения)
-- =============================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now()
);

create table public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.cases enable row level security;
alter table public.case_answers enable row level security;

-- Profiles: все видят, только свой профиль редактируют
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Posts: все видят опубликованные, авторы управляют своими
create policy "posts_select" on public.posts for select using (is_published = true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

-- Comments: все видят, авторы управляют
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_update" on public.comments for update using (auth.uid() = author_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = author_id);

-- Messages: только участники переписки
create policy "messages_select" on public.messages for select
  using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
    )
  );
create policy "messages_insert" on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
    )
  );

-- Cases: все видят опубликованные
create policy "cases_select" on public.cases for select using (is_published = true);

-- Answers: только свои
create policy "answers_select" on public.case_answers for select using (auth.uid() = user_id);
create policy "answers_insert" on public.case_answers for insert with check (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Обновление счётчика комментариев
create or replace function update_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = comments_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comments_count_trigger
  after insert or delete on public.comments
  for each row execute procedure update_comments_count();

-- Обновление likes_count
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = likes_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger post_likes_count_trigger
  after insert or delete on public.post_likes
  for each row execute procedure update_post_likes_count();

-- Обновление score при правильном диагнозе
create or replace function update_user_score()
returns trigger as $$
declare
  points integer;
  diff text;
begin
  select difficulty into diff from public.cases where id = NEW.case_id;
  points := case diff
    when 'easy' then 10
    when 'medium' then 25
    when 'hard' then 50
    else 10
  end;
  if NEW.is_correct then
    update public.profiles
    set score = score + points, cases_solved = cases_solved + 1
    where id = NEW.user_id;
  else
    update public.profiles
    set cases_solved = cases_solved + 1
    where id = NEW.user_id;
  end if;
  -- Обновляем статистику случая
  update public.cases set solve_count = solve_count + 1 where id = NEW.case_id;
  if NEW.is_correct then
    update public.cases set correct_count = correct_count + 1 where id = NEW.case_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger user_score_trigger
  after insert on public.case_answers
  for each row execute procedure update_user_score();
