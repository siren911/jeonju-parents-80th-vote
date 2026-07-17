import { Check } from 'lucide-react'
import { Sheet } from './Sheet'

export interface Filters {
  under50k: boolean
  under100k: boolean
  room16: boolean
  parking: boolean
  access: boolean
}

export const EMPTY_FILTERS: Filters = {
  under50k: false,
  under100k: false,
  room16: false,
  parking: false,
  access: false,
}

const OPTIONS: { key: keyof Filters; label: string }[] = [
  { key: 'under50k', label: '1인 5만 원 이하' },
  { key: 'under100k', label: '1인 10만 원 이하' },
  { key: 'room16', label: '16명 룸 유력' },
  { key: 'parking', label: '주차 가능' },
  { key: 'access', label: '어르신 이동 편리' },
]

interface FilterSheetProps {
  value: Filters
  onChange: (f: Filters) => void
  onClose: () => void
}

export function FilterSheet({ value, onChange, onClose }: FilterSheetProps) {
  const toggle = (k: keyof Filters) => onChange({ ...value, [k]: !value[k] })
  const activeCount = Object.values(value).filter(Boolean).length

  return (
    <Sheet
      title="상세 필터"
      onClose={onClose}
      footer={
        <div className="btn-row">
          <button className="btn btn--ghost" onClick={() => onChange(EMPTY_FILTERS)}>
            초기화
          </button>
          <button className="btn btn--primary" onClick={onClose}>
            {activeCount > 0 ? `${activeCount}개 적용하고 보기` : '닫기'}
          </button>
        </div>
      }
    >
      <ul className="stack" style={{ display: 'grid', gap: 10 }}>
        {OPTIONS.map((o) => {
          const on = value[o.key]
          return (
            <li key={o.key}>
              <button
                className={`card card--flat ${on ? 'card--selected' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 52,
                }}
                onClick={() => toggle(o.key)}
                aria-pressed={on}
              >
                <span style={{ fontWeight: 600 }}>{o.label}</span>
                <span
                  className={`badge ${on ? 'badge--ok' : 'badge--unknown'}`}
                  style={{ minWidth: 28, justifyContent: 'center' }}
                >
                  {on ? <Check size={15} aria-hidden="true" /> : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="section-desc" style={{ marginTop: 16 }}>
        아직 확인되지 않은 정보(미확인)는 필터에서 제외될 수 있어요. 최종 조건은 예약 전 전화로 확인해 주세요.
      </p>
    </Sheet>
  )
}
