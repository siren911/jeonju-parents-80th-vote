import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** 되돌리기 어려운 동작을 위한 가운데 확인 모달. 포커스 트랩 + Esc. */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const focusable = ref.current?.querySelectorAll<HTMLElement>('button')
    focusable?.[focusable.length - 1]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, busy])

  return (
    <div className="overlay overlay--center" onClick={() => !busy && onCancel()}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog__title" id="confirm-title">
          {title}
        </h2>
        {description && <div className="dialog__desc">{description}</div>}
        <div className="dialog__actions">
          <button className="btn btn--outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="spinner" aria-hidden="true" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
