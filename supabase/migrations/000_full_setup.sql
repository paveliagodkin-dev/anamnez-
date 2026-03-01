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
-- =============================================
-- 10 клинических случаев
-- Запусти в Supabase → SQL Editor
-- =============================================

-- 1. КАРДИОЛОГИЯ — Острый инфаркт миокарда с подъёмом ST
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Боль за грудиной с иррадиацией в левую руку',
    'im-s-podjomom-st',
    'Кардиология',
    'hard',
    'Мужчина 58 лет вызвал скорую в 3:20 ночи. Жалобы: давящая боль за грудиной, отдающая в левую руку и нижнюю челюсть, нарастающая в течение 40 минут, не купируемая нитроглицерином. Кожа бледная, влажная. АД 100/70 мм рт. ст., ЧСС 98 уд/мин, ЧДД 22 в мин, SpO₂ 94%. На ЭКГ: подъём сегмента ST в отведениях II, III, aVF более 2 мм, реципрокная депрессия в I, aVL.',
    'Артериальная гипертензия 15 лет, курение 30 лет (1 пачка/день), сахарный диабет 2 типа. Принимает метформин, амлодипин.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Нестабильная стенокардия', false, 'При нестабильной стенокардии нет подъёма ST и нет некроза миокарда. Боль обычно купируется нитроглицерином.' FROM c UNION ALL
SELECT id, 'Б', 'Острый инфаркт миокарда нижней стенки (ИМпST)', true, 'Подъём ST в II, III, aVF указывает на окклюзию правой коронарной артерии — нижний ИМ. Показана немедленная реперфузия (ЧКВ в течение 90 мин или тромболизис).' FROM c UNION ALL
SELECT id, 'В', 'ТЭЛА', false, 'ТЭЛА может вызвать боль в грудной клетке и изменения ЭКГ (S1Q3T3), но не подъём ST в нижних отведениях с реципрокными изменениями.' FROM c UNION ALL
SELECT id, 'Г', 'Перикардит', false, 'Перикардит даёт диффузный подъём ST без реципрокной депрессии, боль усиливается при вдохе и в положении лёжа.' FROM c;

-- 2. НЕВРОЛОГИЯ — Ишемический инсульт
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Внезапная слабость в правой руке и нарушение речи',
    'ishemicheskij-insult',
    'Неврология',
    'hard',
    'Женщина 67 лет доставлена бригадой СМП. Муж сообщает: 1,5 часа назад внезапно «перекосило лицо», стала невнятно говорить, повисла правая рука. Сознание сохранено, контакт затруднён. Неврологически: центральный парез лицевого нерва справа, моторная афазия, правосторонний гемипарез (сила 2/5), девиация взора влево. АД 175/100, ЧСС 88, фибрилляция предсердий на ЭКГ. КТ головного мозга без контраста: патологии не выявлено.',
    'Фибрилляция предсердий (не принимает антикоагулянты), АГ, гиперхолестеринемия.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Геморрагический инсульт', false, 'КТ без патологии исключает внутримозговое кровоизлияние. При геморрагическом инсульте на КТ немедленно видна гиперденсная зона.' FROM c UNION ALL
SELECT id, 'Б', 'Транзиторная ишемическая атака (ТИА)', false, 'При ТИА симптомы полностью регрессируют в течение 24 ч. Здесь прошло 1,5 часа, симптомы сохраняются — это инсульт.' FROM c UNION ALL
SELECT id, 'В', 'Ишемический инсульт в бассейне СМА слева, показан тромболизис', true, 'Окно тромболизиса 4,5 ч. КТ исключила кровь. Очаговая симптоматика, ФП как источник эмболии. Необходимо ввести альтеплазу 0,9 мг/кг (10% болюс, остальное за 60 мин).' FROM c UNION ALL
SELECT id, 'Г', 'Опухоль головного мозга', false, 'Опухоль даёт постепенно нарастающий дефицит, а не внезапное начало за секунды. На КТ с контрастом была бы видна масса.' FROM c;

-- 3. АКУШЕРСТВО — Преэклампсия тяжёлой степени
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Головная боль и отёки у беременной 34 недели',
    'preeklampsiya-tyazholaya',
    'Акушерство и гинекология',
    'hard',
    'Первобеременная 28 лет, 34 недели. Жалобы на сильную головную боль, «мелькание мушек» перед глазами, боль в эпигастрии. Отёки лица, кистей, нижних конечностей. АД 165/110 мм рт. ст. (до беременности 110/70). Протеинурия 3+ (3,5 г/сут). Рефлексы оживлены. Анализ крови: тромбоциты 92×10⁹/л, АЛТ 78 Ед/л, АСТ 95 Ед/л, ЛДГ 650 Ед/л.',
    'Первая беременность. Наблюдалась регулярно. До 28 недель АД в норме.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Гестационная артериальная гипертензия', false, 'Гестационная АГ — это АД ≥140/90 без протеинурии и органных нарушений. Здесь есть тяжёлая протеинурия, тромбоцитопения и нарушение функции печени — это HELLP-синдром в рамках тяжёлой преэклампсии.' FROM c UNION ALL
SELECT id, 'Б', 'Тяжёлая преэклампсия / HELLP-синдром, показано родоразрешение', true, 'Тромбоциты <100×10⁹, повышение трансаминаз, ЛДГ — классический HELLP. При ≥34 нед показано немедленное родоразрешение. Начать магния сульфат для профилактики эклампсии, гипотензивная терапия (нифедипин, лабеталол).' FROM c UNION ALL
SELECT id, 'Г', 'Острый жировой гепатоз беременных', false, 'ОЖГБ даёт гипогликемию, коагулопатию, желтуху. Здесь картина укладывается в HELLP на фоне преэклампсии.' FROM c UNION ALL
SELECT id, 'В', 'Хронический гломерулонефрит в обострении', false, 'Хронический ГН — протеинурия и АГ присутствовали бы до беременности. До 28 нед АД было нормальным.' FROM c;

-- 4. ПУЛЬМОНОЛОГИЯ — Спонтанный пневмоторакс
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Внезапная боль в груди и одышка у молодого мужчины',
    'spontannyj-pnevmotoraks',
    'Пульмонология',
    'medium',
    'Мужчина 22 лет, астеническое телосложение (рост 192 см, вес 68 кг). Внезапно во время занятия в спортзале возникла острая боль в левой половине грудной клетки и нарастающая одышка. АД 125/75, ЧСС 110, ЧДД 24, SpO₂ 93%. При осмотре: левая половина грудной клетки отстаёт в дыхании, перкуторно — тимпанит слева, дыхание слева резко ослаблено, трахея не смещена. Рентген ОГК: коллапс левого лёгкого на 40%, тонкая линия висцерального листка плевры.',
    'Курение лёгких сигарет с 18 лет. Перенёс эпизод подобной боли год назад (не обследовался).',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Плеврит', false, 'Плеврит даёт притупление перкуторного звука (жидкость), а не тимпанит. При плеврите нет коллапса лёгкого на рентгене.' FROM c UNION ALL
SELECT id, 'Б', 'ТЭЛА', false, 'ТЭЛА может давать боль и одышку, но рентген обычно в норме или с очагом Hampton hump. Тимпанит и видимый коллапс лёгкого исключают ТЭЛА.' FROM c UNION ALL
SELECT id, 'В', 'Первичный спонтанный пневмоторакс, показано дренирование плевральной полости', true, 'Молодой астеник, тимпанит, ослабленное дыхание, коллапс 40% — классический первичный спонтанный пневмоторакс (разрыв буллы). При коллапсе >20% показано дренирование (трубка 16–20 Fr) или аспирация. При рецидиве — торакоскопическая плеврэктомия.' FROM c UNION ALL
SELECT id, 'Г', 'Острый инфаркт миокарда', false, 'ИМ в 22 года без факторов риска крайне редок. Рентгенологическая картина коллапса лёгкого и локальный тимпанит указывают на пневмоторакс.' FROM c;

-- 5. ГАСТРОЭНТЕРОЛОГИЯ — Острый панкреатит
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Опоясывающая боль в животе после праздничного застолья',
    'ostryj-pankreatit',
    'Гастроэнтерология',
    'medium',
    'Мужчина 45 лет. Через 4 часа после обильного приёма алкоголя и жирной пищи появились интенсивные боли в эпигастрии с иррадиацией в спину («опоясывающие»), многократная рвота, не приносящая облегчения. Живот напряжён в эпигастрии, болезненный, симптом Воскресенского положительный. Температура 37,8°С. Лейкоциты 14,2×10⁹/л. Амилаза крови 1850 Ед/л (норма до 100), липаза 960 Ед/л (норма до 60). УЗИ: отёк поджелудочной железы, нечёткость контуров, жидкость в сальниковой сумке.',
    'Употребляет алкоголь эпизодически, избыточный вес. Желчнокаменная болезнь — конкремент 8 мм.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Язвенная болезнь желудка с перфорацией', false, 'При перфорации — «кинжальная» боль, доскообразный живот, свободный газ под куполом диафрагмы на рентгене. Амилаза при перфорации умеренно повышена, не в 18 раз.' FROM c UNION ALL
SELECT id, 'Б', 'Острый панкреатит, консервативная терапия: голод, инфузия, анальгезия', true, 'Опоясывающая боль + амилаза/липаза >3 норм + УЗИ-картина = острый панкреатит (критерии Атланты). Лечение: голод 24–48 ч, агрессивная инфузия (Рингер-лактат 250–500 мл/ч), анальгезия (кетопрофен, при необходимости опиоиды), контроль осложнений.' FROM c UNION ALL
SELECT id, 'В', 'Острый холецистит', false, 'Холецистит даёт боль в правом подреберье, симптом Мерфи, лихорадку. Опоясывающего характера нет. Амилаза столь высоко не повышается.' FROM c UNION ALL
SELECT id, 'Г', 'Мезентериальный тромбоз', false, 'Мезентериальный тромбоз — «боль без живота» (несоответствие боли и физикальных данных), быстрое ухудшение, ишемия кишечника. Амилаза не повышается до таких значений.' FROM c;

-- 6. ФЕЛЬДШЕР/СМП — Анафилаксия
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Коллапс после укуса осы на даче',
    'anafilaksiya-ukus-osy',
    'Фельдшер/СМП',
    'hard',
    'Вызов на дачный участок. Женщина 34 лет, через 5 минут после укуса осы: генерализованная крапивница, отёк губ и языка, охриплость голоса, свистящее дыхание, АД 70/40 мм рт. ст., ЧСС 128 уд/мин, SpO₂ 88%, потеря сознания на 10 секунд. Кожа: гиперемия, уртикарии по всему телу.',
    'Аллергия на укусы пчёл в анамнезе (местная реакция), эпинефрин-авторучки нет.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Ввести антигистаминный препарат внутривенно', false, 'Антигистаминные при анафилаксии — лишь вспомогательная терапия. Они не устраняют бронхоспазм и не поднимают давление. Первый и главный препарат — адреналин!' FROM c UNION ALL
SELECT id, 'Б', 'Ввести глюкокортикоиды (дексаметазон 8 мг)', false, 'ГКС при анафилаксии действуют через 4–6 ч и не влияют на острую фазу. Дексаметазон — вспомогательная терапия, но не первый шаг.' FROM c UNION ALL
SELECT id, 'В', 'Немедленно ввести эпинефрин (адреналин) 0,3–0,5 мг в/м в наружную поверхность бедра', true, 'Адреналин — препарат выбора №1 при анафилаксии. В/м в бедро (не п/к!) 0,3 мг (0,3 мл р-ра 1:1000). При отсутствии эффекта через 5–15 мин — повторить. Далее: положить лёжа с поднятыми ногами, кислород, инфузия, при необходимости — интубация.' FROM c UNION ALL
SELECT id, 'Г', 'Дать под язык нитроглицерин для снятия бронхоспазма', false, 'Нитроглицерин — вазодилататор, снизит и без того критически низкое АД. Категорически противопоказан при анафилаксии.' FROM c;

-- 7. ЭНДОКРИНОЛОГИЯ — Диабетический кетоацидоз
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Запах ацетона изо рта и нарушение сознания у подростка',
    'diabeticheskij-ketoacidoz',
    'Эндокринология',
    'hard',
    'Юноша 16 лет доставлен родителями. В течение 3 дней нарастали: полидипсия (пил до 5 л/сут), полиурия, слабость, тошнота, рвота, боли в животе. Сегодня — заторможенность. Осмотр: кожа сухая, тургор снижен, язык сухой, запах ацетона изо рта. Дыхание Куссмауля. АД 95/60, ЧСС 118, ЧДД 28. Глюкоза крови (глюкометр) 28,4 ммоль/л. Кетоны мочи 4+. КЩС: pH 7,12, BE −20, бикарбонат 9 ммоль/л.',
    'Впервые выявленный СД 1 типа (не обследовался). Инсулин не получал.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Гипогликемическая кома — ввести 40% глюкозу', false, 'Глюкоза 28,4 ммоль/л — выраженная гипергликемия, не гипогликемия. Введение глюкозы приведёт к катастрофическому ухудшению.' FROM c UNION ALL
SELECT id, 'Б', 'Диабетический кетоацидоз: инсулин, инфузия, коррекция электролитов', true, 'ДКА: гипергликемия + кетоны + метаболический ацидоз (pH <7,3, бикарбонат <15). Протокол: 1) Инфузия NaCl 0,9% 1 л/ч первые 2 ч. 2) Инсулин короткий в/в инфузия 0,1 ЕД/кг/ч. 3) При глюкозе <14 — добавить глюкозу 5%. 4) KCl под контролем К+ (опасность гипокалиемии!).' FROM c UNION ALL
SELECT id, 'В', 'Гиперосмолярная кома — инфузия гипотонического раствора', false, 'Гиперосмолярная кома — у пожилых с СД 2 типа, без кетоза, глюкоза обычно >33 ммоль/л. Здесь подросток с впервые выявленным СД 1 типа и выраженным кетозом.' FROM c UNION ALL
SELECT id, 'Г', 'Острое отравление — промыть желудок и ввести антидот', false, 'Запах ацетона — это эндогенные кетоны (бета-оксибутират, ацетоацетат), а не экзогенное отравление. Промывание желудка и антидоты здесь бессмысленны и опасны.' FROM c;

-- 8. ХИРУРГИЯ — Острый аппендицит
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Боль в правой подвздошной области у студентки',
    'ostryj-appenditsit',
    'Хирургия',
    'medium',
    'Девушка 19 лет. 12 часов назад появились боли в эпигастрии, затем сместились в правую подвздошную область, усиливаются при движении. Однократная рвота, отсутствие аппетита. Температура 37,6°С. Язык суховат. Живот: болезненность в правой подвздошной области, симптом Щёткина–Блюмберга положительный в точке Мак-Бернея, симптом Ровзинга положительный, симптом Ситковского положительный. Лейкоциты 13,8×10⁹/л, палочкоядерных 11%. УЗИ: аппендикс 9 мм в диаметре, несжимаемый.',
    'Последняя менструация 2 недели назад. Тест на беременность отрицательный.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Правосторонняя почечная колика, спазмолитики и наблюдение', false, 'При почечной колике боль иррадиирует в пах, по ходу мочеточника, нет перитонеальных симптомов. Симптом Пастернацкого положительный. УЗИ: расширение ЧЛС.' FROM c UNION ALL
SELECT id, 'Б', 'Острый аппендицит, показана экстренная аппендэктомия', true, 'Миграция боли из эпигастрия → ПИО, симптомы раздражения брюшины, УЗИ-аппендикс >6 мм несжимаемый, лейкоцитоз со сдвигом влево = острый аппендицит. Показана экстренная операция (лапароскопическая или открытая аппендэктомия).' FROM c UNION ALL
SELECT id, 'В', 'Апоплексия яичника, консервативное лечение', false, 'Апоплексия яичника — острая боль внизу живота в середине цикла или после физ. нагрузки. Здесь характерная миграция боли и аппендикулярные симптомы.' FROM c UNION ALL
SELECT id, 'Г', 'Кишечная инфекция, антибиотики перорально', false, 'При кишечной инфекции — диарея, разлитые боли, нет локальных перитонеальных знаков. Локальный симптом Щёткина–Блюмберга требует хирургической консультации.' FROM c;

-- 9. ПЕДИАТРИЯ — Эпиглоттит
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'Ребёнок сидит с открытым ртом и не может глотать',
    'epiglottit-u-rebyonka',
    'Педиатрия',
    'hard',
    'Мальчик 4 лет. Родители вызвали скорую: 3 часа назад внезапно поднялась температура 39,8°С, затем ребёнок перестал глотать, начал течь слюна, голос стал «глухим». Ребёнок сидит в вынужденной позе — наклонившись вперёд, опираясь на руки, рот открыт, шея вытянута («поза треножника»). Инспираторный стридор. ЧДД 36, SpO₂ 94%, ЧСС 148. Кожа бледная, тревожный вид.',
    'Прививочный анамнез: не вакцинирован против Hib (родители отказались). Заболел остро.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Вирусный круп — ингаляция адреналина, дексаметазон', false, 'Круп (ларинготрахеит) — «лающий» кашель, постепенное начало, обычно у детей 6 мес–3 года. Эпиглоттит — внезапное начало, дисфагия, слюнотечение, поза треножника, нет лающего кашля.' FROM c UNION ALL
SELECT id, 'Б', 'Инородное тело дыхательных путей — приём Геймлиха', false, 'При аспирации инородного тела — внезапный эпизод поперхивания, нет лихорадки. Здесь постепенное нарастание симптомов с температурой.' FROM c UNION ALL
SELECT id, 'В', 'Эпиглоттит: не осматривать горло, вызвать анестезиолога, обеспечить проходимость дыхательных путей', true, 'Эпиглоттит (чаще Haemophilus influenzae тип b у невакцинированных) — угроза асфиксии. НЕЛЬЗЯ осматривать горло шпателем — спазм и остановка дыхания! Тактика: не тревожить ребёнка, кислород, вызов ЛОР + анестезиолог, интубация в операционной, цефтриаксон в/в.' FROM c UNION ALL
SELECT id, 'Г', 'Заглоточный абсцесс — вскрытие в приёмном покое', false, 'Заглоточный абсцесс даёт боль при повороте головы, пастозность шеи. При нём менее выражена острая дыхательная недостаточность. Вскрытие без защиты дыхательных путей при эпиглоттите смертельно опасно.' FROM c;

-- 10. КАРДИОЛОГИЯ — Гипертонический криз
WITH c AS (
  INSERT INTO public.cases (title, slug, specialty, difficulty, description, history, is_published)
  VALUES (
    'АД 200/120 и головная боль у гипертоника',
    'gipertonicheskij-kriz',
    'Кардиология',
    'medium',
    'Мужчина 52 лет, вызвал скорую из-за нестерпимой головной боли в затылке, «пульсирующей», тошноты. Лечится от АГ, но последние 3 дня не принимал таблетки («закончились»). АД правая рука 205/125, левая 200/120. ЧСС 92. Неврологически: без очаговой симптоматики, лёгкая дезориентация. Глазное дно (осмотр не проводился). Анализ мочи: белок 0,033 г/л. ЭКГ: гипертрофия ЛЖ, без ишемии. Почки (со слов): функция ранее не нарушена.',
    'АГ 3 ст. 10 лет, принимает эналаприл 10 мг + амлодипин 5 мг. Курит. ИМТ 31.',
    true
  )
  RETURNING id
)
INSERT INTO public.case_options (case_id, letter, text, is_correct, explanation)
SELECT id, 'А', 'Дать нитроглицерин сублингвально и уложить', false, 'Нитроглицерин при гипертоническом кризе без признаков ОКС не рекомендован. Резкое снижение АД опасно — ишемия мозга, почек. При кризе снижать АД постепенно: на 25% за первые 2 часа.' FROM c UNION ALL
SELECT id, 'Б', 'Неосложнённый гипертонический криз: каптоприл 25 мг сублингвально или перорально, наблюдение', true, 'Нет признаков поражения органов-мишеней (нет неврологического дефицита, нет ОКС, нет ОПП). Неосложнённый криз: каптоприл 25 мг п/я, или нифедипин 10 мг (осторожно!). Цель — снизить АД на 25% за 2–6 ч. Возобновить базисную терапию.' FROM c UNION ALL
SELECT id, 'В', 'Осложнённый криз (гипертоническая энцефалопатия): нитропруссид натрия в/в', false, 'Нитропруссид — при жизнеугрожающих осложнениях (расслоение аорты, острая ЛЖ-недостаточность, гипертоническая энцефалопатия с чёткими признаками). Лёгкая дезориентация без очаговой симптоматики не является показанием для агрессивной в/в терапии.' FROM c UNION ALL
SELECT id, 'Г', 'Срочная госпитализация в реанимацию, клонидин в/в', false, 'Клонидин в/в — устаревшая тактика, вызывает непредсказуемое снижение АД. Госпитализация в реанимацию нужна при осложнённом кризе, здесь — неосложнённый.' FROM c;
