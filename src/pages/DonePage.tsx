import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { DemoBanner } from '../components/DemoBanner'

export function DonePage() {
  return (
    <>
      <DemoBanner />
      <AppHeader title="투표 완료" back="/" showShare />
      <main className="page">
        <div className="wrap stack" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div style={{ color: 'var(--c-green)' }}>
            <CheckCircle2 size={64} aria-hidden="true" style={{ margin: '0 auto' }} />
          </div>
          <h2 className="section-title">투표가 저장됐어요</h2>
          <p className="section-desc" style={{ fontSize: 'var(--fs-body)' }}>
            마감 전까지 같은 이름과 확인번호로 다시 들어오면
            <br />
            언제든 수정할 수 있어요.
          </p>

          <div className="stack" style={{ marginTop: 12 }}>
            <Link to="/results" className="btn btn--primary btn--block">
              현재까지 결과 보기
            </Link>
            <Link to="/restaurants" className="btn btn--outline btn--block">
              식당 다시 둘러보기
            </Link>
            <Link to="/" className="btn btn--ghost btn--block">
              처음 화면으로
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
