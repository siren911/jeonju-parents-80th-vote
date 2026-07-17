import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Clipboard, Lock, MessageCircle, Trophy } from 'lucide-react'
import type { ResultsPayload } from '../types'
import { AppHeader } from '../components/AppHeader'
import { DemoBanner } from '../components/DemoBanner'
import { ResultBar } from '../components/ResultBar'
import { EmptyState, Notice } from '../components/common'
import { useEventData } from '../hooks/useEventData'
import { fetchResults } from '../lib/api'
import { buildResultSummary, copyText } from '../lib/share'
import { canShowResults } from '../lib/validation'
import { useToast } from '../hooks/useToast'

export function ResultsPage() {
  const { event, participation } = useEventData()
  const toast = useToast()
  const [results, setResults] = useState<ResultsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const open = event
    ? canShowResults(event.isOpen, event.voteDeadline, event.showLiveResults)
    : false

  useEffect(() => {
    if (!event) return
    if (!open) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    fetchResults()
      .then((r) => alive && setResults(r))
      .catch((e) => alive && setError(e instanceof Error ? e.message : '결과를 불러오지 못했어요.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [event, open])

  const onCopy = async () => {
    if (!results) return
    const r = await copyText(buildResultSummary(results))
    toast.show(r === 'failed' ? '복사하지 못했어요.' : '결과 요약을 복사했어요. 가족 단체방에 붙여넣어 주세요.')
  }

  // 아직 공개 조건이 아닐 때
  if (event && !open) {
    return (
      <>
        <DemoBanner />
        <AppHeader title="투표 결과" back="/" showShare />
        <main className="page">
          <div className="wrap">
            <EmptyState
              icon={<Lock size={40} aria-hidden="true" />}
              title="결과는 투표 마감 후 공개됩니다"
              desc={`현재 ${participation}명이 참여했어요.`}
              action={
                <Link to="/restaurants" className="btn btn--primary">
                  나도 투표하기
                </Link>
              }
            />
          </div>
        </main>
      </>
    )
  }

  const maxScore = results ? Math.max(1, ...results.rows.map((r) => r.totalScore)) : 1
  const winner = results?.rows.find((r) => r.rank === 1)
  const top3 = results?.rows.filter((r) => r.rank <= 3) ?? []

  return (
    <>
      <DemoBanner />
      <AppHeader title="투표 결과" back="/" showShare />
      <main className="page">
        <div className="wrap stack">
          {loading && <div className="skeleton" style={{ height: 200, borderRadius: 18 }} />}

          {error && (
            <Notice tone="error" icon={<AlertTriangle size={18} aria-hidden="true" />}>
              {error}
            </Notice>
          )}

          {results && results.participantCount === 0 && (
            <EmptyState
              icon={<BarChart3 size={40} aria-hidden="true" />}
              title="아직 투표가 없어요"
              desc="첫 번째로 가족의 선택을 남겨보세요."
              action={
                <Link to="/restaurants" className="btn btn--primary">
                  식당 둘러보기
                </Link>
              }
            />
          )}

          {results && results.participantCount > 0 && (
            <>
              <p className="section-desc" style={{ textAlign: 'center' }}>
                총 {results.participantCount}명이 참여했어요
              </p>

              {winner && (
                <div className="winner">
                  <div className="winner__label">
                    <Trophy size={14} aria-hidden="true" style={{ verticalAlign: -2 }} /> 현재 1위
                  </div>
                  <div className="winner__name">{winner.name}</div>
                  <div className="winner__score">
                    {winner.totalScore}점 · 1순위 {winner.firstChoiceCount}표
                    {winner.isTied && ' · 공동 1위'}
                  </div>
                </div>
              )}

              <div className="card">
                {results.rows.map((row) => (
                  <ResultBar key={row.restaurantId} row={row} maxScore={maxScore} />
                ))}
              </div>

              {results.rows.some((r) => r.isTied) && (
                <Notice tone="info" icon={<AlertTriangle size={18} aria-hidden="true" />}>
                  동점인 식당이 있어요. 총점 → 1순위 표 수 → 전체 선택 수 순으로 비교하고, 그래도 같으면 공동 순위로 표시돼요.
                </Notice>
              )}

              {/* 가족 의견 모음 */}
              {results.comments.length > 0 && (
                <div>
                  <h3 className="section-title" style={{ fontSize: 'var(--fs-lead)' }}>
                    <MessageCircle size={18} aria-hidden="true" style={{ verticalAlign: -3 }} /> 가족 의견
                  </h3>
                  <div className="stack" style={{ marginTop: 12 }}>
                    {results.comments.map((c, i) => (
                      <div className="card card--flat" key={i} style={{ padding: 'var(--sp-3)' }}>
                        <p style={{ fontSize: 'var(--fs-sm)' }}>“{c}”</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn--primary btn--block" onClick={onCopy}>
                <Clipboard size={18} aria-hidden="true" />
                결과 요약 복사
              </button>

              <Notice tone="info" icon={<AlertTriangle size={18} aria-hidden="true" />}>
                투표 1위가 바로 확정 식당은 아니에요. 상위 후보 {top3.length}곳의 16명 룸, 어르신 이동, 메뉴와
                주차를 확인한 뒤 최종 예약합니다.
              </Notice>
            </>
          )}
        </div>
      </main>
    </>
  )
}
