# Supabase 설정 안내

이 폴더에는 데이터베이스 스키마와 초기 데이터가 들어 있습니다.

- `schema.sql` — 테이블, RLS 보안 정책, RPC 함수 (직접 작성)
- `seed.sql` — 행사 + 식당 9곳 초기 데이터 (**자동 생성 파일**)

> ⚠ `seed.sql`은 `src/data/restaurants.ts`에서 자동 생성됩니다.
> 식당 정보를 바꾸려면 그 파일을 고친 뒤 `npm run gen:seed`를 실행하세요.
> `seed.sql`을 직접 손으로 수정하면 다음 생성 때 덮어써집니다.

---

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. **Project Settings → API** 에서 아래 두 값을 확인합니다.
   - `Project URL` → `.env`의 `VITE_SUPABASE_URL`
   - `anon public` 키 → `.env`의 `VITE_SUPABASE_PUBLISHABLE_KEY`

> 🔒 **절대 `service_role` / `secret` 키를 `.env`나 브라우저 코드에 넣지 마세요.**
> 프런트엔드에는 `anon public` 키만 사용합니다.

## 2. 스키마 적용

**SQL Editor**에서 순서대로 실행합니다.

1. `schema.sql` 전체를 붙여넣고 실행
2. `seed.sql` 전체를 붙여넣고 실행

## 3. 공유 행사 코드 설정 (필수)

`seed.sql`은 행사 코드를 임시값(`CHANGE-ME`)으로 넣습니다. 실제 코드로 바꿉니다.

SQL Editor에서 아래를 실행하세요. (`우리집팔순2026`을 가족이 쓸 실제 코드로 교체)

```sql
update public.events
set access_code_hash = crypt('우리집팔순2026', gen_salt('bf'))
where slug = 'parents80-jeonju-7f9k2m';
```

이 코드는 **공유 링크에 담겨 자동으로 전달**됩니다. 가족은 직접 입력하지 않습니다.
가족에게 보낼 최종 링크 형태:

```
https://<배포주소>/#/?c=우리집팔순2026
```

> 코드의 목적: 링크를 받은 가족만 투표할 수 있고, 링크 없는 외부인은 막습니다.
> 아주 강력한 보안은 아니지만 가족 행사에는 충분합니다.

## 4. 관리자 계정 등록

관리자는 **이메일 + 비밀번호** 로 로그인합니다.
(무료 플랜은 이메일 템플릿을 못 바꿔 OTP 코드 발송이 어렵고, 매직링크는 HashRouter와
충돌하므로, 이메일 발송이 전혀 필요 없는 비밀번호 방식을 씁니다.)

**① 관리자 사용자 만들기**
- **Authentication → Users → Add user → Create new user**
- 이메일과 비밀번호를 입력하고 **"Auto Confirm User"(자동 확인)** 를 켜서 생성합니다.

**② admins 테이블에 등록** (SQL Editor)
```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@example.com'
on conflict do nothing;
```

이제 그 이메일+비밀번호로 앱 `#/admin`에서 로그인하면 관리자 기능이 열립니다.

## 5. 보안 점검 (RLS 확인)

아래가 모두 성립해야 정상입니다.

- ✅ 익명 사용자가 `ballots`, `family_members`, `events`를 직접 SELECT → **불가**
- ✅ 익명 사용자가 어느 테이블이든 직접 INSERT/UPDATE/DELETE → **불가**
- ✅ `submit_ballot` RPC를 통한 정상 투표 → 가능
- ✅ 다른 행사의 식당 id로 투표 → `restaurant_not_in_event` 오류
- ✅ 마감 이후 투표 → `voting_closed` 오류
- ✅ 잘못된 행사 코드로 투표 → `invalid_access_code` 오류
- ✅ 관리자 RPC를 비관리자가 호출 → `not_admin` 오류

간단 확인 예시(anon 키로 실행 시 빈 결과/권한 오류가 나야 정상):

```sql
-- 익명으로 실행하면 0행이거나 권한 오류가 나야 한다
select * from public.ballots;
```

## 6. 자동 점검 스크립트

`schema.sql` + `seed.sql`을 적용한 뒤, **`verify.sql`을 SQL Editor에서 실행**하면
위 보안 항목이 제대로 걸렸는지 한 번에 확인할 수 있습니다.
결과 메시지(Messages 탭)가 모두 ✅ 이면 정상입니다.

## 7. 문제 해결 (Troubleshooting)

| 증상 | 원인 / 해결 |
| --- | --- |
| 앱이 계속 "데모 모드" 배너를 보여줌 | `.env`의 `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`가 비었거나 `VITE_DEMO_MODE=true`. 값을 채우고 **개발 서버를 재시작**하세요(.env는 재시작해야 반영). |
| "보안 오류: service_role/secret 키가 감지되었습니다" | `anon public` 키가 아니라 secret 키를 넣었습니다. Project Settings → API의 **anon public** 키로 교체하세요. |
| 투표 시 `invalid_access_code` | 링크에 `?c=코드`가 없거나, DB의 코드와 다릅니다. README 3번으로 코드를 다시 설정하고 `#/?c=코드` 링크로 접속하세요. |
| 투표 시 `event_not_found` | `.env`의 `VITE_EVENT_SLUG`와 `seed.sql`의 slug가 다릅니다. 둘을 일치시키세요. |
| 결과가 계속 "마감 후 공개"만 나옴 | 정상 동작입니다. 관리자 화면에서 **실시간 결과 공개**를 켜거나 투표를 **마감**하면 결과가 보입니다. |
| 관리자 로그인 후 "관리자로 등록되지 않은 계정" | 로그인은 됐지만 `admins` 테이블에 없습니다. README 4번의 insert를 실행하세요. |
| OTP 코드 이메일이 안 옴 | Authentication → Providers → **Email**이 켜져 있는지, 스팸함을 확인하세요. Supabase 무료 플랜은 발송량 제한이 있습니다. |
| `verify.sql`에서 익명 SELECT가 행을 반환(❌) | RLS가 꺼졌거나 실수로 SELECT 정책을 추가한 경우입니다. `schema.sql`을 다시 실행하세요. |

## 8. 개인정보 관련

- 개인 확인번호(PIN) 원문은 **저장하지 않습니다.** 이름+PIN+행사id를 SHA-256 해시한 `voter_key`만 저장합니다.
- 공개 결과 화면에는 이름·확인번호·의견 작성자가 노출되지 않습니다.
- CSV 원자료(이름 포함)는 관리자만 `export_ballots` RPC로 받을 수 있습니다.
