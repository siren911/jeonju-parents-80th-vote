import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const forceDemo = (import.meta.env.VITE_DEMO_MODE as string | undefined) === 'true'

export const EVENT_SLUG =
  (import.meta.env.VITE_EVENT_SLUG as string | undefined) || 'parents80-jeonju-7f9k2m'

/**
 * 데모 모드 판정:
 *  - VITE_DEMO_MODE=true 이거나
 *  - Supabase URL/KEY 가 비어 있으면 데모 모드로 동작한다.
 * 데모 모드에서는 투표가 이 기기(localStorage)에만 저장된다.
 */
export const IS_DEMO = forceDemo || !url || !key

/**
 * ★ 안전장치: 혹시라도 service_role/secret 키가 들어오면 앱을 멈춘다.
 * publishable(anon) 키는 보통 'sb_publishable_' 또는 레거시 'eyJ...'(role:anon) 형태다.
 * secret 키 접두사가 감지되면 브라우저에서 절대 쓰지 않는다.
 */
if (key && /^(sb_secret_|service_role)/.test(key)) {
  throw new Error(
    '보안 오류: service_role/secret 키가 감지되었습니다. 브라우저에는 publishable(anon) 키만 사용하세요.',
  )
}

export const supabase: SupabaseClient | null =
  IS_DEMO || !url || !key
    ? null
    : createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // 매직링크 대신 OTP를 쓰므로 URL 세션 감지는 끈다 (HashRouter 충돌 방지)
          detectSessionInUrl: false,
        },
      })

/** supabase 클라이언트가 필요한데 없을 때 명확한 오류를 던진다 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase가 연결되지 않았습니다. 데모 모드에서는 이 기능을 쓸 수 없습니다.')
  }
  return supabase
}
