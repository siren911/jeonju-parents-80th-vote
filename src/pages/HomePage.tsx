import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, ShieldCheck } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { DemoBanner } from '../components/DemoBanner'
import { EventHero } from '../components/EventHero'
import { Notice, RestaurantSkeleton } from '../components/common'
import { useEventData } from '../hooks/useEventData'
import { INFO_DISCLAIMER } from '../data/restaurants'

export function HomePage() {
  const { event, participation, loading, error, reload } = useEventData()

  return (
    <>
      <DemoBanner />
      <AppHeader title="우리 가족 팔순 식사 투표" showShare />
      <main className="page">
        <div className="wrap stack">
          {loading && !event && (
            <>
              <div className="skeleton" style={{ height: 260, borderRadius: 18 }} />
              <RestaurantSkeleton />
            </>
          )}

          {error && !loading && (
            <Notice tone="error" icon={<AlertTriangle size={18} aria-hidden="true" />}>
              {error}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn--outline btn--sm" onClick={reload}>
                  다시 시도
                </button>
              </div>
            </Notice>
          )}

          {event && (
            <>
              <EventHero event={event} participation={participation} />

              <Notice tone="info" icon={<AlertTriangle size={18} aria-hidden="true" />}>
                {INFO_DISCLAIMER}
              </Notice>

              <div className="btn-row">
                <Link to="/results" className="btn btn--outline">
                  <BarChart3 size={18} aria-hidden="true" />
                  결과 보기
                </Link>
              </div>

              <Notice tone="ok" icon={<ShieldCheck size={18} aria-hidden="true" />}>
                확인번호는 원문으로 저장되지 않아요. 가족을 구분하는 용도로만 안전하게 사용됩니다.
              </Notice>
            </>
          )}
        </div>
      </main>
    </>
  )
}
