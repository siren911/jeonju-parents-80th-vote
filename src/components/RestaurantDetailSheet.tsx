import { Check, Phone, MapPin, ExternalLink, Copy, AlertTriangle } from 'lucide-react'
import type { Restaurant } from '../types'
import { categoryLabel, FIT_FIELDS } from '../data/categories'
import { formatPriceRange, formatVerified } from '../lib/format'
import { copyText } from '../lib/share'
import { Sheet } from './Sheet'
import { StatusBadge, Notice } from './common'
import { useToast } from '../hooks/useToast'

interface Props {
  restaurant: Restaurant
  selected: boolean
  disabledAdd: boolean
  onToggle: () => void
  onClose: () => void
}

export function RestaurantDetailSheet({ restaurant: r, selected, disabledAdd, onToggle, onClose }: Props) {
  const toast = useToast()

  const onCopyAddr = async () => {
    const ok = await copyText(r.address)
    toast.show(ok === 'failed' ? '복사하지 못했어요.' : '주소를 복사했어요.')
  }

  return (
    <Sheet
      title={r.name}
      onClose={onClose}
      footer={
        <div className="btn-row">
          {r.phone && (
            <a className="btn btn--outline" href={`tel:${r.phone.replace(/[^0-9]/g, '')}`}>
              <Phone size={18} aria-hidden="true" />
              전화 걸기
            </a>
          )}
          <button
            className={`btn ${selected ? 'btn--outline' : 'btn--gold'}`}
            onClick={onToggle}
            disabled={!selected && disabledAdd}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <Check size={18} aria-hidden="true" />
                투표함에 담김
              </>
            ) : (
              '투표함에 담기'
            )}
          </button>
        </div>
      }
    >
      <div className="stack">
        <div className="badge-row">
          <span className="badge badge--category">{categoryLabel(r.category)}</span>
        </div>

        <p style={{ color: 'var(--c-ink-soft)' }}>{r.description}</p>

        <div className="rcard__price">
          {formatPriceRange(r.priceMin, r.priceMax)} <small>1인 기준</small>
        </div>

        {/* 팔순 행사 관점 평가 6항목 */}
        <div>
          <h3 className="field__label">팔순 행사 관점 점검</h3>
          <div className="evalgrid">
            {FIT_FIELDS.map((f) => (
              <div className="evalgrid__item" key={f.key}>
                <div className="evalgrid__label">{f.label}</div>
                <div className="evalgrid__value">
                  <StatusBadge level={r.fit[f.key]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 포인트 */}
        {r.pros.length > 0 && (
          <div>
            <h3 className="field__label">추천 포인트</h3>
            <ul className="checklist">
              {r.pros.map((p, i) => (
                <li key={i}>
                  <Check size={16} aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 확인해야 할 사항 */}
        {r.checkPoints.length > 0 && (
          <Notice tone="warn" icon={<AlertTriangle size={18} aria-hidden="true" />}>
            <strong>예약 전 확인하세요</strong>
            <ul style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              {r.checkPoints.map((c, i) => (
                <li key={i}>· {c}</li>
              ))}
            </ul>
          </Notice>
        )}

        {/* 기본 정보 */}
        <dl className="deflist">
          <div className="deflist__row">
            <dt className="deflist__dt">추천 메뉴</dt>
            <dd className="deflist__dd">{r.recommendedMenu}</dd>
          </div>
          <div className="deflist__row">
            <dt className="deflist__dt">룸·수용</dt>
            <dd className="deflist__dd">{r.capacityNote}</dd>
          </div>
          <div className="deflist__row">
            <dt className="deflist__dt">주소</dt>
            <dd className="deflist__dd">
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <MapPin size={15} aria-hidden="true" style={{ marginTop: 3, flex: '0 0 auto' }} />
                <span>{r.address}</span>
              </div>
              <button
                className="btn btn--ghost btn--sm"
                onClick={onCopyAddr}
                style={{ marginTop: 6, paddingLeft: 0 }}
              >
                <Copy size={15} aria-hidden="true" />
                주소 복사
              </button>
            </dd>
          </div>
          {r.phone && (
            <div className="deflist__row">
              <dt className="deflist__dt">전화</dt>
              <dd className="deflist__dd">{r.phone}</dd>
            </div>
          )}
        </dl>

        {/* 지도 링크: 새 창, noopener */}
        <div className="btn-row">
          <a className="btn btn--outline btn--sm" href={r.naverMapUrl} target="_blank" rel="noopener noreferrer">
            네이버지도
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a className="btn btn--outline btn--sm" href={r.kakaoMapUrl} target="_blank" rel="noopener noreferrer">
            카카오맵
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        {/* 정보 근거: 출처 + 마지막 확인일 항상 노출 */}
        <div className="source-note">
          <span>마지막 확인일 {formatVerified(r.lastVerified)}</span>
          <span>·</span>
          <span>{r.verificationNote}</span>
          {r.sourceUrl && (
            <>
              <span>·</span>
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
                참고 출처
              </a>
            </>
          )}
        </div>
      </div>
    </Sheet>
  )
}
