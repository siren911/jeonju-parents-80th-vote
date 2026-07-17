import { ChevronUp, ChevronDown, X } from 'lucide-react'
import type { Restaurant } from '../types'
import { scoreForRank } from '../lib/scoring'

interface RankEditorProps {
  orderedIds: string[]
  restaurants: Restaurant[]
  onMove: (id: string, dir: -1 | 1) => void
  onRemove: (id: string) => void
}

/**
 * 순위 편집기.
 * 위/아래 버튼을 기본 조작으로 제공한다(터치 스크롤과 충돌하는 드래그를 강제하지 않음).
 * 각 항목은 44px 이상 터치 타깃을 가진다.
 */
export function RankEditor({ orderedIds, restaurants, onMove, onRemove }: RankEditorProps) {
  const nameOf = (id: string) => restaurants.find((r) => r.id === id)?.name ?? id

  return (
    <ul className="stack" style={{ display: 'grid', gap: 10 }}>
      {orderedIds.map((id, i) => {
        const rank = i + 1
        return (
          <li key={id} className="rank-item">
            <span className={`rank-badge rank-badge--${rank}`} aria-hidden="true">
              {rank}
              <small>순위</small>
            </span>
            <div className="rank-item__text">
              <div className="rank-item__name">{nameOf(id)}</div>
              <div className="rank-item__meta">{scoreForRank(rank)}점 반영</div>
            </div>
            <div className="rank-item__ctrl">
              <button
                className="icon-btn"
                onClick={() => onMove(id, -1)}
                disabled={i === 0}
                aria-label={`${nameOf(id)} 순위 올리기`}
              >
                <ChevronUp size={18} aria-hidden="true" />
              </button>
              <button
                className="icon-btn"
                onClick={() => onMove(id, 1)}
                disabled={i === orderedIds.length - 1}
                aria-label={`${nameOf(id)} 순위 내리기`}
              >
                <ChevronDown size={18} aria-hidden="true" />
              </button>
            </div>
            <button
              className="icon-btn icon-btn--remove"
              onClick={() => onRemove(id)}
              aria-label={`${nameOf(id)} 선택 삭제`}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
