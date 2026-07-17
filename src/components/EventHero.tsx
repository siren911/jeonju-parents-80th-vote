import { Link } from 'react-router-dom'
import { UtensilsCrossed, Share2 } from 'lucide-react'
import type { PublicEvent } from '../types'
import { formatDeadline, formatEventDate, formatWon } from '../lib/format'
import { isVotingClosed } from '../lib/validation'
import { IS_DEMO } from '../lib/supabase'
import { shareEvent } from '../lib/share'
import { useToast } from '../hooks/useToast'

interface EventHeroProps {
  event: PublicEvent
  participation: number
}

export function EventHero({ event, participation }: EventHeroProps) {
  const toast = useToast()
  const closed = isVotingClosed(event.isOpen, event.voteDeadline)

  const statusBadge = IS_DEMO ? (
    <span className="badge badge--demo">데모 모드</span>
  ) : closed ? (
    <span className="badge badge--closed">투표 마감</span>
  ) : (
    <span className="badge badge--live">투표 진행 중</span>
  )

  const onShare = async () => {
    const r = await shareEvent()
    if (r === 'copied') toast.show('링크를 복사했어요. 가족 단체방에 붙여넣어 주세요.')
    else if (r === 'failed') toast.show('공유하지 못했어요. 주소창의 링크를 복사해 주세요.')
  }

  return (
    <section className="hero">
      <div className="hero__rule" aria-hidden="true" />
      <div style={{ marginBottom: 12 }}>{statusBadge}</div>
      <h2 className="hero__title">
        우리 가족의 소중한 팔순 식사
        <br />
        함께 골라요
      </h2>
      <p className="hero__sub">
        전주 · {event.expectedGuests}명 미만 · 1인 약 {formatWon(event.budgetPerPerson)} 이내
        <br />
        한식, 중식, 일식, 한우 후보를 비교하고
        <br />
        가고 싶은 식당 세 곳을 골라주세요.
      </p>

      <div className="hero__meta">
        <div className="hero__meta-item">
          <div className="hero__meta-label">행사 날짜</div>
          <div className="hero__meta-value">{formatEventDate(event.eventDate)}</div>
        </div>
        <div className="hero__meta-item">
          <div className="hero__meta-label">예상 인원</div>
          <div className="hero__meta-value">{event.expectedGuests}명 미만</div>
        </div>
        <div className="hero__meta-item">
          <div className="hero__meta-label">투표 마감</div>
          <div className="hero__meta-value">{formatDeadline(event.voteDeadline)}</div>
        </div>
        <div className="hero__meta-item">
          <div className="hero__meta-label">현재 참여</div>
          <div className="hero__meta-value">{participation}명</div>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 20 }}>
        <Link to="/restaurants" className="btn btn--primary">
          <UtensilsCrossed size={18} aria-hidden="true" />
          식당 둘러보기
        </Link>
        <button className="btn btn--outline" onClick={onShare}>
          <Share2 size={18} aria-hidden="true" />
          공유하기
        </button>
      </div>

      <p className="hero__sub" style={{ fontSize: 'var(--fs-caption)', marginTop: 16 }}>
        가격·메뉴·룸은 예약 전 식당에 최종 확인합니다.
      </p>
    </section>
  )
}
