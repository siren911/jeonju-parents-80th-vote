-- ⚠ 자동 생성 파일입니다. 직접 수정하지 마세요.
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
  'parents80-jeonju-7f9k2m',
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
insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000001',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'korean', '호남각', '전주 전통 한옥 분위기와 한정식 상차림을 함께 즐기기 좋은 가족행사형 식당', '전주 덕진구에 자리한 한옥 분위기의 한정식 식당입니다. 룸과 단체행사 운영 정보가 있어 가족 모임 후보로 검토할 만합니다. 팔순 기념 사진을 남기기 좋은 공간 분위기가 장점으로 언급됩니다.',
  '전북특별자치도 전주시 덕진구 송천동2가 560-3', '063-278-8150',
  35000, 70000, '한정식 코스 (구성은 인원과 예산에 맞춰 상담 필요)', '룸과 단체행사 운영 정보가 있으나, 16명이 한 공간에 앉을 수 있는지는 전화 확인이 필요합니다.',
  '{"room":"call","access":"unknown","parking":"call","menu":"ok","atmosphere":"call","budget":"ok"}'::jsonb, '["한옥 분위기라 팔순 기념 사진을 남기기 좋습니다.","한정식 상차림이라 어르신과 아이 모두 무난하게 드실 수 있습니다.","가격대가 1인 10만 원 예산 안에 들어옵니다."]'::jsonb, '["16명이 한 공간(독립룸)에 앉을 수 있는지","입식 테이블인지, 좌식만 있는지","입구 계단과 문턱, 화장실까지의 이동 동선","주차 가능 대수와 인근 주차 대안"]'::jsonb,
  'https://map.naver.com/p/search/%ED%98%B8%EB%82%A8%EA%B0%81%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EB%8F%992%EA%B0%80%20560-3', 'https://map.kakao.com/link/search/%ED%98%B8%EB%82%A8%EA%B0%81%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EB%8F%992%EA%B0%80%20560-3', 'https://www.honamgak.com/',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  1, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000002',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'korean', '고궁담', '전주비빔밥의 전통을 현대적인 코스와 룸 공간으로 구성한 가족모임 후보', '전주비빔밥을 중심으로 한 한정식을 현대적인 코스로 구성한 곳입니다. 4인실부터 대형 룸까지 운영 정보가 있어 16명 가족 행사 구성 가능성이 높은 후보입니다. 엘리베이터 이용 정보가 있어 어르신 이동 측면에서도 검토할 만합니다.',
  '전북특별자치도 전주시 완산구 유연로 170', '063-228-3711',
  19000, 54000, '런치 한상 · 코스 (구성에 따라 가격 변동)', '4인실부터 대형 룸까지 운영 정보가 있어 16명 구성 가능성이 높습니다. 룸 배정은 예약 시 확인이 필요합니다.',
  '{"room":"call","access":"call","parking":"unknown","menu":"ok","atmosphere":"call","budget":"ok"}'::jsonb, '["소규모 룸부터 대형 룸까지 있어 16명 독립 공간 확보 가능성이 높습니다.","엘리베이터 이용 정보가 있어 어르신 이동 부담이 적을 수 있습니다.","가격대가 넓어 1인 10만 원 예산 안에서 구성하기 수월합니다.","전주비빔밥이라는 지역 상징성이 팔순 자리에 어울립니다."]'::jsonb, '["16명이 들어가는 룸이 완전히 독립된 공간인지","건물 지하주차장 이용 가능 여부와 주차 대수","엘리베이터가 식당 층까지 바로 연결되는지","팔순 상차림과 케이크 반입이 가능한지"]'::jsonb,
  'https://map.naver.com/p/search/%EA%B3%A0%EA%B6%81%EB%8B%B4%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%9C%A0%EC%97%B0%EB%A1%9C%20170', 'https://map.kakao.com/link/search/%EA%B3%A0%EA%B6%81%EB%8B%B4%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%9C%A0%EC%97%B0%EB%A1%9C%20170', 'https://app.catchtable.co.kr/ct/shop/dam',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  2, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000003',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'korean', '전라도음식이야기', '전라도식 다채로운 한정식 코스를 넓은 단체 공간에서 즐길 수 있는 행사형 후보', '전라도식 한정식 코스를 중심으로 한 식당으로, 대규모 가족행사가 가능하다는 정보가 있습니다. 단체석과 행사 공간 운영 정보가 있어 16명 규모 모임 후보로 볼 수 있습니다.',
  '전북특별자치도 전주시 덕진구 아중6길 14-6', '063-244-4477',
  30000, 70000, '전라도 한정식 코스 (코스에 따라 가격 변동)', '단체석과 행사 공간 정보가 있습니다. 16명 독립 배치 여부는 전화 확인이 필요합니다.',
  '{"room":"call","access":"unknown","parking":"unknown","menu":"ok","atmosphere":"call","budget":"ok"}'::jsonb, '["대규모 가족행사 진행 정보가 있어 16명 수용에 무리가 적을 수 있습니다.","전라도 한정식이라 어르신 취향에 맞을 가능성이 높습니다.","가격대가 1인 10만 원 예산 안에 들어옵니다."]'::jsonb, '["16명 단체석이 독립된 공간인지, 홀 한쪽인지","차량 6~8대 주차가 가능한지","입식 좌석 여부와 휠체어·보행 보조 이동 동선","엘리베이터 또는 무단차 진입이 가능한지"]'::jsonb,
  'https://map.naver.com/p/search/%EC%A0%84%EB%9D%BC%EB%8F%84%EC%9D%8C%EC%8B%9D%EC%9D%B4%EC%95%BC%EA%B8%B0%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%95%84%EC%A4%916%EA%B8%B8%2014-6', 'https://map.kakao.com/link/search/%EC%A0%84%EB%9D%BC%EB%8F%84%EC%9D%8C%EC%8B%9D%EC%9D%B4%EC%95%BC%EA%B8%B0%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%95%84%EC%A4%916%EA%B8%B8%2014-6', 'https://www.tripinfo.co.kr/info.html?content_id=2840571&content_type_id=39',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  3, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000004',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'korean', '한식다이닝 늘채움', '전통 한식을 현대적인 코스로 풀어낸 조용하고 품격 있는 기념일형 식당', '전통 한식을 코스로 구성한 조용한 분위기의 식당입니다. 2층 단독홀이 최대 약 30~34명까지 안내되고 있어 16명 가족 행사를 단독으로 진행할 수 있는지 검토할 만합니다. 다만 2층 이동 방식은 반드시 확인이 필요합니다.',
  '전북특별자치도 전주시 덕진구 덕진연못3길 6', null,
  29000, 65000, '한식 코스 (예약 페이지에서 최신 구성 확인)', '2층 단독홀 최대 약 30~34명 안내, 룸은 6인 이상 예약 안내가 있습니다. 16명 단독홀 사용 조건은 확인이 필요합니다.',
  '{"room":"call","access":"unknown","parking":"unknown","menu":"ok","atmosphere":"call","budget":"ok"}'::jsonb, '["2층 단독홀을 쓰면 가족만의 조용한 자리를 만들 수 있습니다.","기념일형 코스 구성이라 팔순 자리 분위기에 어울립니다.","가격대가 1인 10만 원 예산 안에 들어옵니다."]'::jsonb, '["★ 2층까지 엘리베이터가 있는지, 계단만 있는지 (부모님 이동에 가장 중요)","16명이 2층 단독홀을 사용할 때의 최소 금액 조건","대표 전화번호와 예약 방법 (공개된 대표번호가 확인되지 않음)","주차 가능 대수와 인근 공영주차장 위치"]'::jsonb,
  'https://map.naver.com/p/search/%ED%95%9C%EC%8B%9D%EB%8B%A4%EC%9D%B4%EB%8B%9D%20%EB%8A%98%EC%B1%84%EC%9B%80%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EB%8D%95%EC%A7%84%EC%97%B0%EB%AA%BB3%EA%B8%B8%206', 'https://map.kakao.com/link/search/%ED%95%9C%EC%8B%9D%EB%8B%A4%EC%9D%B4%EB%8B%9D%20%EB%8A%98%EC%B1%84%EC%9B%80%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EB%8D%95%EC%A7%84%EC%97%B0%EB%AA%BB3%EA%B8%B8%206', 'https://app.catchtable.co.kr/ct/shop/always_filling_up',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  4, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000005',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'chinese', '아서원1920 전주본점', '프라이빗룸과 대형 연회 공간, 중식 코스를 갖춘 팔순 가족모임 유력 후보', '프라이빗룸과 대형 연회장을 함께 운영하는 중식당입니다. 16명 룸과 대형 연회가 가능하다는 정보가 있어 팔순 가족 모임 후보로 유력합니다. 상가 건물 3층에 있어 엘리베이터 이용 가능 여부를 확인하면 어르신 이동도 수월할 수 있습니다.',
  '전북특별자치도 전주시 덕진구 송천중앙로 225 파인트리몰 3층', '063-272-1788',
  18000, 120000, '런치 · 디너 중식 코스 (1인 10만 원 상한으로 구성 요청 필요)', 'VIP룸, 소규모룸, 연회장 정보가 있으며 16명 룸 이용이 가능하다는 안내가 있습니다.',
  '{"room":"call","access":"call","parking":"call","menu":"ok","atmosphere":"call","budget":"call"}'::jsonb, '["16명 룸과 대형 연회 운영 정보가 있어 인원 수용이 가장 확실한 편입니다.","상가 건물이라 엘리베이터로 이동할 수 있을 가능성이 높습니다.","건물 지하주차장이 있어 차량 여러 대 주차가 수월할 수 있습니다.","중식 코스는 어르신과 아이 모두 무난하게 드실 수 있습니다."]'::jsonb, '["★ 코스 상한이 1인 12만 원까지 있으므로, 10만 원 이내 코스 구성이 가능한지","16명 룸이 완전히 독립된 공간인지, 연회장 일부인지","지하주차장 주차 등록 방식과 무료 시간","3층까지 엘리베이터가 식당 입구와 바로 연결되는지"]'::jsonb,
  'https://map.naver.com/p/search/%EC%95%84%EC%84%9C%EC%9B%901920%20%EC%A0%84%EC%A3%BC%EB%B3%B8%EC%A0%90%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EC%A4%91%EC%95%99%EB%A1%9C%20225%20%ED%8C%8C%EC%9D%B8%ED%8A%B8%EB%A6%AC%EB%AA%B0%203%EC%B8%B5', 'https://map.kakao.com/link/search/%EC%95%84%EC%84%9C%EC%9B%901920%20%EC%A0%84%EC%A3%BC%EB%B3%B8%EC%A0%90%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EC%A4%91%EC%95%99%EB%A1%9C%20225%20%ED%8C%8C%EC%9D%B8%ED%8A%B8%EB%A6%AC%EB%AA%B0%203%EC%B8%B5', 'https://www.instagram.com/aseowon1920/',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  5, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000006',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'chinese', '마천루', '4인부터 대형 단체룸까지 운영 정보가 있는 전주 서곡의 중식 가족모임 후보', '전주 서곡 지역의 중식당으로 4인, 10인, 20인, 40인 이상 룸 운영 안내가 있습니다. 16명 구성 가능성이 높은 편이며 식사 메뉴 가격대가 낮아 예산 여유가 큽니다. 다만 코스 가격은 별도 확인이 필요합니다.',
  '전북특별자치도 전주시 완산구 서곡2길 14-9', '063-255-3168',
  7000, null, '중식 코스 (코스 가격은 전화 확인 필요)', '4인, 10인, 20인, 40인 이상 룸 운영 안내가 있어 16명 구성 가능성이 높습니다.',
  '{"room":"call","access":"unknown","parking":"call","menu":"ok","atmosphere":"unknown","budget":"ok"}'::jsonb, '["다양한 규모의 룸을 운영해 16명 구성이 수월할 수 있습니다.","식사 메뉴 가격대가 낮아 예산 여유가 큽니다.","건물 뒤편 주차 정보가 있습니다."]'::jsonb, '["팔순 자리에 맞는 코스 구성과 1인 가격","16명 룸이 입식인지, 무단차로 들어갈 수 있는지","주차 가능 대수 (차량 6~8대 기준)","팔순 상차림과 케이크 반입 가능 여부","지도에서 최신 전화번호 재확인"]'::jsonb,
  'https://map.naver.com/p/search/%EB%A7%88%EC%B2%9C%EB%A3%A8%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%84%9C%EA%B3%A12%EA%B8%B8%2014-9', 'https://map.kakao.com/link/search/%EB%A7%88%EC%B2%9C%EB%A3%A8%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%84%9C%EA%B3%A12%EA%B8%B8%2014-9', 'https://www.instagram.com/motianlou88/',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  6, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000007',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'japanese', '한참치', '개별룸 16실과 최대 40명 단체룸 조절 정보가 있는 참치·일식 코스 식당', '참치와 일식 코스를 중심으로 하는 식당입니다. 개별룸을 다수 운영하며 최대 40명까지 단체룸 조절이 가능하다는 정보가 있어 16명 가족 행사도 검토할 수 있습니다. 다만 회를 선호하지 않는 가족이 있다면 대체 메뉴 확인이 필요합니다.',
  '전북특별자치도 전주시 완산구 홍산남로 16 201호', '063-221-3737',
  null, null, '정식 · 회정식 · 참치 코스 (1인 10만 원 예산 내 구성 요청 필요)', '개별룸을 다수 운영하며 최대 40명 단체룸 조절이 가능하다는 정보가 있습니다.',
  '{"room":"call","access":"unknown","parking":"unknown","menu":"call","atmosphere":"call","budget":"unknown"}'::jsonb, '["단체룸 조절이 가능해 16명이 한 공간에 앉을 가능성이 높습니다.","개별룸이 많아 조용한 가족 자리를 만들기 좋습니다.","참치 코스는 팔순 자리의 특별한 상차림이 될 수 있습니다."]'::jsonb, '["★ 회·날것을 못 드시는 가족을 위한 대체 메뉴(구이·조림 등)가 있는지","1인 10만 원 이내 코스 구성이 가능한지 (공개 가격 정보 없음)","2층까지 엘리베이터가 있는지와 화장실 동선","건물 주차 가능 여부와 무료 주차 시간"]'::jsonb,
  'https://map.naver.com/p/search/%ED%95%9C%EC%B0%B8%EC%B9%98%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%ED%99%8D%EC%82%B0%EB%82%A8%EB%A1%9C%2016%20201%ED%98%B8', 'https://map.kakao.com/link/search/%ED%95%9C%EC%B0%B8%EC%B9%98%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%ED%99%8D%EC%82%B0%EB%82%A8%EB%A1%9C%2016%20201%ED%98%B8', 'https://www.siksinhot.com/P/1089977',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  7, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000008',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'japanese', '송림일식', '오랜 업력의 회정식·일식 코스를 중심으로 한 전주 구도심 일식 후보', '전주 구도심에 있는 오랜 업력의 일식당입니다. 회정식과 코스를 중심으로 운영하며 룸 운영 정보가 있습니다. 다만 16명 단체 구성과 2층 이동에 대한 정보가 공개되어 있지 않아 확인이 가장 많이 필요한 후보입니다.',
  '전북특별자치도 전주시 완산구 전라감영3길 12-9 2층', '063-284-1845',
  null, null, '회정식 · 일식 코스 (가격 전화 확인 필요)', '룸 운영 정보는 있으나 16명 단체룸 연결 가능 여부는 확인되지 않았습니다.',
  '{"room":"unknown","access":"unknown","parking":"unknown","menu":"call","atmosphere":"call","budget":"unknown"}'::jsonb, '["오랜 업력의 일식당으로 코스 상차림의 완성도를 기대할 수 있습니다.","전주 구도심에 있어 행사 전후 이동과 산책이 수월합니다."]'::jsonb, '["★ 16명이 한 공간에 앉을 수 있는지 (룸 연결 가능 여부 정보 없음)","★ 2층 엘리베이터 유무와 계단 동선 (부모님 이동에 가장 중요)","회·날것을 못 드시는 가족을 위한 대체 메뉴가 있는지","1인 10만 원 이내 구성이 가능한지 (공개 가격 정보 없음)","인근 제휴 주차장 또는 공영주차장 조건"]'::jsonb,
  'https://map.naver.com/p/search/%EC%86%A1%EB%A6%BC%EC%9D%BC%EC%8B%9D%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%A0%84%EB%9D%BC%EA%B0%90%EC%98%813%EA%B8%B8%2012-9%202%EC%B8%B5', 'https://map.kakao.com/link/search/%EC%86%A1%EB%A6%BC%EC%9D%BC%EC%8B%9D%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%A0%84%EB%9D%BC%EA%B0%90%EC%98%813%EA%B8%B8%2012-9%202%EC%B8%B5', 'https://tabling.co.kr/place/677cd22666de5f0698892ddd',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  8, true
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

insert into public.restaurants (
  id, event_id, category, name, summary, description, address, phone,
  price_min, price_max, recommended_menu, capacity_note,
  fit, pros, check_points,
  naver_map_url, kakao_map_url, source_url,
  last_verified, verification_note, image_path, display_order, is_active
) values (
  'd1000000-0000-4000-a000-000000000009',
  (select id from public.events where slug = 'parents80-jeonju-7f9k2m'),
  'beef', '아월 Awor', '전 좌석 프라이빗룸과 기지제 전망이 특징인 프리미엄 한우 가족행사 후보', '전 좌석을 프라이빗룸으로 운영하는 한우 전문점입니다. 2~28인 프라이빗룸 안내가 있어 16명 가족 행사를 한 공간에서 진행하기 좋습니다. 엘리베이터와 지하주차장 정보도 있어 어르신 이동과 주차 측면이 다른 후보보다 안정적입니다. 다만 한우 특성상 예산 관리가 가장 중요합니다.',
  '전북특별자치도 전주시 덕진구 중동로 104-10 2층 201-202호', '063-213-1020',
  null, null, '한우 부위별 · 코스 (1인 10만 원 상한 사전 견적 필수)', '2~28인 프라이빗룸 안내가 있어 16명 단독 사용이 가능할 것으로 보입니다.',
  '{"room":"call","access":"call","parking":"call","menu":"ok","atmosphere":"ok","budget":"unknown"}'::jsonb, '["전 좌석 프라이빗룸이라 가족만의 독립된 자리를 만들 수 있습니다.","2~28인 룸 안내가 있어 16명이 한 공간에 앉기 좋습니다.","엘리베이터 이동 정보가 있어 부모님 이동 부담이 적습니다.","건물 지하주차장이 있어 차량 여러 대 주차가 수월합니다.","기지제 전망이 있어 팔순 자리 분위기가 좋습니다."]'::jsonb, '["★ 1인 10만 원 이내로 16명 상차림이 가능한지 사전 견적 (한우는 예산 초과 위험이 가장 큼)","16명 룸의 최소 주문 금액 조건","엘리베이터가 2층 식당 입구와 바로 연결되는지","팔순 상차림과 케이크 반입 가능 여부","예약금과 취소 규정"]'::jsonb,
  'https://map.naver.com/p/search/%EC%95%84%EC%9B%94%20Awor%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%A4%91%EB%8F%99%EB%A1%9C%20104-10%202%EC%B8%B5%20201-202%ED%98%B8', 'https://map.kakao.com/link/search/%EC%95%84%EC%9B%94%20Awor%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%A4%91%EB%8F%99%EB%A1%9C%20104-10%202%EC%B8%B5%20201-202%ED%98%B8', 'https://www.instagram.com/awor_hanwoo/',
  '2026-07-17', '예약 전 전화 재확인 필요', null,
  9, true
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

commit;
