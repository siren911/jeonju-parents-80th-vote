import { useEffect, useState } from 'react'
import { AlertTriangle, Download, LogOut, RotateCcw } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Notice } from '../components/common'
import { useEventData } from '../hooks/useEventData'
import { useToast } from '../hooks/useToast'
import { IS_DEMO, supabase } from '../lib/supabase'
import {
  exportBallotsCsv,
  fetchAdminParticipation,
  fetchAdminResults,
  isAdmin as checkAdmin,
  resetBallots,
  signInWithPassword,
  setEventStatus,
  setFamilyMembers,
  signOut,
  type AdminResultRow,
  type ParticipationRow,
} from '../lib/adminApi'
import { downloadFile } from '../lib/share'

type AuthState = 'checking' | 'anon' | 'authed-nonadmin' | 'admin'

export function AdminPage() {
  const { event, reload } = useEventData()
  const [auth, setAuth] = useState<AuthState>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 데모 모드에서는 관리자 기능을 쓸 수 없다
  useEffect(() => {
    if (IS_DEMO || !supabase) {
      setAuth('anon')
      return
    }
    let alive = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return
      if (!data.session) {
        setAuth('anon')
        return
      }
      const ok = await checkAdmin()
      if (alive) setAuth(ok ? 'admin' : 'authed-nonadmin')
    })
    return () => {
      alive = false
    }
  }, [])

  const onSignIn = async () => {
    setBusy(true)
    setAuthError(null)
    try {
      await signInWithPassword(email.trim(), password)
      const ok = await checkAdmin()
      setAuth(ok ? 'admin' : 'authed-nonadmin')
      if (!ok) setAuthError('로그인은 되었지만 관리자로 등록되지 않은 계정이에요.')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : '로그인에 실패했어요.')
    } finally {
      setBusy(false)
    }
  }

  const onSignOut = async () => {
    await signOut()
    setAuth('anon')
    setPassword('')
  }

  // ── 화면 분기 ─────────────────────────────────────────────────────

  if (IS_DEMO) {
    return (
      <AdminShell>
        <Notice tone="warn" icon={<AlertTriangle size={18} aria-hidden="true" />}>
          지금은 데모 모드예요. 관리자 기능은 Supabase를 연결한 뒤 사용할 수 있어요. (README 참고)
        </Notice>
      </AdminShell>
    )
  }

  if (auth === 'checking') {
    return (
      <AdminShell>
        <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
      </AdminShell>
    )
  }

  if (auth === 'admin' && event) {
    return (
      <AdminShell onSignOut={onSignOut}>
        <AdminPanel onChanged={reload} />
      </AdminShell>
    )
  }

  // 로그인 폼 (anon / code-sent / authed-nonadmin)
  return (
    <AdminShell onSignOut={auth === 'authed-nonadmin' ? onSignOut : undefined}>
      <form
        className="card stack"
        onSubmit={(e) => {
          e.preventDefault()
          if (!busy && email.includes('@') && password.length >= 1) onSignIn()
        }}
      >
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lead)' }}>
            관리자 로그인
          </h2>
          <p className="section-desc">등록된 관리자 이메일과 비밀번호로 로그인합니다.</p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="admin-email">
            이메일
          </label>
          <input
            id="admin-email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="admin-password">
            비밀번호
          </label>
          <input
            id="admin-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </div>

        {authError && (
          <Notice tone="error" icon={<AlertTriangle size={18} aria-hidden="true" />}>
            {authError}
          </Notice>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={busy || !email.includes('@') || password.length < 1}
        >
          {busy ? <span className="spinner" aria-hidden="true" /> : '로그인'}
        </button>
      </form>
    </AdminShell>
  )
}

function AdminShell({
  children,
  onSignOut,
}: {
  children: React.ReactNode
  onSignOut?: () => void
}) {
  return (
    <>
      <AppHeader title="관리자" back="/" />
      <main className="page">
        <div className="wrap stack">
          {children}
          {onSignOut && (
            <button className="btn btn--ghost btn--block" onClick={onSignOut}>
              <LogOut size={16} aria-hidden="true" />
              로그아웃
            </button>
          )}
        </div>
      </main>
    </>
  )
}

// ── 관리자 패널 본체 ─────────────────────────────────────────────────

function AdminPanel({ onChanged }: { onChanged: () => void }) {
  const { event } = useEventData()
  const toast = useToast()
  const [results, setResults] = useState<AdminResultRow[]>([])
  const [participation, setParticipation] = useState<ParticipationRow[]>([])
  const [familyText, setFamilyText] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep2, setResetStep2] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const [r, p] = await Promise.all([fetchAdminResults(), fetchAdminParticipation().catch(() => [])])
      setResults(r.sort((a, b) => b.totalScore - a.totalScore))
      setParticipation(p)
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '불러오지 못했어요.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = async (fn: () => Promise<void>, msg: string) => {
    setBusy(true)
    try {
      await fn()
      toast.show(msg)
      onChanged()
      await load()
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '적용하지 못했어요.')
    } finally {
      setBusy(false)
    }
  }

  const onExport = async () => {
    try {
      const csv = await exportBallotsCsv()
      downloadFile(`팔순투표_원자료_${new Date().toISOString().slice(0, 10)}.csv`, csv)
      toast.show('CSV를 내려받았어요.')
    } catch (e) {
      toast.show(e instanceof Error ? e.message : '내보내지 못했어요.')
    }
  }

  const onSaveFamily = () => {
    const names = familyText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    update(() => setFamilyMembers(names), `가족 명단 ${names.length}명을 저장했어요.`)
  }

  const doReset = () => update(resetBallots, '모든 투표를 초기화했어요.').then(() => {
    setResetOpen(false)
    setResetStep2(false)
  })

  if (!event) return null
  const votedCount = participation.filter((p) => p.hasVoted).length

  return (
    <>
      {/* 투표 상태 제어 */}
      <div className="card stack">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lead)' }}>
          투표 상태
        </h2>
        <ToggleRow
          label="투표 열기 / 마감"
          desc={event.isOpen ? '지금 투표를 받는 중이에요.' : '투표가 마감된 상태예요.'}
          on={event.isOpen}
          busy={busy}
          onToggle={() => update(() => setEventStatus({ isOpen: !event.isOpen }), '변경했어요.')}
          onText="진행 중"
          offText="마감"
        />
        <hr className="divider" />
        <ToggleRow
          label="실시간 결과 공개"
          desc={event.showLiveResults ? '마감 전에도 결과가 보여요.' : '마감 후에만 결과가 공개돼요.'}
          on={event.showLiveResults}
          busy={busy}
          onToggle={() =>
            update(() => setEventStatus({ showLiveResults: !event.showLiveResults }), '변경했어요.')
          }
          onText="공개"
          offText="비공개"
        />
      </div>

      {/* 현재 집계 (관리자는 항상 볼 수 있음) */}
      <div className="card stack">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lead)' }}>
          현재 집계
        </h2>
        {results.filter((r) => r.totalScore > 0).length === 0 ? (
          <p className="section-desc">아직 집계된 투표가 없어요.</p>
        ) : (
          <ol className="stack" style={{ display: 'grid', gap: 8 }}>
            {results
              .filter((r) => r.totalScore > 0)
              .map((r, i) => (
                <li
                  key={r.restaurantId}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}
                >
                  <span>
                    {i + 1}. {r.name}
                  </span>
                  <strong>
                    {r.totalScore}점 (1순위 {r.firstChoiceCount})
                  </strong>
                </li>
              ))}
          </ol>
        )}
        <button className="btn btn--outline btn--block" onClick={onExport}>
          <Download size={16} aria-hidden="true" />
          결과 CSV 다운로드 (관리자용)
        </button>
      </div>

      {/* 가족 명단 / 참여 현황 */}
      <div className="card stack">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lead)' }}>
          가족 명단과 참여 현황
        </h2>
        {participation.length > 0 && (
          <p className="section-desc">
            {participation.length}명 중 {votedCount}명 참여 · {participation.length - votedCount}명 미투표
          </p>
        )}
        {participation.length > 0 && (
          <ul className="stack" style={{ display: 'grid', gap: 6 }}>
            {participation.map((p) => (
              <li
                key={p.displayName}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}
              >
                <span>{p.displayName}</span>
                <span className={`badge ${p.hasVoted ? 'badge--ok' : 'badge--unknown'}`}>
                  {p.hasVoted ? '참여' : '미투표'}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="field">
          <label className="field__label" htmlFor="family">
            명단 등록 <span className="field__hint">한 줄에 한 명씩 이름을 적어주세요. 저장하면 기존 명단을 대체해요.</span>
          </label>
          <textarea
            id="family"
            className="input"
            style={{ minHeight: 120 }}
            value={familyText}
            onChange={(e) => setFamilyText(e.target.value)}
            placeholder={'김영희\n김철수\n큰딸\n막내아들'}
          />
        </div>
        <button className="btn btn--primary btn--block" onClick={onSaveFamily} disabled={busy}>
          가족 명단 저장
        </button>
      </div>

      {/* 위험 구역 */}
      <div className="card stack" style={{ borderColor: '#e2b6ab' }}>
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lead)', color: 'var(--c-danger)' }}>
          투표 초기화
        </h2>
        <p className="section-desc">모든 투표가 삭제돼요. 되돌릴 수 없으니 신중히 진행하세요.</p>
        <button className="btn btn--danger btn--block" onClick={() => setResetOpen(true)}>
          <RotateCcw size={16} aria-hidden="true" />
          전체 투표 초기화
        </button>
      </div>

      {/* 2단계 확인 */}
      {resetOpen && !resetStep2 && (
        <ConfirmDialog
          title="정말 초기화할까요?"
          danger
          confirmLabel="다음 단계"
          description={`현재 ${results.reduce((s, r) => s + r.firstChoiceCount, 0)}건 이상의 투표가 모두 삭제됩니다. 되돌릴 수 없어요.`}
          onCancel={() => setResetOpen(false)}
          onConfirm={() => setResetStep2(true)}
        />
      )}
      {resetOpen && resetStep2 && (
        <ConfirmDialog
          title="한 번 더 확인할게요"
          danger
          busy={busy}
          confirmLabel="네, 모두 삭제합니다"
          description="이 작업은 되돌릴 수 없습니다. 정말로 모든 투표를 삭제하시겠어요?"
          onCancel={() => {
            setResetOpen(false)
            setResetStep2(false)
          }}
          onConfirm={doReset}
        />
      )}
    </>
  )
}

function ToggleRow({
  label,
  desc,
  on,
  busy,
  onToggle,
  onText,
  offText,
}: {
  label: string
  desc: string
  on: boolean
  busy: boolean
  onToggle: () => void
  onText: string
  offText: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div className="section-desc">{desc}</div>
      </div>
      <button
        className={`btn btn--sm ${on ? 'btn--primary' : 'btn--outline'}`}
        onClick={onToggle}
        disabled={busy}
        aria-pressed={on}
        style={{ minWidth: 76 }}
      >
        {on ? onText : offText}
      </button>
    </div>
  )
}
