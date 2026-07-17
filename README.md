# 우리 가족 팔순 식사 투표

전주에서 진행하는 부모님 팔순 가족 식사 장소를, 가족들이 모바일로 후보를 보고 투표해 함께 정하는 웹앱입니다.

- 후보 식당 9곳을 장르별(한식·중식·일식·한우)로 비교
- 가고 싶은 식당을 최대 3곳까지 순위로 선택 (1순위 3점 · 2순위 2점 · 3순위 1점)
- 이름 + 개인 확인번호 4자리로 투표 (같은 번호로 다시 들어오면 수정 가능)
- 투표 마감 후 결과 공개, 관리자가 마감·공개 제어

**기술 스택**: React + TypeScript + Vite · Supabase · GitHub Pages · HashRouter

---

## 빠른 시작 (로컬에서 데모 모드로 보기)

Supabase 없이도 바로 화면을 확인할 수 있습니다. (투표는 이 기기에만 저장돼요)

```bash
npm install
npm run dev
```

브라우저에서 안내된 주소(예: http://localhost:5173)를 엽니다.

> 데모 모드에서는 화면 상단에 "현재 데모 모드입니다"가 표시되고, 투표가 브라우저(localStorage)에만 저장됩니다. **가족에게 실제로 공유하기 전에 반드시 아래 Supabase 연결을 완료하세요.**

---

## 실제 사용을 위한 전체 설정 순서

### 1. Supabase 준비

`supabase/README.md`의 안내를 따라주세요. 요약하면:

1. Supabase 프로젝트 생성 → `Project URL`과 `anon public` 키 확인
2. SQL Editor에서 `supabase/schema.sql` 실행 (테이블·보안·함수)
3. SQL Editor에서 `supabase/seed.sql` 실행 (행사 + 식당 9곳)
4. 공유 행사 코드 설정 (아래 SQL의 `우리집팔순2026`을 원하는 코드로 교체)
   ```sql
   update public.events
   set access_code_hash = crypt('우리집팔순2026', gen_salt('bf'))
   where slug = 'parents80-jeonju-7f9k2m';
   ```
5. 관리자 이메일 등록 (`supabase/README.md` 4번 참고)

> 🔒 **`service_role` / `secret` 키는 절대 `.env`나 코드에 넣지 마세요.** 브라우저에는 `anon public` 키만 사용합니다. (앱에 secret 키 감지 시 자동 중단하는 안전장치가 있습니다.)

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env`를 열어 값을 채웁니다.

| 변수 | 설명 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon public 키 |
| `VITE_EVENT_SLUG` | 행사 slug (기본 `parents80-jeonju-7f9k2m`) |
| `VITE_DEMO_MODE` | `false` (실서버 연결). `true`면 강제 데모 모드 |

### 3. 로컬에서 실서버로 확인

```bash
npm run dev
```

상단의 "데모 모드" 배너가 사라지면 Supabase에 정상 연결된 것입니다.

---

## 가족에게 공유하기

가족 단체방에 보낼 최종 링크는 아래 형태입니다. **행사 코드(`?c=`)가 반드시 포함**되어야 투표할 수 있습니다.

```
https://<배포주소>/#/?c=우리집팔순2026
```

- 가족은 코드를 직접 입력하지 않습니다. 링크만 누르면 자동으로 전달됩니다.
- 링크가 없는 외부인은 투표할 수 없습니다.
- 앱 안의 "공유하기" 버튼을 쓰면 현재 링크(코드 포함)가 그대로 공유/복사됩니다.

---

## GitHub Pages 배포

1. GitHub에 저장소를 만들고 코드를 push 합니다.
   ```bash
   git init
   git add .
   git commit -m "우리 가족 팔순 식사 투표"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/jeonju-parents-80th-vote.git
   git push -u origin main
   ```
2. **Settings → Secrets and variables → Actions → Variables** 에 아래 값을 등록합니다.
   (Secrets가 아니라 **Variables** 탭입니다. anon 키는 공개 가능한 값입니다.)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_EVENT_SLUG`
   - `VITE_DEMO_MODE` (`false`)
3. **Settings → Pages → Source** 를 **GitHub Actions** 로 설정합니다.
4. `main`에 push하면 `.github/workflows/deploy.yml`이 자동으로 테스트 → 빌드 → 배포합니다.
5. Actions 탭에서 배포 성공을 확인한 뒤, 배포 URL에 `#/?c=행사코드`를 붙여 가족 단체방에 공유합니다.

> 이 앱은 `HashRouter`와 `base: './'`를 사용하므로 GitHub Pages 하위 경로에서도 새로고침 404가 발생하지 않습니다.

### 카카오톡 공유 미리보기 (OG 이미지)

카카오톡에 링크를 붙였을 때 제목·설명·이미지 카드가 뜨게 하려면:

1. `index.html` 안의 `og:url`, `og:image`에서 `USERNAME.github.io/jeonju-parents-80th-vote` 부분을 **실제 배포 주소로 교체**합니다. (반드시 절대 URL)
2. 미리보기 이미지가 필요합니다. `public/og-image.svg`를 디자인 원본으로 제공하니, 이를 **1200×630 PNG로 변환**해 `public/og-image.png`로 저장하세요.
   - 카카오톡 등 일부 스크래퍼는 SVG를 렌더링하지 못하므로 PNG 권장
   - 온라인 SVG→PNG 변환기나 이미지 편집기로 변환하면 됩니다
3. 카카오톡은 미리보기를 캐시하므로, 바꾼 뒤에도 예전 이미지가 보이면 [카카오 캐시 초기화 도구](https://developers.kakao.com/tool/clear/og)에서 URL 캐시를 지워주세요.

---

## 명령어

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | 단위 테스트 (점수·동점·검증 로직) |
| `npm run gen:seed` | `src/data/restaurants.ts` → `supabase/seed.sql` 재생성 |

---

## 식당 정보 수정 방법

식당 정보는 **`src/data/restaurants.ts` 한 곳**에서만 관리합니다.

1. `src/data/restaurants.ts`에서 원하는 식당 정보를 수정
2. `npm run gen:seed` 실행 → `supabase/seed.sql` 자동 재생성
3. Supabase SQL Editor에서 갱신된 `seed.sql` 실행

> `supabase/seed.sql`을 직접 손으로 고치지 마세요. 다음 생성 때 덮어써집니다.

---

## 주요 파일 구조

```
├─ index.html                  # OG 태그, viewport-fit, color-scheme:light
├─ .github/workflows/deploy.yml
├─ public/
│  ├─ favicon.svg
│  ├─ og-image.svg             # 공유 미리보기 원본 (→ PNG 변환 필요)
│  └─ images/*-placeholder.svg # 장르별 플레이스홀더
├─ src/
│  ├─ data/restaurants.ts      # ★ 식당 정보 단일 원본
│  ├─ lib/                     # scoring, validation, api, supabase, share ...
│  ├─ hooks/                   # 투표 선택, 행사 데이터, 토스트, 글자크기, 행사코드
│  ├─ components/              # 헤더, 카드, 바텀시트, 투표함, 순위편집, 결과막대 ...
│  ├─ pages/                   # Home, Restaurants, Ballot, Done, Results, Admin
│  └─ styles/                  # tokens.css, global.css
├─ scripts/gen-seed.ts         # restaurants.ts → seed.sql
└─ supabase/
   ├─ schema.sql               # 테이블 + RLS + RPC
   ├─ seed.sql                 # 자동 생성
   └─ README.md                # Supabase 설정 안내
```

---

## 보안·개인정보 요약

- 모든 테이블에 RLS(행 수준 보안) 활성화. 익명 사용자는 테이블에 직접 접근 불가.
- 투표 제출은 `security definer` RPC(`submit_ballot`)로만 처리.
- 개인 확인번호(PIN) 원문은 저장하지 않고, `정규화 이름 + PIN + 행사id`의 SHA-256 해시(`voter_key`)만 저장.
- 행사 정보는 `access_code_hash`가 노출되지 않도록 `get_event_public` RPC로만 공개.
- 공개 결과 화면에는 이름·확인번호·의견 작성자가 드러나지 않음.

---

## 확인이 필요한 식당 정보 (중요)

앱에 담긴 식당 정보는 **2026-07-17 기준 참고용**입니다. 영업시간·가격·룸 수용 인원·주차·엘리베이터는 바뀔 수 있어, 앱 곳곳에 "예약 전 전화 재확인" 안내를 넣어두었습니다.

특히 아래 항목은 **최종 예약 전 반드시 전화로 확인**하세요.

- 대표 전화번호가 확인되지 않은 곳: **한식다이닝 늘채움**
- 가격이 공개되지 않아 예산(1인 10만 원) 확인이 필요한 곳: **아월(한우)**, **한참치**, **송림일식**
- 16명 독립룸/2층 이동(엘리베이터) 확인이 특히 중요한 곳: **송림일식**, **한식다이닝 늘채움**
- 공통: 16명 독립룸, 입식 좌석, 어르신 이동 동선, 주차 대수, 케이크 반입, 예약금·취소 규정

각 식당 상세 화면의 "예약 전 확인하세요" 목록에 항목별로 정리되어 있습니다.
