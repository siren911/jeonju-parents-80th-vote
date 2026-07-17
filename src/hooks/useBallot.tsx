import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { EVENT_SLUG } from '../lib/supabase'
import { MAX_CHOICES } from '../lib/validation'

/**
 * 투표함 선택 상태 (순서 = 순위).
 * 새로고침 후에도 유지되도록 sessionStorage에 담는다.
 */
const STORAGE_KEY = `parents80-selection:${EVENT_SLUG}`

interface BallotCtx {
  /** 선택한 식당 id 배열. 앞에서부터 1·2·3순위. */
  selected: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  add: (id: string) => boolean // 성공 여부 (가득 차면 false)
  remove: (id: string) => void
  move: (id: string, dir: -1 | 1) => void
  reorder: (ids: string[]) => void
  clear: () => void
  isFull: boolean
}

const Ctx = createContext<BallotCtx | null>(null)

function load(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX_CHOICES) : []
  } catch {
    return []
  }
}

export function BallotProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    } catch {
      /* 저장 실패는 조용히 무시 (사파리 프라이빗 등) */
    }
  }, [selected])

  const isSelected = useCallback((id: string) => selected.includes(id), [selected])

  const add = useCallback((id: string): boolean => {
    let ok = false
    setSelected((prev) => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX_CHOICES) return prev
      ok = true
      return [...prev, id]
    })
    return ok
  }, [])

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((x) => x !== id))
  }, [])

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_CHOICES) return prev
      return [...prev, id]
    })
  }, [])

  const move = useCallback((id: string, dir: -1 | 1) => {
    setSelected((prev) => {
      const i = prev.indexOf(id)
      if (i < 0) return prev
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }, [])

  const reorder = useCallback((ids: string[]) => setSelected(ids.slice(0, MAX_CHOICES)), [])
  const clear = useCallback(() => setSelected([]), [])

  const value = useMemo<BallotCtx>(
    () => ({
      selected,
      isSelected,
      toggle,
      add,
      remove,
      move,
      reorder,
      clear,
      isFull: selected.length >= MAX_CHOICES,
    }),
    [selected, isSelected, toggle, add, remove, move, reorder, clear],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBallot(): BallotCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useBallot must be used within BallotProvider')
  return ctx
}
