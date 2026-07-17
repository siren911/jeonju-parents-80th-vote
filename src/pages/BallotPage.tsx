import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Info, ShieldCheck, UtensilsCrossed } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { DemoBanner } from '../components/DemoBanner'
import { RankEditor } from '../components/RankEditor'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState, Notice } from '../components/common'
import { useEventData } from '../hooks/useEventData'
import { useBallot } from '../hooks/useBallot'
import { useAccessCode } from '../hooks/useAccessCode'
import { useToast } from '../hooks/useToast'
import { submitBallot, fetchMyBallot } from '../lib/api'
import { IS_DEMO } from '../lib/supabase'
import {
  displayName,
  isValidName,
  isValidPin,
  isVotingClosed,
  toChoices,
  PIN_LENGTH,
} from '../lib/validation'

export function BallotPage() {
  const navigate = useNavigate()
  const { event, restaurants, reloadParticipation } = useEventData()
  const ballot = useBallot()
  const accessCode = useAccessCode()
  const toast = useToast()

  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [comment, setComment] = useState('')
  const [touched, setTouched] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingMine, setLoadingMine] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const closed = event ? isVotingClosed(event.isOpen, event.voteDeadline) : false
  const nameOk = isValidName(name)
  const pinOk = isValidPin(pin)
  const canSubmit = ballot.selected.length >= 1 && nameOk && pinOk && !closed && !submitting

  // 이름+PIN 입력 후, 기존 투표가 있으면 불러와 수정 모드로 채운다
  const tryLoadMine = async () => {
    if (!nameOk || !pinOk) return
    setLoadingMine(true)
    try {
      const mine = await fetchMyBallot(name, pin)
      if (mine && mine.choices.length > 0) {
        ballot.reorder(mine.choices.map((c) => c.restaurantId))
        setComment(mine.comment)
        toast.show('이전에 낸 투표를 불러왔어요. 수정 후 다시 제출하면 돼요.')
      }
    } catch {
      /* 조회 실패는 조용히 무시 — 새 투표로 진행 */
    } finally {
      setLoadingMine(false)
    }
  }

  const doSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitBallot(accessCode ?? '', {
        voterName: displayName(name),
        pin,
        comment,
        choices: toChoices(ballot.selected),
      })
      reloadParticipation()
      setConfirmOpen(false)
      navigate('/done', { replace: true })
    } catch (e) {
      setConfirmOpen(false)
      setSubmitError(e instanceof Error ? e.message : '투표를 저장하지 못했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (ballot.selected.length === 0) {
    return (
      <>
        <DemoBanner />
        <AppHeader title="투표하기" back="/restaurants" />
        <main className="page">
          <div className="wrap">
            <EmptyState
              icon={<UtensilsCrossed size={40} aria-hidden="true" />}
              title="아직 담은 식당이 없어요"
              desc="식당을 둘러보고 가고 싶은 곳을 최대 세 곳 담아주세요."
              action={
                <button className="btn btn--primary" onClick={() => navigate('/restaurants')}>
                  식당 둘러보기
                </button>
              }
            />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DemoBanner />
      <AppHeader title="투표하기" back="/restaurants" />
      <main className="page">
        <div className="wrap stack">
          <div>
            <h2 className="section-title">순서를 정해주세요</h2>
            <p className="section-desc">1순위 3점 · 2순위 2점 · 3순위 1점으로 반영돼요.</p>
          </div>

          <RankEditor
            orderedIds={ballot.selected}
            restaurants={restaurants}
            onMove={ballot.move}
            onRemove={ballot.remove}
          />

          {ballot.selected.length < 3 && (
            <button className="btn btn--outline btn--block" onClick={() => navigate('/restaurants')}>
              식당 더 담기 ({ballot.selected.length}/3)
            </button>
          )}

          <hr className="divider" />

          {closed && (
            <Notice tone="warn" icon={<AlertTriangle size={18} aria-hidden="true" />}>
              투표가 마감되어 제출할 수 없어요. 결과 화면에서 모두의 선택을 확인해 주세요.
            </Notice>
          )}

          {/* 제출자 정보 */}
          <div className="field">
            <label className="field__label" htmlFor="voter-name">
              이름 또는 가족이 알아볼 별명
            </label>
            <input
              id="voter-name"
              className="input"
              type="text"
              value={name}
              maxLength={20}
              autoComplete="name"
              placeholder="예: 큰딸, 김영희"
              aria-invalid={touched && !nameOk}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setTouched(true)
                tryLoadMine()
              }}
            />
            {touched && !nameOk && (
              <p className="field__error">
                <AlertTriangle size={13} aria-hidden="true" />
                이름을 두 글자 이상 적어주세요.
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="voter-pin">
              개인 확인번호 4자리
              <span className="field__hint">
                전화번호 뒤 4자리나 가족끼리 정한 숫자. 나중에 같은 번호로 들어오면 수정할 수 있어요.
              </span>
            </label>
            <input
              id="voter-pin"
              className="input input--pin"
              // 모바일에서 숫자 키패드가 바로 뜨게 한다
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              autoComplete="off"
              value={pin}
              placeholder="••••"
              aria-invalid={touched && pin.length > 0 && !pinOk}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))}
              onBlur={() => {
                setTouched(true)
                tryLoadMine()
              }}
            />
            {touched && pin.length > 0 && !pinOk && (
              <p className="field__error">
                <AlertTriangle size={13} aria-hidden="true" />
                숫자 네 자리로 적어주세요.
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="voter-comment">
              한 줄 의견 <span className="field__hint">(선택) 예: 어머니 이동이 편한 곳이면 좋겠어요.</span>
            </label>
            <textarea
              id="voter-comment"
              className="input"
              value={comment}
              maxLength={200}
              onChange={(e) => setComment(e.target.value)}
              placeholder="가족에게 전하고 싶은 의견을 적어주세요."
            />
          </div>

          <Notice tone="ok" icon={<ShieldCheck size={18} aria-hidden="true" />}>
            확인번호는 원문으로 저장되지 않아요. 가족을 구분하는 용도로만 안전하게 사용됩니다.
          </Notice>

          {!accessCode && !IS_DEMO && (
            <Notice tone="warn" icon={<Info size={18} aria-hidden="true" />}>
              가족 단체방에서 받은 링크로 들어와야 투표할 수 있어요. 링크를 다시 눌러주세요.
            </Notice>
          )}

          {submitError && (
            <Notice tone="error" icon={<AlertTriangle size={18} aria-hidden="true" />}>
              {submitError}
              <div style={{ marginTop: 4 }}>선택한 내용은 이 화면에 그대로 남아 있어요.</div>
            </Notice>
          )}

          <button
            className="btn btn--primary btn--block"
            disabled={!canSubmit}
            onClick={() => {
              setTouched(true)
              if (canSubmit) setConfirmOpen(true)
            }}
          >
            {loadingMine ? '불러오는 중…' : '투표하기'}
          </button>
        </div>
      </main>

      {confirmOpen && (
        <ConfirmDialog
          title="이대로 투표할까요?"
          confirmLabel="네, 투표할게요"
          cancelLabel="다시 볼게요"
          busy={submitting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doSubmit}
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                <strong>{displayName(name)}</strong> 님의 선택
              </div>
              <ol style={{ display: 'grid', gap: 4 }}>
                {ballot.selected.map((id, i) => (
                  <li key={id}>
                    {i + 1}순위 {restaurants.find((r) => r.id === id)?.name}
                  </li>
                ))}
              </ol>
            </div>
          }
        />
      )}
    </>
  )
}
