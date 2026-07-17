import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/** 글자 크게 보기 토글. html[data-textsize=large] 로 전체 rem이 커진다. */
const KEY = 'parents80-textsize'

interface TextSizeCtx {
  large: boolean
  toggle: () => void
}

const Ctx = createContext<TextSizeCtx | null>(null)

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [large, setLarge] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEY) === 'large'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.dataset.textsize = large ? 'large' : 'normal'
    try {
      localStorage.setItem(KEY, large ? 'large' : 'normal')
    } catch {
      /* ignore */
    }
  }, [large])

  return <Ctx.Provider value={{ large, toggle: () => setLarge((v) => !v) }}>{children}</Ctx.Provider>
}

export function useTextSize(): TextSizeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTextSize must be used within TextSizeProvider')
  return ctx
}
