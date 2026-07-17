/**
 * src/data/restaurants.ts (단일 원본) → supabase/seed.sql 생성 스크립트
 *
 * 실행:  npm run gen:seed
 *
 * 식당 정보를 바꾸려면 src/data/restaurants.ts 만 고친 뒤 이 스크립트를 실행한다.
 * seed.sql 을 직접 손으로 수정하지 않는다.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { RESTAURANTS } from '../src/data/restaurants.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../supabase/seed.sql')

/** SQL 문자열 리터럴로 안전하게 이스케이프 (작은따옴표 중복) */
const s = (v: string | null): string => (v === null ? 'null' : `'${v.replace(/'/g, "''")}'`)
const n = (v: number | null): string => (v === null ? 'null' : String(v))
const b = (v: boolean): string => (v ? 'true' : 'false')

const EVENT_SLUG = process.env.VITE_EVENT_SLUG || 'parents80-jeonju-7f9k2m'

const header = `-- ⚠ 자동 생성 파일입니다. 직접 수정하지 마세요.
-- 원본: src/data/restaurants.ts  /  재생성: npm run gen:seed
--
-- 적용 순서:
--   1) supabase/schema.sql 을 먼저 실행 (테이블/RLS/RPC 생성)
--   2) 이 seed.sql 실행 (행사 + 식당 초기 데이터)
--   3) supabase/README.md 를 보고 행사 코드와 관리자 계정을 설정
--
-- 아래 이벤트의 access_code_hash 는 임시 placeholder 입니다.
-- 반드시 supabase/README.md 의 안내대로 실제 공유 코드 해시로 교체하세요.

begin;

-- ── 행사(events) ────────────────────────────────────────────────
insert into public.events (
  slug, title, subtitle, event_date, vote_deadline,
  expected_guests, budget_per_person, max_choices,
  is_open, show_live_results, access_code_hash
) values (
  ${s(EVENT_SLUG)},
  '우리 가족의 소중한 팔순 식사',
  '함께 골라주세요',
  null,                         -- 행사 날짜: 관리자 화면에서 입력
  null,                         -- 투표 마감: 관리자 화면에서 입력
  16, 100000, 3,
  true, false,
  -- ⚠ placeholder — README 의 select crypt('실제코드', gen_salt('bf')) 결과로 교체
  crypt('CHANGE-ME', gen_salt('bf'))
)
on conflict (slug) do nothing;

-- ── 식당(restaurants) ───────────────────────────────────────────
`

const rows = RESTAURANTS.map((r) => {
  const fit = JSON.stringify(r.fit).replace(/'/g, "''")
  const pros = JSON.stringify(r.pros).replace(/'/g, "''")
  const checks = JSON.stringify(r.checkPoints).replace(/'/g, "''")
  return `insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  ${s(r.id)},
  (select id from public.events where slug = ${s(EVENT_SLUG)}),
  ${s(r.category)}, ${s(r.name)}, ${s(r.summary)}, ${s(r.description)},
  ${s(r.address)}, ${s(r.phone)},
  ${n(r.priceMin)}, ${n(r.priceMax)}, ${s(r.recommendedMenu)}, ${s(r.capacityNote)},
  '${fit}'::jsonb, '${pros}'::jsonb, '${checks}'::jsonb,
  ${s(r.naverMapUrl)}, ${s(r.kakaoMapUrl)}, ${s(r.sourceUrl)},
  ${s(r.lastVerified)}, ${s(r.verificationNote)}, ${s(r.imagePath)},
  ${n(r.displayOrder)}, ${b(r.isActive)}
)
on conflict (id) do update set
  category = excluded.category, name = excluded.name, summary = excluded.summary,
  description = excluded.description, address = excluded.address, phone = excluded.phone,
  price_min = excluded.price_min, price_max = excluded.price_max,
  recommended_menu = excluded.recommended_menu, capacity_note = excluded.capacity_note,
  fit = excluded.fit, pros = excluded.pros, check_points = excluded.check_points,
  naver_map_url = excluded.naver_map_url, kakao_map_url = excluded.kakao_map_url,
  source_url = excluded.source_url, last_verified = excluded.last_verified,
  verification_note = excluded.verification_note, image_path = excluded.image_path,
  display_order = excluded.display_order, is_active = excluded.is_active;
`
}).join('\n')

const footer = `\ncommit;\n`

writeFileSync(OUT, header + rows + footer, 'utf8')
console.log(`✅ seed.sql 생성 완료 (식당 ${RESTAURANTS.length}곳) → ${OUT}`)
