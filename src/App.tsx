import { HashRouter, Route, Routes, Link } from 'react-router-dom'
import { EventDataProvider } from './hooks/useEventData'
import { BallotProvider } from './hooks/useBallot'
import { ToastProvider } from './hooks/useToast'
import { TextSizeProvider } from './hooks/useTextSize'
import { HomePage } from './pages/HomePage'
import { RestaurantsPage } from './pages/RestaurantsPage'
import { BallotPage } from './pages/BallotPage'
import { DonePage } from './pages/DonePage'
import { ResultsPage } from './pages/ResultsPage'
import { AdminPage } from './pages/AdminPage'
import { EmptyState } from './components/common'
import { Compass } from 'lucide-react'

function NotFound() {
  return (
    <main className="page">
      <div className="wrap">
        <EmptyState
          icon={<Compass size={40} aria-hidden="true" />}
          title="페이지를 찾을 수 없어요"
          desc="주소가 바뀌었을 수 있어요."
          action={
            <Link to="/" className="btn btn--primary">
              처음 화면으로
            </Link>
          }
        />
      </div>
    </main>
  )
}

export default function App() {
  return (
    <TextSizeProvider>
      <ToastProvider>
        {/* HashRouter: GitHub Pages 새로고침 404 방지 */}
        <HashRouter>
          <EventDataProvider>
            <BallotProvider>
              <div className="app-shell">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantsPage />} />
                  <Route path="/ballot" element={<BallotPage />} />
                  <Route path="/done" element={<DonePage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BallotProvider>
          </EventDataProvider>
        </HashRouter>
      </ToastProvider>
    </TextSizeProvider>
  )
}
