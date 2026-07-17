-- ════════════════════════════════════════════════════════════════════
--  연동 점검 스크립트 (schema.sql + seed.sql 실행 후 돌려보세요)
--
--  Supabase SQL Editor 에서 이 파일 전체를 실행하면,
--  지시서 8장의 RLS/RPC 보안 항목이 제대로 걸렸는지 자동으로 확인합니다.
--
--  ⚠ SQL Editor 는 기본적으로 관리자(postgres) 권한으로 실행되므로,
--    "익명 사용자 차단"은 role 을 anon 으로 바꿔가며 확인합니다.
--  모든 줄이 ✅ 로 나오면 정상입니다. ❌ 가 있으면 아래 troubleshooting 참고.
-- ════════════════════════════════════════════════════════════════════

-- 준비: 점검용 헬퍼 (결과를 ✅/❌ 로 표시)
do $$
declare
  v_slug text := 'parents80-jeonju-7f9k2m';
  v_ok boolean;
  v_cnt int;
  v_msg text;
begin
  raise notice '──────────────────────────────────────────────';
  raise notice ' 연동 점검 시작 (slug: %)', v_slug;
  raise notice '──────────────────────────────────────────────';

  -- 1) 행사 데이터가 seed 되었는가
  select count(*) into v_cnt from public.events where slug = v_slug;
  raise notice '% 1. 행사 데이터 존재 (기대 1건, 실제 %건)',
    case when v_cnt = 1 then '✅' else '❌' end, v_cnt;

  -- 2) 식당 9곳이 seed 되었는가
  select count(*) into v_cnt from public.restaurants r
    join public.events e on e.id = r.event_id where e.slug = v_slug;
  raise notice '% 2. 식당 데이터 존재 (기대 9곳, 실제 %곳)',
    case when v_cnt = 9 then '✅' else '❌' end, v_cnt;

  -- 3) 모든 테이블 RLS 활성화 확인
  select bool_and(rowsecurity) into v_ok
    from pg_tables
    where schemaname = 'public'
      and tablename in ('events','restaurants','family_members','ballots','ballot_choices','admins');
  raise notice '% 3. 모든 테이블 RLS 활성화', case when v_ok then '✅' else '❌' end;

  -- 4) 공유 코드가 아직 placeholder(CHANGE-ME)인지 경고
  select (access_code_hash = crypt('CHANGE-ME', access_code_hash)) into v_ok
    from public.events where slug = v_slug;
  if v_ok then
    raise notice '⚠️ 4. 공유 행사 코드가 아직 CHANGE-ME 입니다. README 3번대로 실제 코드로 교체하세요.';
  else
    raise notice '✅ 4. 공유 행사 코드가 설정되어 있습니다.';
  end if;

  -- 5) 관리자 계정이 등록되어 있는가
  select count(*) into v_cnt from public.admins;
  raise notice '% 5. 관리자 계정 등록 (실제 %명)',
    case when v_cnt >= 1 then '✅' else '⚠️' end, v_cnt;

  -- 6) 공개 RPC 가 access_code_hash 를 노출하지 않는가
  select exists(
    select 1 from information_schema.routines
    where routine_schema = 'public' and routine_name = 'get_event_public'
  ) into v_ok;
  raise notice '% 6. get_event_public RPC 존재 (해시 비노출 경로)',
    case when v_ok then '✅' else '❌' end;

  raise notice '──────────────────────────────────────────────';
  raise notice ' 아래 anon 권한 점검도 함께 확인하세요 (별도 실행)';
  raise notice '──────────────────────────────────────────────';
end $$;


-- ── 익명(anon) 권한 점검 ──────────────────────────────────────────
-- 아래 블록을 "각각" 실행해보세요. anon 역할로 전환해 차단 여부를 확인합니다.

-- (A) 익명은 ballots 를 직접 조회할 수 없어야 한다 → 0행 또는 권한오류가 정상
set role anon;
select '❌ 익명이 ballots 를 읽을 수 있습니다 (RLS 문제)' as result
from public.ballots limit 1;
-- 위에서 아무 행도 안 나오면 정상입니다.
reset role;

-- (B) 익명은 events 를 직접 조회할 수 없어야 한다 (access_code_hash 보호)
set role anon;
select '❌ 익명이 events 를 직접 읽을 수 있습니다 (해시 노출 위험)' as result
from public.events limit 1;
reset role;

-- (C) 익명이라도 공개 RPC 는 호출할 수 있어야 한다 → 1행 나오면 정상
set role anon;
select '✅ 공개 RPC 정상: ' || title as result
from public.get_event_public('parents80-jeonju-7f9k2m');
reset role;

-- (D) 익명은 테이블에 직접 insert 할 수 없어야 한다 → 오류가 나면 정상
--     (아래 줄의 주석을 풀고 실행하면 permission denied 오류가 나야 정상입니다)
-- set role anon;
-- insert into public.ballots (event_id, voter_name, voter_key)
--   values ((select id from public.events limit 1), '침입자', 'x');
-- reset role;
