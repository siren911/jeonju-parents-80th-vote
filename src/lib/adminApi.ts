import { friendlyError } from './api'
import { EVENT_SLUG, requireSupabase } from './supabase'

/** 관리자 전용 API. 데모 모드에서는 사용할 수 없다(로그인 필요). */

function codeFrom(err: unknown): string {
  const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : ''
  return msg.includes('not_admin') ? 'not_admin' : 'unknown'
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw new Error('이메일 또는 비밀번호가 올바르지 않아요. 다시 확인해 주세요.')
}

export async function isAdmin(): Promise<boolean> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('is_admin')
  if (error) return false
  return data === true
}

export async function signOut(): Promise<void> {
  await requireSupabase().auth.signOut()
}

export interface AdminResultRow {
  restaurantId: string
  name: string
  totalScore: number
  firstChoiceCount: number
  selectedCount: number
}

export async function fetchAdminResults(): Promise<AdminResultRow[]> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('get_admin_results', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(codeFrom(error)))
  return (data as any[]).map((r) => ({
    restaurantId: r.restaurant_id,
    name: r.name,
    totalScore: Number(r.total_score),
    firstChoiceCount: Number(r.first_choice_count),
    selectedCount: Number(r.selected_count),
  }))
}

export interface ParticipationRow {
  displayName: string
  hasVoted: boolean
}

export async function fetchAdminParticipation(): Promise<ParticipationRow[]> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('get_admin_participation', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(codeFrom(error)))
  return (data as any[]).map((r) => ({ displayName: r.display_name, hasVoted: r.has_voted }))
}

export interface EventStatusUpdate {
  isOpen?: boolean
  showLiveResults?: boolean
  title?: string
  subtitle?: string
  eventDate?: string | null
  voteDeadline?: string | null
  expectedGuests?: number
}

export async function setEventStatus(u: EventStatusUpdate): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('set_event_status', {
    p_slug: EVENT_SLUG,
    p_is_open: u.isOpen ?? null,
    p_show_live_results: u.showLiveResults ?? null,
    p_title: u.title ?? null,
    p_subtitle: u.subtitle ?? null,
    p_event_date: u.eventDate ?? null,
    p_vote_deadline: u.voteDeadline ?? null,
    p_expected_guests: u.expectedGuests ?? null,
  })
  if (error) throw new Error(friendlyError(codeFrom(error)))
}

export async function setFamilyMembers(names: string[]): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('set_family_members', { p_slug: EVENT_SLUG, p_names: names })
  if (error) throw new Error(friendlyError(codeFrom(error)))
}

export async function setRestaurantVisibility(id: string, isActive: boolean): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('set_restaurant_visibility', { p_restaurant: id, p_is_active: isActive })
  if (error) throw new Error(friendlyError(codeFrom(error)))
}

export async function resetBallots(): Promise<void> {
  const sb = requireSupabase()
  const { error } = await sb.rpc('reset_ballots', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(codeFrom(error)))
}

export async function exportBallotsCsv(): Promise<string> {
  const sb = requireSupabase()
  const { data, error } = await sb.rpc('export_ballots', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(codeFrom(error)))
  const rows = (data as any[]) ?? []
  const header = ['이름', '의견', '식당', '순위', '수정시각']
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const lines = rows.map((r) =>
    [r.voter_name ?? '', r.comment ?? '', r.restaurant_name ?? '', String(r.rank ?? ''), r.updated_at ?? '']
      .map((v) => escape(String(v)))
      .join(','),
  )
  return [header.join(','), ...lines].join('\r\n')
}
