-- ════════════════════════════════════════════════════════════════════
--  전주 부모님 팔순 식당 투표 — Supabase 스키마 / RLS / RPC
--
--  적용 순서:
--    1) 이 schema.sql 을 Supabase SQL Editor 에서 실행
--    2) seed.sql 실행 (행사 + 식당 초기 데이터)   ← npm run gen:seed 로 생성
--    3) README / supabase/README.md 대로 행사 코드와 관리자 계정 설정
--
--  보안 원칙:
--    - 모든 테이블 RLS 활성화
--    - 익명 사용자는 어떤 테이블도 직접 SELECT / INSERT / UPDATE / DELETE 불가
--    - 공개 정보는 get_event_public / get_public_results RPC 로만 제공
--    - 투표 제출은 submit_ballot (security definer) RPC 로만
--    - 관리자 기능은 auth.uid() 가 admins 에 있는지 검사
--    - 개인 확인번호(PIN) 원문은 저장하지 않고 voter_key 해시로만 사용
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── 테이블 ──────────────────────────────────────────────────────────

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  event_date timestamptz,
  vote_deadline timestamptz,
  expected_guests int not null default 16,
  budget_per_person int not null default 100000,
  max_choices int not null default 3,
  is_open boolean not null default true,
  show_live_results boolean not null default false,
  -- 공유 행사 코드의 bcrypt 해시. 원문 코드는 저장하지 않는다.
  access_code_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category text not null,
  name text not null,
  summary text,
  description text,
  address text,
  phone text,
  price_min int,
  price_max int,
  recommended_menu text,
  capacity_note text,
  fit jsonb not null default '{}'::jsonb,
  pros jsonb not null default '[]'::jsonb,
  check_points jsonb not null default '[]'::jsonb,
  naver_map_url text,
  kakao_map_url text,
  source_url text,
  last_verified date,
  verification_note text,
  image_path text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_restaurants_event on public.restaurants(event_id);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  display_name text not null,
  is_active boolean not null default true,
  display_order int not null default 0
);
create index if not exists idx_family_event on public.family_members(event_id);

create table if not exists public.ballots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  voter_name text not null,
  -- 정규화이름 + PIN4자리 + event_id 를 SHA-256 한 값. 원문 PIN 저장 안 함.
  voter_key text not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, voter_key)
);
create index if not exists idx_ballots_event on public.ballots(event_id);

create table if not exists public.ballot_choices (
  id uuid primary key default gen_random_uuid(),
  ballot_id uuid not null references public.ballots(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id),
  rank int not null check (rank between 1 and 3),
  unique (ballot_id, rank),
  unique (ballot_id, restaurant_id)
);
create index if not exists idx_choices_ballot on public.ballot_choices(ballot_id);
create index if not exists idx_choices_restaurant on public.ballot_choices(restaurant_id);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── RLS 활성화 (기본 차단) ──────────────────────────────────────────
-- 정책을 따로 만들지 않으면 anon/authenticated 모두 접근 불가.
-- SECURITY DEFINER RPC 만 데이터에 접근한다.

alter table public.events           enable row level security;
alter table public.restaurants      enable row level security;
alter table public.family_members   enable row level security;
alter table public.ballots          enable row level security;
alter table public.ballot_choices   enable row level security;
alter table public.admins           enable row level security;

-- (정책 없음 = 전면 차단) 관리자 편의를 위한 최소 정책만 아래에 둔다.

-- 관리자는 자기 자신이 admins 에 있는지 확인할 수 있어야 로그인 후 판정이 된다.
drop policy if exists "admin can read own admin row" on public.admins;
create policy "admin can read own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- ── 헬퍼 함수 ───────────────────────────────────────────────────────

-- 현재 로그인 사용자가 관리자인가
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 이름 정규화: NFC + 모든 공백 제거 + 소문자
-- ⚠ 클라이언트 src/lib/validation.ts 의 normalizeName 과 반드시 동일 규칙
create or replace function public.normalize_name(raw text)
returns text
language sql immutable
as $$
  select lower(regexp_replace(normalize(coalesce(raw, ''), NFC), '\s', '', 'g'));
$$;

-- voter_key = sha256( 정규화이름 + PIN + event_id )
-- ⚠ digest()는 pgcrypto(=extensions 스키마) 함수이므로 search_path에 extensions 포함
create or replace function public.make_voter_key(p_name text, p_pin text, p_event uuid)
returns text
language sql immutable set search_path = public, extensions
as $$
  select encode(
    digest(public.normalize_name(p_name) || '|' || p_pin || '|' || p_event::text, 'sha256'),
    'hex'
  );
$$;

-- ── 공개 RPC ────────────────────────────────────────────────────────

-- 행사 공개 정보. access_code_hash / id 는 절대 반환하지 않는다.
-- events 테이블에 익명 SELECT 를 열면 해시가 노출되므로 이 RPC 로만 제공한다.
create or replace function public.get_event_public(p_slug text)
returns table (
  slug text,
  title text,
  subtitle text,
  event_date timestamptz,
  vote_deadline timestamptz,
  expected_guests int,
  budget_per_person int,
  max_choices int,
  is_open boolean,
  show_live_results boolean
)
language sql stable security definer set search_path = public
as $$
  select slug, title, subtitle, event_date, vote_deadline,
         expected_guests, budget_per_person, max_choices,
         is_open, show_live_results
  from public.events
  where slug = p_slug;
$$;

-- 활성 식당 목록 (공개). is_active=false 는 제외.
create or replace function public.get_restaurants(p_slug text)
returns setof public.restaurants
language sql stable security definer set search_path = public
as $$
  select r.*
  from public.restaurants r
  join public.events e on e.id = r.event_id
  where e.slug = p_slug and r.is_active = true
  order by r.display_order asc, r.created_at asc;
$$;

-- 참여 인원 수만 반환
create or replace function public.get_participation_count(p_slug text)
returns int
language sql stable security definer set search_path = public
as $$
  select count(*)::int
  from public.ballots b
  join public.events e on e.id = b.event_id
  where e.slug = p_slug;
$$;

-- 공개 결과 집계. 마감되었거나 show_live_results=true 일 때만 반환.
-- voter_name / comment 원문은 노출하지 않는다.
create or replace function public.get_public_results(p_slug text)
returns table (
  restaurant_id uuid,
  name text,
  category text,
  total_score bigint,
  first_choice_count bigint,
  selected_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_event public.events;
  v_can_show boolean;
begin
  select * into v_event from public.events where slug = p_slug;
  if v_event.id is null then
    raise exception 'event_not_found';
  end if;

  v_can_show := v_event.show_live_results
    or (v_event.is_open = false)
    or (v_event.vote_deadline is not null and now() > v_event.vote_deadline);

  if not v_can_show then
    -- 아직 공개 조건이 아니면 빈 결과 (참여 수는 별도 RPC로 안내)
    return;
  end if;

  return query
    select r.id, r.name, r.category,
           coalesce(sum(case bc.rank when 1 then 3 when 2 then 2 when 3 then 1 else 0 end), 0) as total_score,
           coalesce(sum(case when bc.rank = 1 then 1 else 0 end), 0) as first_choice_count,
           coalesce(count(bc.id), 0) as selected_count
    from public.restaurants r
    left join public.ballot_choices bc on bc.restaurant_id = r.id
    left join public.ballots b on b.id = bc.ballot_id
    where r.event_id = v_event.id and r.is_active = true
    group by r.id, r.name, r.category;
end;
$$;

-- 공개 가능한 의견 목록 (이름 없이 코멘트 텍스트만)
create or replace function public.get_public_comments(p_slug text)
returns setof text
language plpgsql stable security definer set search_path = public
as $$
declare
  v_event public.events;
  v_can_show boolean;
begin
  select * into v_event from public.events where slug = p_slug;
  if v_event.id is null then return; end if;

  v_can_show := v_event.show_live_results
    or (v_event.is_open = false)
    or (v_event.vote_deadline is not null and now() > v_event.vote_deadline);
  if not v_can_show then return; end if;

  return query
    select b.comment
    from public.ballots b
    where b.event_id = v_event.id
      and b.comment is not null and length(trim(b.comment)) > 0
    order by b.updated_at desc;
end;
$$;

-- ── 투표 조회/제출 RPC (본인만) ─────────────────────────────────────

-- 이름+PIN 으로 본인이 이미 낸 투표를 불러온다 (수정 화면용).
-- voter_key 를 알아야만 조회되므로 타인 투표는 볼 수 없다.
create or replace function public.get_my_ballot(p_slug text, p_name text, p_pin text)
returns table (
  comment text,
  restaurant_id uuid,
  rank int
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_event public.events;
  v_key text;
  v_ballot uuid;
begin
  select * into v_event from public.events where slug = p_slug;
  if v_event.id is null then raise exception 'event_not_found'; end if;

  v_key := public.make_voter_key(p_name, p_pin, v_event.id);
  select id into v_ballot from public.ballots
    where event_id = v_event.id and voter_key = v_key;
  if v_ballot is null then return; end if;

  return query
    select b.comment, bc.restaurant_id, bc.rank
    from public.ballots b
    join public.ballot_choices bc on bc.ballot_id = b.id
    where b.id = v_ballot
    order by bc.rank asc;
end;
$$;

-- 투표 제출 / 수정.
--   p_choices 예: '[{"restaurant_id":"...","rank":1}, ...]'
create or replace function public.submit_ballot(
  p_slug text,
  p_access_code text,
  p_name text,
  p_pin text,
  p_comment text,
  p_choices jsonb
)
returns jsonb
-- ⚠ crypt()는 pgcrypto(=extensions 스키마) 함수이므로 search_path에 extensions 포함
language plpgsql volatile security definer set search_path = public, extensions
as $$
declare
  v_event public.events;
  v_key text;
  v_ballot uuid;
  v_count int;
  v_choice jsonb;
  v_rid uuid;
  v_rank int;
  v_seen_ranks int[] := '{}';
  v_seen_rids uuid[] := '{}';
begin
  -- 1) 행사 존재 확인
  select * into v_event from public.events where slug = p_slug;
  if v_event.id is null then
    raise exception 'event_not_found';
  end if;

  -- 2) 진행 중 확인
  if v_event.is_open = false then
    raise exception 'voting_closed';
  end if;

  -- 3) 마감 시간 확인
  if v_event.vote_deadline is not null and now() > v_event.vote_deadline then
    raise exception 'voting_closed';
  end if;

  -- 4) 공유 행사 코드 검증 (bcrypt)
  if v_event.access_code_hash is null
     or crypt(coalesce(p_access_code, ''), v_event.access_code_hash) <> v_event.access_code_hash then
    raise exception 'invalid_access_code';
  end if;

  -- 5) 이름/PIN 형식 검증
  if length(public.normalize_name(p_name)) < 2 then
    raise exception 'invalid_name';
  end if;
  if p_pin !~ '^\d{4}$' then
    raise exception 'invalid_pin';
  end if;

  -- 7) 선택 수 검증
  v_count := jsonb_array_length(coalesce(p_choices, '[]'::jsonb));
  if v_count < 1 or v_count > v_event.max_choices then
    raise exception 'invalid_choice_count';
  end if;

  -- 각 선택 검증: 식당 소속 확인 + 순위/식당 중복 검사
  for v_choice in select * from jsonb_array_elements(p_choices)
  loop
    v_rid := (v_choice->>'restaurant_id')::uuid;
    v_rank := (v_choice->>'rank')::int;

    if v_rank < 1 or v_rank > v_event.max_choices then
      raise exception 'invalid_rank';
    end if;
    if v_rank = any(v_seen_ranks) then
      raise exception 'duplicate_rank';
    end if;
    if v_rid = any(v_seen_rids) then
      raise exception 'duplicate_restaurant';
    end if;

    -- 6) 해당 행사 소속의 활성 식당인지 확인
    if not exists (
      select 1 from public.restaurants
      where id = v_rid and event_id = v_event.id and is_active = true
    ) then
      raise exception 'restaurant_not_in_event';
    end if;

    v_seen_ranks := array_append(v_seen_ranks, v_rank);
    v_seen_rids := array_append(v_seen_rids, v_rid);
  end loop;

  -- 8) voter_key 생성
  v_key := public.make_voter_key(p_name, p_pin, v_event.id);

  -- 9) 기존 ballot 있으면 수정, 없으면 생성
  select id into v_ballot from public.ballots
    where event_id = v_event.id and voter_key = v_key;

  if v_ballot is null then
    insert into public.ballots (event_id, voter_name, voter_key, comment)
      values (v_event.id, trim(p_name), v_key, nullif(trim(coalesce(p_comment, '')), ''))
      returning id into v_ballot;
  else
    update public.ballots
      set voter_name = trim(p_name),
          comment = nullif(trim(coalesce(p_comment, '')), ''),
          updated_at = now()
      where id = v_ballot;
  end if;

  -- 10) choices 교체
  delete from public.ballot_choices where ballot_id = v_ballot;
  for v_choice in select * from jsonb_array_elements(p_choices)
  loop
    insert into public.ballot_choices (ballot_id, restaurant_id, rank)
      values (v_ballot, (v_choice->>'restaurant_id')::uuid, (v_choice->>'rank')::int);
  end loop;

  -- 11) 성공 + 익명 ballot id 반환 (원문 정보는 반환하지 않음)
  return jsonb_build_object('ok', true, 'ballot_id', v_ballot);
end;
$$;

-- ── 관리자 RPC (is_admin 검사 필수) ─────────────────────────────────

-- 관리자용 전체 결과 (마감/공개 조건과 무관하게 항상 반환)
create or replace function public.get_admin_results(p_slug text)
returns table (
  restaurant_id uuid,
  name text,
  category text,
  total_score bigint,
  first_choice_count bigint,
  selected_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
declare v_event uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into v_event from public.events where slug = p_slug;
  if v_event is null then raise exception 'event_not_found'; end if;

  return query
    select r.id, r.name, r.category,
           coalesce(sum(case bc.rank when 1 then 3 when 2 then 2 when 3 then 1 else 0 end), 0),
           coalesce(sum(case when bc.rank = 1 then 1 else 0 end), 0),
           coalesce(count(bc.id), 0)
    from public.restaurants r
    left join public.ballot_choices bc on bc.restaurant_id = r.id
    left join public.ballots b on b.id = bc.ballot_id
    where r.event_id = v_event and r.is_active = true
    group by r.id, r.name, r.category;
end;
$$;

-- 관리자: 가족 명단 대비 참여 현황
create or replace function public.get_admin_participation(p_slug text)
returns table (
  display_name text,
  has_voted boolean
)
language plpgsql stable security definer set search_path = public
as $$
declare v_event uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into v_event from public.events where slug = p_slug;
  if v_event is null then raise exception 'event_not_found'; end if;

  return query
    select fm.display_name,
           exists (
             select 1 from public.ballots b
             where b.event_id = v_event
               and public.normalize_name(b.voter_name) = public.normalize_name(fm.display_name)
           ) as has_voted
    from public.family_members fm
    where fm.event_id = v_event and fm.is_active = true
    order by fm.display_order asc;
end;
$$;

-- 관리자: 행사 상태 변경 (열기/마감/실시간공개/제목/날짜/마감시간)
create or replace function public.set_event_status(
  p_slug text,
  p_is_open boolean default null,
  p_show_live_results boolean default null,
  p_title text default null,
  p_subtitle text default null,
  p_event_date timestamptz default null,
  p_vote_deadline timestamptz default null,
  p_expected_guests int default null
)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update public.events set
    is_open = coalesce(p_is_open, is_open),
    show_live_results = coalesce(p_show_live_results, show_live_results),
    title = coalesce(p_title, title),
    subtitle = coalesce(p_subtitle, subtitle),
    event_date = coalesce(p_event_date, event_date),
    vote_deadline = coalesce(p_vote_deadline, vote_deadline),
    expected_guests = coalesce(p_expected_guests, expected_guests),
    updated_at = now()
  where slug = p_slug;
  return jsonb_build_object('ok', true);
end;
$$;

-- 관리자: 공유 행사 코드 재설정
create or replace function public.set_access_code(p_slug text, p_new_code text)
returns jsonb
-- ⚠ crypt()/gen_salt()는 pgcrypto(=extensions 스키마) 함수이므로 search_path에 extensions 포함
language plpgsql volatile security definer set search_path = public, extensions
as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update public.events
    set access_code_hash = crypt(p_new_code, gen_salt('bf')), updated_at = now()
    where slug = p_slug;
  return jsonb_build_object('ok', true);
end;
$$;

-- 관리자: 전체 투표 CSV 원자료 (개인 원문 포함 — 관리자만)
create or replace function public.export_ballots(p_slug text)
returns table (
  voter_name text,
  comment text,
  restaurant_name text,
  rank int,
  updated_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
declare v_event uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into v_event from public.events where slug = p_slug;
  if v_event is null then raise exception 'event_not_found'; end if;

  return query
    select b.voter_name, b.comment, r.name, bc.rank, b.updated_at
    from public.ballots b
    join public.ballot_choices bc on bc.ballot_id = b.id
    join public.restaurants r on r.id = bc.restaurant_id
    where b.event_id = v_event
    order by b.updated_at desc, bc.rank asc;
end;
$$;

-- 관리자: 식당 노출/숨김 및 마지막 확인일 수정
create or replace function public.set_restaurant_visibility(p_restaurant uuid, p_is_active boolean)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  update public.restaurants set is_active = p_is_active where id = p_restaurant;
  return jsonb_build_object('ok', true);
end;
$$;

-- 관리자: 전체 투표 초기화 (2단계 확인은 클라이언트에서, 여기선 실행만)
create or replace function public.reset_ballots(p_slug text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v_event uuid;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into v_event from public.events where slug = p_slug;
  if v_event is null then raise exception 'event_not_found'; end if;
  delete from public.ballots where event_id = v_event;  -- choices는 cascade 삭제
  return jsonb_build_object('ok', true);
end;
$$;

-- 관리자: 가족 명단 등록/교체
create or replace function public.set_family_members(p_slug text, p_names jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_event uuid;
  v_name text;
  v_i int := 0;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select id into v_event from public.events where slug = p_slug;
  if v_event is null then raise exception 'event_not_found'; end if;

  delete from public.family_members where event_id = v_event;
  for v_name in select * from jsonb_array_elements_text(coalesce(p_names, '[]'::jsonb))
  loop
    if length(trim(v_name)) > 0 then
      v_i := v_i + 1;
      insert into public.family_members (event_id, display_name, display_order)
        values (v_event, trim(v_name), v_i);
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'count', v_i);
end;
$$;

-- ── 실행 권한 ───────────────────────────────────────────────────────
-- 익명(anon) 은 공개 RPC 만, 인증(authenticated) 은 관리자 RPC 포함.

grant execute on function
  public.get_event_public(text),
  public.get_restaurants(text),
  public.get_participation_count(text),
  public.get_public_results(text),
  public.get_public_comments(text),
  public.get_my_ballot(text, text, text),
  public.submit_ballot(text, text, text, text, text, jsonb)
to anon, authenticated;

grant execute on function
  public.is_admin(),
  public.get_admin_results(text),
  public.get_admin_participation(text),
  public.set_event_status(text, boolean, boolean, text, text, timestamptz, timestamptz, int),
  public.set_access_code(text, text),
  public.export_ballots(text),
  public.set_restaurant_visibility(uuid, boolean),
  public.reset_ballots(text),
  public.set_family_members(text, jsonb)
to authenticated;
