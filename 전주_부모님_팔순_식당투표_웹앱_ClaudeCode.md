# Claude Code 통합 작업지시서  
## 전주 부모님 팔순 가족 식당 추천·투표 웹앱

> 이 문서를 Claude Code 프로젝트 루트에 넣고, **문서 전체를 단일 제품 요구사항(PRD) 겸 구현 지시서**로 사용한다.  
> Claude Code는 질문만 반복하지 말고 합리적인 기본값으로 실제 실행 가능한 프로젝트를 완성한다.

---

## 0. Claude Code가 수행할 역할

당신은 시니어 풀스택 엔지니어이자 모바일 UX 디자이너다.  
전북특별자치도 전주시에서 진행할 부모님 팔순 가족 식사를 위해, 가족들이 모바일로 음식점 후보를 살펴보고 투표하며 최종 결과를 확인하는 웹앱을 만든다.

다음 원칙을 반드시 지킨다.

1. 현재 디렉터리에 실제 실행 가능한 전체 소스코드를 생성한다.
2. 목업 화면만 만들지 말고, Supabase를 연결하면 여러 가족의 투표가 실제로 합산되도록 구현한다.
3. GitHub Pages에서 정상 배포되도록 상대 경로와 라우팅을 처리한다.
4. 모바일 화면을 최우선으로 설계하되 태블릿과 데스크톱도 자연스럽게 대응한다.
5. 음식점 정보는 코드 한곳에서 쉽게 수정할 수 있어야 한다.
6. 관리자만 투표를 마감하고 전체 결과와 참여자 현황을 확인할 수 있게 한다.
7. 빌드 오류, TypeScript 오류, 모바일 오버플로가 없는 상태까지 직접 점검한다.
8. 외부 식당 사진을 무단 핫링크하지 않는다. 초기 버전은 품격 있는 카테고리형 플레이스홀더를 사용한다.
9. `service_role` 또는 Supabase secret key를 브라우저 코드에 절대 넣지 않는다.
10. 완성 후 실행·설정·배포 방법을 `README.md`에 한국어로 작성한다.

---

# 1. 프로젝트 목적

가족 약 16명 이하가 부모님 팔순 식사 장소를 함께 고르는 모바일 웹앱이다.

가족 구성원은 다음 흐름으로 이용한다.

1. 행사 취지와 기본 조건 확인
2. 한식·한정식, 중식, 일식·회, 한우·고기 등 장르별 후보 탐색
3. 가격, 위치, 룸, 주차, 어르신 이동 편의 확인
4. 네이버지도 또는 카카오맵에서 위치 확인
5. 마음에 드는 식당 최대 3곳을 순위로 선택
6. 이름과 개인 확인번호 4자리를 입력해 투표 제출
7. 투표 마감 후 최종 순위 확인

관리자는 다음 기능을 사용한다.

- 투표 진행/마감 전환
- 실시간 결과 공개 여부 전환
- 참여자 수와 미투표 인원 확인에 필요한 명단 관리
- 식당 후보 추가·수정·숨김
- 결과 CSV 다운로드
- 가족 단체방에 붙여넣을 결과 요약문 복사

---

# 2. 고정 조건

- 행사: 부모님 팔순 가족 식사
- 지역: 전북특별자치도 전주시
- 예상 인원: 16명 미만
- 예산: 1인당 최대 약 100,000원
- 사용 환경: 가족 단체방으로 링크 공유, 대부분 스마트폰 이용
- 배포: GitHub Pages
- 데이터 집계: Supabase
- 언어: 한국어
- 기본 투표: 최대 3곳 순위 선택
- 점수 방식: 1순위 3점, 2순위 2점, 3순위 1점
- 동점 기준:
  1. 1순위 표가 많은 식당
  2. 전체 선택 횟수가 많은 식당
  3. 그래도 같으면 공동 순위

---

# 3. 중요한 아키텍처 판단

## GitHub Pages만으로는 가족 전체 투표를 취합할 수 없다

GitHub Pages는 정적 호스팅이므로 각 사람의 브라우저 `localStorage`만 사용하면 투표가 서로 합쳐지지 않는다.  
따라서 다음 구조로 구현한다.

```text
가족 스마트폰
   ↓
GitHub Pages: React 정적 웹앱
   ↓ HTTPS
Supabase: 행사·식당·투표·관리자 데이터
```

로컬 개발 또는 Supabase 설정 전에는 `demo mode`를 제공하되, 화면 상단에 **“현재 데모 모드로 이 기기에서만 저장됩니다”**라고 명확히 표시한다.

---

# 4. 권장 기술 스택

- React
- TypeScript
- Vite
- React Router의 `HashRouter`
- 순수 CSS 또는 CSS Modules
- `@supabase/supabase-js`
- `lucide-react`
- Vitest
- 선택 사항: React Hook Form + Zod

과도한 라이브러리를 사용하지 않는다.  
결과 막대그래프는 CSS로 구현하여 차트 라이브러리를 추가하지 않는다.

## GitHub Pages 호환

- Vite `base: './'`
- `HashRouter` 사용
- 새로고침 시 404가 발생하지 않게 구성
- `.github/workflows/deploy.yml` 생성
- `npm ci`, `npm run test`, `npm run build` 이후 `dist`를 GitHub Pages에 배포
- 저장소 Settings → Pages → Source는 `GitHub Actions`

---

# 5. 디자인 방향

## 전체 인상

“부모님의 소중한 시간을 가족이 함께 준비한다”는 느낌의 따뜻하고 품격 있는 모바일 디자인.

- 배경: 따뜻한 아이보리
- 본문: 짙은 먹색 또는 딥 네이비
- 포인트: 절제된 골드 또는 짙은 녹색
- 카드: 흰색, 얕은 테두리, 약한 그림자
- 둥근 모서리: 14~18px
- 과한 그라데이션, 유리효과, 네온, 불필요한 애니메이션 금지
- AI가 자동 생성한 듯한 상투적 문구와 장식 금지
- 한국 가족행사 초대장과 고급 다이닝 가이드의 중간 분위기

## 모바일 UX 기준

- 기본 본문 16px 이상
- 핵심 식당명 20px 이상
- 버튼 높이 최소 48px
- 터치 영역 최소 44×44px
- 하단 고정 투표함은 모바일 safe-area 반영
- 글자 크게 보기 토글 제공
- 색상만으로 선택 상태를 표현하지 말고 체크 아이콘과 문구를 같이 표시
- 긴 주소는 두 줄 허용
- iPhone과 Android에서 가로 스크롤이 생기지 않게 처리
- 360px, 390px, 430px 폭 점검

## 모바일 실전 보완 사항 (전문가 검토)

카카오톡 가족 단체방 공유와 실제 모바일 브라우저 동작을 기준으로 다음을 추가 반영한다.

- 뷰포트 높이는 `height: 100vh`를 폴백으로 먼저 선언한 뒤 `height: 100dvh`로 덮어쓴다(iOS 15 이하는 `dvh` 미지원). 모바일 브라우저 주소창이 접히고 펼쳐질 때 하단 투표함이 밀리지 않게 한다.
- 개인 확인번호 입력창은 `inputmode="numeric"`, `pattern="[0-9]*"`, `maxlength=4`를 지정해 숫자 키패드가 바로 뜨게 한다.
- 카카오톡 인앱 브라우저에서 링크 열기, `target="_blank"` 새 창, Web Share API, 네이버·카카오맵 딥링크가 정상 동작하는지 실제 기기에서 확인한다. 인앱 브라우저 한계로 동작이 막히면 "기본 브라우저로 열기" 안내를 제공한다.
- 공유 링크에 `og:title`, `og:description`, `og:image` 메타 태그를 설정해 카카오톡 채팅방에 링크를 붙였을 때 제목·설명·이미지가 포함된 미리보기 카드가 뜨게 한다. 카카오톡 스크래퍼는 JavaScript를 실행하지 않으므로 OG 태그는 정적 `index.html`에 직접 작성한다(`HashRouter`이므로 모든 경로가 같은 `index.html`을 사용해 문제없음). `og:image`는 상대 경로가 아닌 **배포 URL 기준 절대 URL**로 지정해야 하며, 미리보기용 이미지 파일(1200×630 권장)을 `public/`에 직접 제작해 포함한다. 배포 URL이 확정되기 전에는 플레이스홀더 주석을 남기고 README에 교체 방법을 안내한다.
- 순위 변경은 드래그를 보조 수단으로 두고, 위/아래 버튼 조작을 기본 상호작용으로 제공한다. 터치 스크롤과 드래그 제스처가 충돌하지 않게 한다.
- 상단 고정 헤더도 노치·펀치홀 상단 safe-area를 반영한다. (하단 투표함뿐 아니라 상단도 적용)
- 투표 제출 버튼은 누른 즉시 비활성화하고 로딩 표시를 띄워 중복 탭으로 인한 중복 제출을 원천 차단한다.
- Supabase 데이터를 불러오는 동안 스켈레톤 UI를 표시해 느린 모바일 회선에서도 체감 속도를 개선한다.
- **다크모드는 구현하지 않고 라이트 모드로 고정한다(확정).** 아이보리+골드 디자인 정체성이 다크모드에서 무너지고, 단기 가족 행사 앱에 이중 테마는 과설계다. `index.html`에 `<meta name="color-scheme" content="light">`를 선언하고, 시스템 다크모드에서도 배경·글자색이 뒤집히지 않는지 확인한다.
- **PWA 홈 화면 추가는 P2를 유지한다(확정).** 16명이 몇 주 사용하는 앱이므로 P0 투표 정확성에 시간을 우선 배분한다.

## 신뢰감 있는 톤앤매너 (참여자가 교사·변호사인 경우)

투표에 참여하는 가족 구성원이 교사, 변호사 등 표현과 정확성에 민감한 직군일 수 있으므로 다음을 지킨다.

- 문구에 오탈자와 비문이 없어야 하며, 존댓말과 어미를 화면 전체에서 일관되게 사용한다.
- 과장되거나 상투적인 감탄형 문구("완벽한 선택!", "최고의 맛집!") 대신 사실 위주의 절제된 문장을 쓴다.
- 식당 정보마다 "참고 출처"와 "마지막 확인일"을 항상 함께 보여줘 정보의 근거를 명확히 한다.
- 개인 확인번호가 원문으로 저장되지 않고 해시로만 처리된다는 점을, 개인정보에 민감한 참여자를 위해 투표 화면에 한 줄로 안내한다. 예: "확인번호는 원문으로 저장되지 않아요."
- 오류 메시지와 안내 문구는 원인과 다음 행동을 구체적으로 전달하고, 모호한 표현을 피한다.
- 관리자 화면의 데이터 초기화, 마감 등 되돌리기 어려운 동작은 반드시 2단계 확인을 거치고, 확인 문구에 결과를 구체적으로 명시한다.

---

# 6. 정보 구조와 화면

## 6.1 시작 화면

표시 문구 예시:

```text
우리 가족의 소중한 팔순 식사
함께 골라주세요

전주 · 16명 미만 · 1인 약 10만 원 이내
한식, 중식, 일식, 한우 후보를 비교하고
가고 싶은 식당 세 곳을 골라주세요.
```

필수 요소:

- 행사 날짜: 관리자가 입력하지 않았으면 “일정 협의 중”
- 예상 인원
- 예산
- 투표 마감 일시
- 현재 참여 인원
- `식당 둘러보기` 버튼
- `공유하기` 버튼
- 투표 상태 배지: 진행 중 / 마감 / 데모 모드
- 작은 안내: “가격·메뉴·룸은 예약 전 식당에 최종 확인합니다.”

## 6.2 식당 목록

상단 필터:

- 전체
- 한식·한정식
- 중식
- 일식·회
- 한우·고기

추가 필터:

- 1인 5만 원 이하
- 1인 10만 원 이하
- 16명 룸 유력
- 주차 가능
- 어르신 이동 편리

정렬:

- 가족행사 적합도
- 가격 낮은 순
- 장르순
- 현재 투표순: 실시간 결과 공개일 때만

## 6.3 식당 카드

각 카드에 다음 정보를 표시한다.

- 카테고리 배지
- 식당명
- 한 줄 추천 이유
- 예상 가격 범위
- `16명 룸`, `주차`, `엘리베이터` 상태 배지
- 주소
- `자세히`
- `네이버지도`
- `카카오맵`
- `투표함에 담기`

확인되지 않은 정보는 추정해서 확정 표시하지 않는다.

상태 표현:

- 확인됨: `가능`
- 유력하지만 예약 필요: `전화 확인`
- 정보 없음: `미확인`

## 6.4 상세 화면 또는 바텀시트

- 식당 소개
- 추천 포인트
- 부모님 팔순 행사 관점의 장점
- 확인해야 할 사항
- 가격 범위
- 룸·수용 인원
- 주차
- 엘리베이터/입식/화장실 동선
- 전화 걸기 버튼
- 지도 버튼
- 마지막 확인일
- “정보가 달라졌나요?” 관리자 메모

모바일에서는 전체 페이지 이동보다 큰 바텀시트 또는 모달을 우선 고려한다.

## 6.5 투표함

하단 고정 영역:

```text
선택 2/3
1순위 고궁담
2순위 아서원1920
[순서 정하기] [투표하기]
```

투표함 화면에서:

- 드래그 또는 위/아래 버튼으로 순위 변경
- 선택 삭제
- 1·2·3순위 점수 안내
- 최소 1개, 최대 3개 선택
- 같은 식당 중복 선택 방지

## 6.6 투표 제출

### 공유 행사 코드 처리 방식 (확정)

`submit_ballot` RPC가 요구하는 공유 행사 코드는 **가족이 직접 입력하지 않는다.**  
카카오톡으로 공유되는 링크의 URL 쿼리에 포함해 전달한다.

```text
https://<배포주소>/#/?c=행사코드
```

- 앱은 첫 진입 시 URL에서 코드를 읽어 `sessionStorage`에 보관하고, 투표 제출 시 자동으로 RPC에 전달한다.
- 코드가 없는 URL로 접근하면 "가족 단체방에서 받은 링크로 다시 들어와 주세요" 안내 화면을 보여준다.
- 이 방식의 목적: 가족은 링크만 누르면 아무 코드도 입력할 필요가 없고, 링크가 없는 외부인은 투표할 수 없다.

입력 항목:

- 이름 또는 가족이 알아볼 별명
- 개인 확인번호 4자리
  - 전화번호 뒤 4자리나 가족끼리 정한 숫자
  - 화면에는 용도를 설명하되 원문 번호를 결과 화면에 노출하지 않는다.
- 선택한 식당 순위 최종 확인
- 선택 사항: 한 줄 의견
  - 예: “어머니 이동이 편한 곳이면 좋겠어요.”

검증:

- 이름 2~20자
- 확인번호 숫자 4자리
- 1~3개 식당 선택
- 제출 전 확인 모달
- 동일 이름+확인번호는 새 투표를 만들지 않고 기존 투표를 수정

제출 완료 문구:

```text
투표가 저장됐어요.
마감 전까지 같은 이름과 확인번호로 다시 들어오면 수정할 수 있어요.
```

## 6.7 결과 화면

투표 진행 중이고 관리자가 실시간 공개를 꺼놓은 경우:

```text
결과는 투표 마감 후 공개됩니다.
현재 11명이 참여했어요.
```

공개 상태에서는:

- 총 참여 인원
- 1위 식당 강조 카드
- 식당별 총점 막대
- 1순위 표 수
- 전체 선택 수
- 장르별 선호도
- 가족 의견 모음
- 동점 안내
- 최종 후보 Top 3
- `결과 요약 복사`
- 관리자만 `CSV 다운로드`

결과 요약 예시:

```text
[팔순 식사 투표 결과]
참여 14명
1위 고궁담 31점
2위 아서원1920 27점
3위 호남각 22점

다음 단계: 상위 3곳에 16명 룸, 메뉴, 주차를 전화 확인한 뒤 최종 예약
```

## 6.8 관리자 화면

경로 예시: `#/admin`

**Supabase Auth 이메일 OTP(6자리 코드) 방식으로 확정한다.**  
매직링크는 인증 토큰이 URL 해시(`#access_token=...`)로 전달되어 `HashRouter`(`#/admin`)와 충돌하는 알려진 문제가 있으므로 사용하지 않는다. 이메일로 받은 6자리 코드를 입력하는 방식이 정적 호스팅 환경에서 안전하다.

관리자 이메일 주소를 클라이언트 코드에 권한 근거로 하드코딩하지 말고, `admins` 테이블의 `user_id`로 권한을 확인한다.

관리자 기능:

- 행사 제목·날짜·예상 인원·마감 시간 수정
- 투표 열기/마감
- 실시간 결과 공개 여부
- 가족 명단 등록
- 참여 여부 확인
- 식당 CRUD
- 식당 노출/숨김
- 결과 CSV
- 전체 결과 초기화는 2단계 확인
- 식당 데이터 `마지막 확인일` 수정

---

# 7. 데이터 모델

Supabase에 다음 구조를 만든다.  
Claude Code는 `supabase/schema.sql`, `supabase/seed.sql`을 생성한다.

## 7.1 `events`

- `id uuid primary key`
- `slug text unique not null`
- `title text not null`
- `subtitle text`
- `event_date timestamptz null`
- `vote_deadline timestamptz null`
- `expected_guests int default 16`
- `budget_per_person int default 100000`
- `max_choices int default 3`
- `is_open boolean default true`
- `show_live_results boolean default false`
- `access_code_hash text not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

공유 링크의 `slug`는 예측하기 어려운 문자열을 사용한다.

예:

```text
parents80-jeonju-7f9k2m
```

## 7.2 `restaurants`

- `id uuid primary key`
- `event_id uuid references events`
- `category text`
- `name text`
- `summary text`
- `description text`
- `address text`
- `phone text`
- `price_min int`
- `price_max int`
- `recommended_menu text`
- `capacity_note text`
- `room_status text`
- `parking_status text`
- `accessibility_status text`
- `naver_map_url text`
- `kakao_map_url text`
- `source_url text`
- `last_verified date`
- `verification_note text`
- `image_path text null`
- `display_order int`
- `is_active boolean default true`
- `created_at timestamptz default now()`

## 7.3 `family_members`

- `id uuid primary key`
- `event_id uuid references events`
- `display_name text`
- `is_active boolean default true`
- `display_order int`
- 공개 화면에는 전체 이름 목록을 노출하지 않는다.

## 7.4 `ballots`

- `id uuid primary key`
- `event_id uuid references events`
- `voter_name text`
- `voter_key text`
- `comment text null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- unique: `(event_id, voter_key)`

`voter_key`는 서버 함수에서 다음 요소를 조합해 SHA-256으로 만든다.

```text
정규화한 이름 + 개인 확인번호 4자리 + event_id
```

**이름 정규화 규칙 (확정):**

1. 유니코드 NFC 정규화
2. 모든 공백 문자 제거 (`"김 영희"` → `"김영희"`)
3. 앞뒤 공백 제거 후 소문자 변환 (영문 별명 대비)

이 규칙은 클라이언트 표시용이 아니라 **해시 생성 직전에 RPC 내부에서** 적용한다.  
같은 사람이 이름 띄어쓰기를 다르게 입력해도 동일 투표로 인식되어 수정이 가능해야 한다.

원본 확인번호는 DB에 저장하지 않는다.

## 7.5 `ballot_choices`

- `id uuid primary key`
- `ballot_id uuid references ballots on delete cascade`
- `restaurant_id uuid references restaurants`
- `rank int check rank between 1 and 3`
- unique: `(ballot_id, rank)`
- unique: `(ballot_id, restaurant_id)`

## 7.6 `admins`

- `user_id uuid primary key references auth.users`
- `created_at timestamptz default now()`

---

# 8. 보안과 RPC

## 핵심 원칙

- Supabase publishable/anon key는 클라이언트 사용 가능
- Supabase secret/service-role key는 클라이언트 금지
- 모든 테이블에 RLS 활성화
- 투표 원본과 가족 명단은 일반 사용자에게 직접 SELECT 허용하지 않음
- 일반 투표 제출은 `security definer` RPC를 사용
- 관리자 기능은 `auth.uid()`가 `admins`에 존재하는지 검사

## `events` 테이블 노출 주의 (중요)

시작 화면에 마감 시간·진행 상태를 보여주려면 익명 사용자가 행사 정보를 읽어야 하지만,  
`events` 테이블에는 `access_code_hash`가 함께 들어 있다.  
**RLS는 행 단위 제어라서 특정 컬럼만 가릴 수 없다.** 익명 SELECT를 테이블에 직접 열면 해시가 노출된다.

따라서:

- `events` 테이블 자체는 익명 SELECT를 허용하지 않는다.
- 공개해도 되는 컬럼(`title`, `subtitle`, `event_date`, `vote_deadline`, `expected_guests`, `budget_per_person`, `max_choices`, `is_open`, `show_live_results`)만 반환하는 `get_event_public(slug)` RPC 또는 공개 뷰를 별도로 만든다.
- 클라이언트는 행사 정보를 항상 이 경로로만 읽는다.

## 필요한 RPC

### `get_event_public`

- 입력: event slug
- 반환: 위에 나열한 공개 컬럼만
- `access_code_hash`, `id` 등 내부 값은 반환하지 않는다(식당 조회에 event id가 필요하면 slug 기반 조회로 대체).

### `submit_ballot`

입력:

- event slug
- 공유 행사 코드 (6.6에 따라 URL 쿼리에서 자동 추출한 값 — 사용자 입력 아님)
- voter name
- 개인 확인번호 4자리
- comment
- JSON 선택 목록: restaurant_id, rank

동작:

1. 행사 존재 확인
2. 행사 진행 중인지 확인
3. 마감 시간 확인
4. `pgcrypto`로 공유 행사 코드 검증
5. 이름과 확인번호 검증
6. 해당 행사 소속 식당인지 확인
7. 최대 선택 수와 순위 중복 검사
8. `voter_key` 해시 생성
9. 기존 ballot이 있으면 수정, 없으면 생성
10. choices 교체
11. 성공 여부와 익명 ballot id 반환

### `get_public_results`

- 행사가 마감되었거나 `show_live_results=true`일 때만 집계 반환
- voter name과 comment 원문은 공개하지 않는다.
- 반환:
  - restaurant id/name/category
  - total score
  - first choice count
  - selected count
  - rank

### `get_participation_count`

- 총 참여 인원 숫자만 반환

### 관리자 RPC

- `get_admin_results`
- `set_event_status`
- `export_ballots`
- 관리자 여부 검사 필수

## RLS 테스트

다음 상황을 테스트한다.

- 익명 사용자가 ballots를 직접 조회할 수 없어야 함
- 익명 사용자가 테이블에 직접 insert/update/delete 할 수 없어야 함
- RPC를 통한 정상 투표는 가능해야 함
- 다른 행사의 식당 id로 투표 불가
- 마감 이후 투표 불가
- 관리자만 원본 참여 현황과 CSV 접근 가능

---

# 9. 초기 식당 후보 데이터

## 데이터 사용 원칙

아래 정보는 2026-07-17 기준 웹에서 확인한 **초기 후보 데이터**다.  
영업시간, 가격, 룸 수용 인원, 주차, 엘리베이터는 바뀔 수 있으므로 앱에도 다음 문구를 표시한다.

> 후보 비교를 위한 참고 정보입니다. 실제 예약 전 16명 독립룸, 메뉴 가격, 주차, 엘리베이터와 입식 좌석을 식당에 전화로 확인해 주세요.

`last_verified`는 `2026-07-17`로 입력하고, 모든 후보의 기본 `verification_note`는 `예약 전 전화 재확인 필요`로 설정한다.

### 1. 호남각 — 한식·한정식
- 한 줄 소개: 전주 전통 한옥 분위기와 한정식 상차림을 함께 즐기기 좋은 가족행사형 식당
- 주소: 전북특별자치도 전주시 덕진구 송천동2가 560-3
- 전화: 063-278-8150
- 예상 가격: 약 35,000~70,000원/인(코스·메뉴에 따라 변동)
- 16명 수용: 16명 단체 가능 여부 및 독립룸 배치 전화 확인
- 룸: 룸·단체행사 운영 정보 있음
- 주차: 주차 가능 정보 있음
- 어르신 이동: 입식 테이블·계단/문턱·화장실 동선 전화 확인
- 네이버지도: https://map.naver.com/p/search/%ED%98%B8%EB%82%A8%EA%B0%81%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EB%8F%992%EA%B0%80%20560-3
- 카카오맵: https://map.kakao.com/link/search/%ED%98%B8%EB%82%A8%EA%B0%81%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EB%8F%992%EA%B0%80%20560-3
- 참고 출처: https://www.honamgak.com/
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 2. 고궁담 — 한식·한정식
- 한 줄 소개: 전주비빔밥의 전통을 현대적인 코스와 룸 공간으로 구성한 가족모임 후보
- 주소: 전북특별자치도 전주시 완산구 유연로 170
- 전화: 063-228-3711
- 예상 가격: 약 19,000~54,000원/인(런치·한상·코스에 따라 변동)
- 16명 수용: 소규모 룸부터 대형 룸 정보가 있어 16명 행사에 유력
- 룸: 4인실부터 대형 룸 운영 정보 있음
- 주차: 건물 지하 및 인근 주차 여건 사전 확인
- 어르신 이동: 엘리베이터 이용 정보 있음
- 네이버지도: https://map.naver.com/p/search/%EA%B3%A0%EA%B6%81%EB%8B%B4%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%9C%A0%EC%97%B0%EB%A1%9C%20170
- 카카오맵: https://map.kakao.com/link/search/%EA%B3%A0%EA%B6%81%EB%8B%B4%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%9C%A0%EC%97%B0%EB%A1%9C%20170
- 참고 출처: https://app.catchtable.co.kr/ct/shop/dam
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 3. 전라도음식이야기 — 한식·한정식
- 한 줄 소개: 전라도식 다채로운 한정식 코스를 넓은 단체 공간에서 즐길 수 있는 행사형 후보
- 주소: 전북특별자치도 전주시 덕진구 아중6길 14-6
- 전화: 063-244-4477
- 예상 가격: 약 30,000~70,000원/인(코스에 따라 변동)
- 16명 수용: 대규모 가족행사 가능 정보 있음
- 룸: 단체석·행사 공간 정보 있음
- 주차: 대형 모임 기준 주차 대수 전화 확인
- 어르신 이동: 입식 여부, 엘리베이터, 휠체어 동선 전화 확인
- 네이버지도: https://map.naver.com/p/search/%EC%A0%84%EB%9D%BC%EB%8F%84%EC%9D%8C%EC%8B%9D%EC%9D%B4%EC%95%BC%EA%B8%B0%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%95%84%EC%A4%916%EA%B8%B8%2014-6
- 카카오맵: https://map.kakao.com/link/search/%EC%A0%84%EB%9D%BC%EB%8F%84%EC%9D%8C%EC%8B%9D%EC%9D%B4%EC%95%BC%EA%B8%B0%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%95%84%EC%A4%916%EA%B8%B8%2014-6
- 참고 출처: https://www.tripinfo.co.kr/info.html?content_id=2840571&content_type_id=39
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 4. 한식다이닝 늘채움 — 한식·한정식
- 한 줄 소개: 전통 한식을 현대적인 코스로 풀어낸 조용하고 품격 있는 기념일형 식당
- 주소: 전북특별자치도 전주시 덕진구 덕진연못3길 6
- 전화: 예약 페이지에서 최신 연락처 확인
- 예상 가격: 약 29,000~65,000원/인
- 16명 수용: 2층 단독홀 최대 약 30~34명 안내, 룸은 6인 이상 예약 안내
- 룸: 룸·단독홀 운영 정보 있음
- 주차: 매장 및 인근 주차 여건 확인
- 어르신 이동: 2층 이동 방식과 엘리베이터 유무 필수 확인
- 네이버지도: https://map.naver.com/p/search/%ED%95%9C%EC%8B%9D%EB%8B%A4%EC%9D%B4%EB%8B%9D%20%EB%8A%98%EC%B1%84%EC%9B%80%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EB%8D%95%EC%A7%84%EC%97%B0%EB%AA%BB3%EA%B8%B8%206
- 카카오맵: https://map.kakao.com/link/search/%ED%95%9C%EC%8B%9D%EB%8B%A4%EC%9D%B4%EB%8B%9D%20%EB%8A%98%EC%B1%84%EC%9B%80%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EB%8D%95%EC%A7%84%EC%97%B0%EB%AA%BB3%EA%B8%B8%206
- 참고 출처: https://app.catchtable.co.kr/ct/shop/always_filling_up
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 5. 아서원1920 전주본점 — 중식
- 한 줄 소개: 프라이빗룸과 대형 연회 공간, 중식 코스를 갖춘 팔순 가족모임 유력 후보
- 주소: 전북특별자치도 전주시 덕진구 송천중앙로 225 파인트리몰 3층
- 전화: 063-272-1788
- 예상 가격: 약 18,000~120,000원/인(런치·디너 코스에 따라 변동)
- 16명 수용: 16명 룸 및 대형 연회 가능 정보 있음
- 룸: VIP룸·소규모룸·연회장 정보 있음
- 주차: 건물 지하주차장, 주차 등록 방식 확인
- 어르신 이동: 상가 엘리베이터 이용 가능 여부 확인
- 네이버지도: https://map.naver.com/p/search/%EC%95%84%EC%84%9C%EC%9B%901920%20%EC%A0%84%EC%A3%BC%EB%B3%B8%EC%A0%90%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EC%A4%91%EC%95%99%EB%A1%9C%20225%20%ED%8C%8C%EC%9D%B8%ED%8A%B8%EB%A6%AC%EB%AA%B0%203%EC%B8%B5
- 카카오맵: https://map.kakao.com/link/search/%EC%95%84%EC%84%9C%EC%9B%901920%20%EC%A0%84%EC%A3%BC%EB%B3%B8%EC%A0%90%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%86%A1%EC%B2%9C%EC%A4%91%EC%95%99%EB%A1%9C%20225%20%ED%8C%8C%EC%9D%B8%ED%8A%B8%EB%A6%AC%EB%AA%B0%203%EC%B8%B5
- 참고 출처: https://www.instagram.com/aseowon1920/
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 6. 마천루 — 중식
- 한 줄 소개: 4인부터 대형 단체룸까지 운영 정보가 있는 전주 서곡의 중식 가족모임 후보
- 주소: 전북특별자치도 전주시 완산구 서곡2길 14-9
- 전화: 063-255-3168 또는 지도 최신 번호 확인
- 예상 가격: 식사 메뉴 약 7,000원부터, 코스 가격은 전화 확인
- 16명 수용: 4·10·20·40인 이상 룸 운영 안내가 있어 16명 구성 가능성 높음
- 룸: 다양한 규모의 룸 운영 정보 있음
- 주차: 건물 뒤편 주차 정보 있음
- 어르신 이동: 입식 룸과 무단차 동선 확인
- 네이버지도: https://map.naver.com/p/search/%EB%A7%88%EC%B2%9C%EB%A3%A8%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%84%9C%EA%B3%A12%EA%B8%B8%2014-9
- 카카오맵: https://map.kakao.com/link/search/%EB%A7%88%EC%B2%9C%EB%A3%A8%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%84%9C%EA%B3%A12%EA%B8%B8%2014-9
- 참고 출처: https://www.instagram.com/motianlou88/
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 7. 한참치 — 일식·회
- 한 줄 소개: 개별룸 16실과 최대 40명 단체룸 조절 정보가 있는 참치·일식 코스 식당
- 주소: 전북특별자치도 전주시 완산구 홍산남로 16 201호
- 전화: 063-221-3737
- 예상 가격: 정식·회정식·참치 코스 가격 전화 확인, 인당 10만 원 예산 내 구성 요청
- 16명 수용: 최대 40명 단체룸 조절 가능 정보 있음
- 룸: 개별룸 다수
- 주차: 건물 주차 가능 여부와 무료 시간 확인
- 어르신 이동: 2층 엘리베이터·화장실 동선 확인
- 네이버지도: https://map.naver.com/p/search/%ED%95%9C%EC%B0%B8%EC%B9%98%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%ED%99%8D%EC%82%B0%EB%82%A8%EB%A1%9C%2016%20201%ED%98%B8
- 카카오맵: https://map.kakao.com/link/search/%ED%95%9C%EC%B0%B8%EC%B9%98%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%ED%99%8D%EC%82%B0%EB%82%A8%EB%A1%9C%2016%20201%ED%98%B8
- 참고 출처: https://www.siksinhot.com/P/1089977
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 8. 송림일식 — 일식·회
- 한 줄 소개: 오랜 업력의 회정식·일식 코스를 중심으로 한 전주 구도심 일식 후보
- 주소: 전북특별자치도 전주시 완산구 전라감영3길 12-9 2층
- 전화: 063-284-1845 또는 지도 최신 번호 확인
- 예상 가격: 회정식·코스 가격 전화 확인
- 16명 수용: 16명 단체룸 연결 가능 여부 필수 확인
- 룸: 룸 운영 정보 있음
- 주차: 인근 제휴·공영주차장 조건 확인
- 어르신 이동: 2층 엘리베이터 유무와 계단 동선 필수 확인
- 네이버지도: https://map.naver.com/p/search/%EC%86%A1%EB%A6%BC%EC%9D%BC%EC%8B%9D%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%A0%84%EB%9D%BC%EA%B0%90%EC%98%813%EA%B8%B8%2012-9%202%EC%B8%B5
- 카카오맵: https://map.kakao.com/link/search/%EC%86%A1%EB%A6%BC%EC%9D%BC%EC%8B%9D%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EC%99%84%EC%82%B0%EA%B5%AC%20%EC%A0%84%EB%9D%BC%EA%B0%90%EC%98%813%EA%B8%B8%2012-9%202%EC%B8%B5
- 참고 출처: https://tabling.co.kr/place/677cd22666de5f0698892ddd
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`

### 9. 아월 Awor — 한우·고기
- 한 줄 소개: 전 좌석 프라이빗룸과 기지제 전망이 특징인 프리미엄 한우 가족행사 후보
- 주소: 전북특별자치도 전주시 덕진구 중동로 104-10 2층 201-202호
- 전화: 063-213-1020
- 예상 가격: 한우 부위·코스 선택에 따라 변동, 인당 10만 원 상한으로 사전 견적 필수
- 16명 수용: 2~28인 프라이빗룸 안내
- 룸: 전 좌석 프라이빗룸 정보 있음
- 주차: 건물 지하주차장 정보 있음
- 어르신 이동: 엘리베이터 이동 정보 있음
- 네이버지도: https://map.naver.com/p/search/%EC%95%84%EC%9B%94%20Awor%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%A4%91%EB%8F%99%EB%A1%9C%20104-10%202%EC%B8%B5%20201-202%ED%98%B8
- 카카오맵: https://map.kakao.com/link/search/%EC%95%84%EC%9B%94%20Awor%20%EC%A0%84%EB%B6%81%ED%8A%B9%EB%B3%84%EC%9E%90%EC%B9%98%EB%8F%84%20%EC%A0%84%EC%A3%BC%EC%8B%9C%20%EB%8D%95%EC%A7%84%EA%B5%AC%20%EC%A4%91%EB%8F%99%EB%A1%9C%20104-10%202%EC%B8%B5%20201-202%ED%98%B8
- 참고 출처: https://www.instagram.com/awor_hanwoo/
- 데이터 상태: `후보 정보 — 예약 전 전화 재확인 필수`


---

# 10. 팔순 행사 관점의 식당 평가 항목

식당마다 단순 별점 대신 다음 6개 항목을 보여준다.

1. 16명 독립공간
2. 어르신 이동 편의
3. 주차 편의
4. 메뉴 호불호
5. 행사 분위기
6. 인당 10만 원 예산 적합성

검증되지 않은 항목을 임의의 별점으로 만들지 않는다.  
초기에는 `확인됨 / 전화 확인 / 미확인` 3단계로 표시한다.

식당 확정 전 관리자 체크리스트:

```text
□ 16명이 한 공간에서 앉을 수 있는가
□ 룸이 완전히 독립되어 있는가
□ 입식 테이블인가
□ 엘리베이터 또는 무단차 이동이 가능한가
□ 부모님 자리까지 이동 거리가 짧은가
□ 가까운 화장실이 있는가
□ 주차 차량 약 6~8대 수용 또는 지원이 가능한가
□ 인당 10만 원 내에서 음식·음료·상차림 비용이 가능한가
□ 케이크 반입과 팔순 상차림이 가능한가
□ 예약금과 취소 규정은 무엇인가
□ 아이 또는 해산물·육류 비선호자를 위한 대체 메뉴가 있는가
```

---

# 11. 소스 구조

다음과 유사한 구조로 만든다.

```text
.
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ public/
│  ├─ favicon.svg
│  └─ images/
│     ├─ korean-placeholder.svg
│     ├─ chinese-placeholder.svg
│     ├─ japanese-placeholder.svg
│     └─ beef-placeholder.svg
├─ src/
│  ├─ components/
│  │  ├─ AppHeader.tsx
│  │  ├─ EventHero.tsx
│  │  ├─ CategoryTabs.tsx
│  │  ├─ FilterSheet.tsx
│  │  ├─ RestaurantCard.tsx
│  │  ├─ RestaurantDetailSheet.tsx
│  │  ├─ BallotBar.tsx
│  │  ├─ RankEditor.tsx
│  │  ├─ ResultBar.tsx
│  │  ├─ EmptyState.tsx
│  │  └─ ConfirmDialog.tsx
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ RestaurantsPage.tsx
│  │  ├─ BallotPage.tsx
│  │  ├─ ResultsPage.tsx
│  │  └─ AdminPage.tsx
│  ├─ hooks/
│  ├─ lib/
│  │  ├─ supabase.ts
│  │  ├─ demoStore.ts
│  │  ├─ scoring.ts
│  │  ├─ validation.ts
│  │  └─ share.ts
│  ├─ data/
│  │  └─ restaurants.ts   # 식당 정보 단일 원본 (seed.sql 생성의 소스)
│  ├─ types/
│  ├─ styles/
│  │  ├─ tokens.css
│  │  └─ global.css
│  ├─ App.tsx
│  └─ main.tsx
├─ supabase/
│  ├─ schema.sql
│  ├─ seed.sql
│  └─ README.md
├─ .env.example
├─ index.html
├─ package.json
├─ vite.config.ts
└─ README.md
```

---

# 12. 환경 변수

`.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_EVENT_SLUG=parents80-jeonju-7f9k2m
VITE_DEMO_MODE=false
```

주의:

- `.env`는 git에 커밋하지 않는다.
- 클라이언트에는 publishable/anon key만 사용한다.
- 관리자 생성과 secret key 작업은 Supabase Dashboard 또는 서버 환경에서만 수행한다.

GitHub Actions에서 Vite 빌드에 필요한 공개 값은 Repository Variables 또는 Secrets로 주입한다.

---

# 13. 데모 모드

## 식당 데이터 단일 원본 원칙

식당 9곳 정보가 `demoRestaurants.ts`와 `supabase/seed.sql` 두 곳에 각각 존재하면 수정 시 불일치가 생긴다.  
**`src/data/restaurants.ts`(TypeScript)를 유일한 원본으로 두고**, `seed.sql`은 이 파일에서 생성 스크립트(`npm run gen:seed` 등)로 만들어낸다. 식당 정보를 고칠 때는 TS 파일 한 곳만 수정한다.

Supabase 값이 없거나 `VITE_DEMO_MODE=true`이면:

- 위 단일 원본 데이터에서 식당 표시
- 투표는 localStorage 저장
- 결과 화면은 현재 기기 데이터만 집계
- 상단에 눈에 띄는 데모 경고
- 실제 가족 배포 전 Supabase 연결 필요 안내

localStorage key는 버전과 행사 slug를 포함한다.

```text
parents80-v1:parents80-jeonju-7f9k2m
```

---

# 14. 지도 연결

초기 버전은 별도 지도 API 키 없이 안정적으로 동작하도록 한다.

- 네이버지도 버튼: 검색 또는 장소 링크 새 창 열기
- 카카오맵 버튼: 검색 링크 새 창 열기
- `target="_blank"`
- `rel="noopener noreferrer"`
- 모바일에서 해당 지도 앱으로 전환될 수 있는 링크 우선
- 링크가 실패하면 주소 복사 버튼 제공

지도 iframe이나 카카오 지도 SDK는 필수 사항이 아니다.  
API 키가 준비된 경우에만 2차 기능으로 전체 후보 지도를 추가한다.

---

# 15. 공유 기능

Web Share API가 가능하면:

- 제목
- 간단한 안내
- 현재 행사 URL

을 공유한다.

지원하지 않으면 클립보드 복사로 대체한다.

공유 문구:

```text
부모님 팔순 식사 장소를 함께 골라주세요.
전주 식당 후보를 보고 가고 싶은 곳 세 군데에 투표해 주세요.
```

---

# 16. 오류·빈 상태

반드시 구현할 상태:

- 네트워크 오류
- Supabase 연결 오류
- 잘못된 행사 링크
- 투표 마감
- 식당 없음
- 필터 결과 없음
- 기존 투표 불러오기 실패
- 투표 제출 중 중복 탭
- 지도 링크 없음
- 관리자 권한 없음

오류 메시지는 기술 용어 대신 사용자가 할 행동을 알려준다.

예:

```text
투표를 저장하지 못했어요.
인터넷 연결을 확인한 뒤 다시 눌러주세요.
선택한 내용은 이 화면에 그대로 남아 있어요.
```

---

# 17. 접근성과 품질

- 모든 버튼에 명확한 accessible name
- 키보드 탐색 가능
- 포커스 표시 제거 금지
- 모달 포커스 트랩
- `aria-live`로 투표함 선택 수 안내
- 텍스트 대비 WCAG AA 수준
- `prefers-reduced-motion` 대응
- 전화 링크 `tel:`
- 주소 복사 성공 메시지
- 날짜는 한국 로케일로 출력
- 금액은 `Intl.NumberFormat('ko-KR')`

---

# 18. 테스트

최소 단위 테스트:

- 3·2·1 점수 계산
- 동점 정렬
- 최대 3개 제한
- 중복 식당 방지
- 이름 정규화
- 4자리 확인번호 검증
- 마감 시간 판정
- 결과 공개 조건

수동 점검:

```text
□ 360px 화면에서 가로 스크롤 없음
□ 하단 투표함이 홈 인디케이터와 겹치지 않음
□ 식당 3개 선택 후 4번째 선택 시 안내
□ 선택 순서 변경 가능
□ 투표 수정 가능
□ 마감 후 제출 버튼 비활성
□ 지도 새 창 정상
□ 공유 또는 링크 복사 정상
□ 결과 동점 처리 정상
□ 새로고침 후 현재 상태 유지
□ GitHub Pages 경로에서 자산 404 없음
```

완료 전에 실행:

```bash
npm install
npm run test
npm run build
```

주의: Vitest는 기본이 watch 모드이므로 `package.json`의 `test` 스크립트를 `vitest run`으로 정의한다.  
그렇지 않으면 GitHub Actions 워크플로가 테스트 단계에서 멈춘다.

가능하면 Playwright 또는 브라우저 자동화로 모바일 뷰포트 스모크 테스트도 추가한다.

---

# 19. GitHub Pages 배포 워크플로 요구

`.github/workflows/deploy.yml`은 다음 조건을 만족한다.

- main 브랜치 push 시 실행
- Actions에서 수동 실행 가능
- Node LTS 사용
- npm cache
- 테스트
- 빌드
- Pages artifact 업로드
- Pages 배포
- 필요한 permissions 최소화:
  - contents: read
  - pages: write
  - id-token: write
- concurrency 설정

README에 배포 순서를 작성한다.

1. GitHub 저장소 생성
2. 코드 push
3. Repository Variables/Secrets 설정
4. Settings → Pages → GitHub Actions 선택
5. Actions 성공 확인
6. 배포 URL을 가족 단체방에 공유

---

# 20. 구현 우선순위

## P0 — 반드시 완성

- 모바일 시작 화면
- 장르별 식당 목록
- 식당 상세
- 네이버·카카오 지도 연결
- 최대 3개 순위 투표
- Supabase 실제 집계
- 투표 수정
- 마감 후 결과
- 관리자 투표 마감
- GitHub Pages 자동 배포
- README

## P1 — 가능하면 완성

- 관리자 식당 CRUD
- 가족 명단과 참여 현황
- 결과 CSV
- 결과 요약 복사
- 글자 크게 보기
- 의견 모음
- 데모 모드

## P2 — 시간이 남으면

- PWA 설치
- 전체 후보 지도
- 행사 사진 또는 부모님 사진을 관리자가 추가하는 기능
- 카카오톡 공유 SDK
- 최종 예약 완료 배지

P0가 안정적으로 작동하기 전에 P2를 구현하지 않는다.

---

# 21. 최종 산출물 체크

Claude Code는 작업이 끝나면 다음 내용을 마지막 답변에 정리한다.

1. 생성한 주요 파일
2. 실행 명령
3. Supabase SQL 적용 순서
4. 관리자 계정 등록 방법
5. GitHub Pages 배포 순서
6. 사용자가 직접 바꿔야 할 값
7. 테스트와 빌드 결과
8. 아직 확인이 필요한 식당 정보

다음 상태로 작업을 종료하면 안 된다.

- TODO만 남긴 화면
- 가짜 투표 집계
- 외부 API 키가 없어 앱 전체가 깨지는 구조
- 모바일에서 버튼이 겹치는 화면
- 관리자 비밀번호가 소스에 평문 노출
- Supabase service role key가 프런트엔드에 포함
- GitHub Pages 새로고침 404
- 식당 가격이나 룸 정보를 확정 사실처럼 과장

---

# 22. 앱 문구 모음

## 상단 제목

```text
우리 가족의 소중한 팔순 식사
함께 골라요
```

## 선택 안내

```text
가고 싶은 식당을 최대 세 곳 골라 순서를 정해 주세요.
1순위 3점 · 2순위 2점 · 3순위 1점
```

## 정보 주의

```text
가격과 메뉴, 룸 운영은 달라질 수 있어요.
최종 예약 전 식당에 다시 확인합니다.
```

## 마감

```text
가족 투표가 마감됐어요.
모두의 선택을 모은 결과를 확인해 보세요.
```

## 최종 예약 전

```text
투표 1위가 바로 확정 식당은 아니에요.
상위 후보의 16명 룸, 어르신 이동, 메뉴와 주차를 확인한 뒤 최종 예약합니다.
```

---

# 23. 지금 바로 수행할 작업

1. 위 요구사항을 읽고 구현 계획을 짧게 작성한다.
2. React + TypeScript + Vite 프로젝트를 생성한다.
3. 모바일 UI와 데모 데이터를 먼저 완성한다.
4. Supabase SQL과 실제 데이터 연동을 구현한다.
5. 관리자 기능을 구현한다.
6. 테스트와 빌드를 실행하고 오류를 수정한다.
7. GitHub Pages 워크플로를 생성한다.
8. 한국어 README를 완성한다.
9. 프로젝트가 실제로 동작하는 상태에서 완료 보고한다.

**프로젝트명 제안:** `jeonju-parents-80th-vote`  
**화면 표시명:** `우리 가족 팔순 식사 투표`
