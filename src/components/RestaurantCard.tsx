import { Check, MapPin, Plus } from 'lucide-react'
import type { Restaurant } from '../types'
import { categoryLabel, categoryPlaceholder } from '../data/categories'
import { formatPriceRange } from '../lib/format'
import { StatusBadge } from './common'

interface RestaurantCardProps {
  restaurant: Restaurant
  selected: boolean
  selectedRank?: number
  disabledAdd?: boolean
  onOpen: () => void
  onToggle: () => void
}

export function RestaurantCard({
  restaurant: r,
  selected,
  selectedRank,
  disabledAdd,
  onOpen,
  onToggle,
}: RestaurantCardProps) {
  return (
    <article className={`card ${selected ? 'card--selected' : ''}`}>
      <div className="rcard__head">
        <img
          className="rcard__thumb"
          src={categoryPlaceholder(r.category)}
          alt=""
          width={64}
          height={64}
          loading="lazy"
        />
        <div className="rcard__headtext">
          <div className="badge-row" style={{ marginBottom: 6 }}>
            <span className="badge badge--category">{categoryLabel(r.category)}</span>
            {selected && (
              <span className="rcard__picked">
                <Check size={13} aria-hidden="true" />
                {selectedRank}순위로 담음
              </span>
            )}
          </div>
          <h3 className="rcard__name">{r.name}</h3>
          <p className="rcard__summary">{r.summary}</p>
        </div>
      </div>

      <div className="rcard__price">
        {formatPriceRange(r.priceMin, r.priceMax)} <small>1인 기준</small>
      </div>

      <div className="badge-row" style={{ marginTop: 12 }}>
        <StatusBadge level={r.fit.room} label="16명 룸" />
        <StatusBadge level={r.fit.parking} label="주차" />
        <StatusBadge level={r.fit.access} label="이동" />
      </div>

      <div className="rcard__addr" style={{ marginTop: 12 }}>
        <MapPin size={15} aria-hidden="true" />
        <span>{r.address}</span>
      </div>

      <div className="btn-row" style={{ marginTop: 14 }}>
        <button className="btn btn--outline btn--sm" onClick={onOpen}>
          자세히
        </button>
        <button
          className={`btn btn--sm ${selected ? 'btn--outline' : 'btn--gold'}`}
          onClick={onToggle}
          disabled={!selected && disabledAdd}
          aria-pressed={selected}
        >
          {selected ? (
            <>
              <Check size={16} aria-hidden="true" />
              담김
            </>
          ) : (
            <>
              <Plus size={16} aria-hidden="true" />
              투표함에 담기
            </>
          )}
        </button>
      </div>
    </article>
  )
}
