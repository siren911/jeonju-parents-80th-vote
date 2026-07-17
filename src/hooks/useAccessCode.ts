import { useEffect, useState } from 'react'
import { EVENT_SLUG } from '../lib/supabase'

/**
 * 공유 행사 코드 처리 (지시서 6.6 확정).
 * 가족은 코드를 직접 입력하지 않는다. 카톡 공유 링크의 쿼리(?c=코드)에서 읽어
 * sessionStorage 에 보관하고 투표 제출 시 자동으로 사용한다.
 *
 * HashRouter 이므로 코드는 해시 뒤 쿼리에 온다:
 *   https://.../#/?c=코드
 *   https://.../#/restaurants?c=코드
 */
const KEY = `parents80-accesscode:${EVENT_SLUG}`

function readFromUrl(): string | null {
  // 1) 해시 안의 쿼리(#/path?c=...)
  const hash = window.location.hash // "#/?c=abc" 또는 "#/restaurants?c=abc"
  const qIndex = hash.indexOf('?')
  if (qIndex >= 0) {
    const params = new URLSearchParams(hash.slice(qIndex + 1))
    const c = params.get('c')
    if (c) return c
  }
  // 2) 일반 쿼리(?c=...#/...) 도 대비
  const search = new URLSearchParams(window.location.search)
  const c2 = search.get('c')
  if (c2) return c2
  return null
}

export function useAccessCode(): string | null {
  const [code, setCode] = useState<string | null>(() => {
    const fromUrl = readFromUrl()
    if (fromUrl) {
      try {
        sessionStorage.setItem(KEY, fromUrl)
      } catch {
        /* ignore */
      }
      return fromUrl
    }
    try {
      return sessionStorage.getItem(KEY)
    } catch {
      return null
    }
  })

  useEffect(() => {
    // 해시가 바뀔 때(라우팅) 코드가 새로 들어오면 갱신
    const onHash = () => {
      const c = readFromUrl()
      if (c && c !== code) {
        try {
          sessionStorage.setItem(KEY, c)
        } catch {
          /* ignore */
        }
        setCode(c)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [code])

  return code
}
