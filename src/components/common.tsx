import type { ReactNode } from 'react'
import { Check, Phone, HelpCircle } from 'lucide-react'
import type { StatusLevel } from '../types'
import { STATUS_BADGE_CLASS, STATUS_LABEL } from '../data/categories'

/** 상태 3단계 배지 (색상만으로 표현하지 않도록 아이콘+문구 동반) */
export function StatusBadge({ level, label }: { level: StatusLevel; label?: string }) {
  const Icon = level === 'ok' ? Check : level === 'call' ? Phone : HelpCircle
  return (
    <span className={`badge ${STATUS_BADGE_CLASS[level]}`}>
      <Icon size={13} aria-hidden="true" />
      {label ? `${label} · ` : ''}
      {STATUS_LABEL[level]}
    </span>
  )
}

/** 안내/오류/경고 박스 */
export function Notice({
  tone = 'info',
  icon,
  children,
}: {
  tone?: 'info' | 'warn' | 'error' | 'ok'
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {icon}
      <div>{children}</div>
    </div>
  )
}

/** 빈 상태 */
export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: ReactNode
  title: string
  desc?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty">
      {icon && <div className="empty__icon">{icon}</div>}
      <div className="empty__title">{title}</div>
      {desc && <div className="empty__desc">{desc}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}

/** 식당 카드 스켈레톤 (로딩 체감 속도 개선) */
export function RestaurantSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="rcard__head">
        <div className="skeleton skeleton--thumb" />
        <div className="rcard__headtext" style={{ display: 'grid', gap: 8 }}>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line" style={{ width: '90%' }} />
          <div className="skeleton skeleton--line" style={{ width: '60%' }} />
        </div>
      </div>
      <div className="skeleton skeleton--line" style={{ width: '40%', marginTop: 16 }} />
    </div>
  )
}
