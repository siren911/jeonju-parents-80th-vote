import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastCtx {
  show: (message: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2600)
  }, [])

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {/* aria-live로 스크린리더에도 알림 */}
      <div aria-live="polite" role="status">
        {message && <div className="toast">{message}</div>}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
