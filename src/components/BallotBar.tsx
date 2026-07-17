import { Link } from 'react-router-dom'
import { useEventData } from '../hooks/useEventData'
import { useBallot } from '../hooks/useBallot'
import { MAX_CHOICES } from '../lib/validation'

/**
 * 하단 고정 투표함.
 * aria-live 로 선택 수 변화를 스크린리더에 알린다.
 * safe-area 는 .ballotbar CSS에서 반영된다.
 */
export function BallotBar() {
  const { restaurants } = useEventData()
  const { selected } = useBallot()

  if (selected.length === 0) return null

  const names = selected.map((id) => restaurants.find((r) => r.id === id)?.name ?? '').filter(Boolean)

  return (
    <div className="ballotbar">
      <div className="ballotbar__inner">
        <div className="ballotbar__info">
          <div className="ballotbar__count" aria-live="polite">
            선택 {selected.length}/{MAX_CHOICES}
          </div>
          <div className="ballotbar__list">
            {names.map((n, i) => `${i + 1}순위 ${n}`).join(' · ')}
          </div>
        </div>
        <Link to="/ballot" className="btn btn--primary ballotbar__cta">
          순서 정하기
        </Link>
      </div>
    </div>
  )
}
