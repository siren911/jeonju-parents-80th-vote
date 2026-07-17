-- ════════════════════════════════════════════════════════════════════
--  패치 01: pgcrypto 함수 search_path 수정
--
--  증상: 투표 제출 시 "function crypt(text, text) does not exist" 오류
--  원인: Supabase는 crypt/gen_salt/digest 를 extensions 스키마에 두는데,
--        RPC 함수의 search_path 가 public 으로만 고정되어 있어 못 찾음.
--  해결: 아래 3개 함수의 search_path 에 extensions 를 추가.
--
--  사용법: 이 파일 전체를 Supabase SQL Editor 에 붙여넣고 실행하세요.
--  (create or replace 라서 기존 함수를 안전하게 덮어씁니다. 데이터는 그대로.)
-- ════════════════════════════════════════════════════════════════════

-- 1) voter_key 생성 (digest 사용)
create or replace function public.make_voter_key(p_name text, p_pin text, p_event uuid)
returns text
language sql immutable set search_path = public, extensions
as $$
  select encode(
    digest(public.normalize_name(p_name) || '|' || p_pin || '|' || p_event::text, 'sha256'),
    'hex'
  );
$$;

-- 2) 투표 제출 (crypt 로 행사코드 검증)
create or replace function public.submit_ballot(
  p_slug text,
  p_access_code text,
  p_name text,
  p_pin text,
  p_comment text,
  p_choices jsonb
)
returns jsonb
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
  select * into v_event from public.events where slug = p_slug;
  if v_event.id is null then
    raise exception 'event_not_found';
  end if;

  if v_event.is_open = false then
    raise exception 'voting_closed';
  end if;

  if v_event.vote_deadline is not null and now() > v_event.vote_deadline then
    raise exception 'voting_closed';
  end if;

  if v_event.access_code_hash is null
     or crypt(coalesce(p_access_code, ''), v_event.access_code_hash) <> v_event.access_code_hash then
    raise exception 'invalid_access_code';
  end if;

  if length(public.normalize_name(p_name)) < 2 then
    raise exception 'invalid_name';
  end if;
  if p_pin !~ '^\d{4}$' then
    raise exception 'invalid_pin';
  end if;

  v_count := jsonb_array_length(coalesce(p_choices, '[]'::jsonb));
  if v_count < 1 or v_count > v_event.max_choices then
    raise exception 'invalid_choice_count';
  end if;

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

    if not exists (
      select 1 from public.restaurants
      where id = v_rid and event_id = v_event.id and is_active = true
    ) then
      raise exception 'restaurant_not_in_event';
    end if;

    v_seen_ranks := array_append(v_seen_ranks, v_rank);
    v_seen_rids := array_append(v_seen_rids, v_rid);
  end loop;

  v_key := public.make_voter_key(p_name, p_pin, v_event.id);

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

  delete from public.ballot_choices where ballot_id = v_ballot;
  for v_choice in select * from jsonb_array_elements(p_choices)
  loop
    insert into public.ballot_choices (ballot_id, restaurant_id, rank)
      values (v_ballot, (v_choice->>'restaurant_id')::uuid, (v_choice->>'rank')::int);
  end loop;

  return jsonb_build_object('ok', true, 'ballot_id', v_ballot);
end;
$$;

-- 3) 관리자 공유코드 재설정 (crypt/gen_salt 사용)
create or replace function public.set_access_code(p_slug text, p_new_code text)
returns jsonb
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

-- 완료 안내
do $$ begin raise notice '✅ 패치 완료. 이제 투표 제출이 정상 동작합니다.'; end $$;
