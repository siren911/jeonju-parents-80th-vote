import type { BallotInput, Choice, PublicEvent, ResultsPayload, Restaurant } from '../types'
import { EVENT_SLUG, IS_DEMO, supabase } from './supabase'
import { RESTAURANTS } from '../data/restaurants'
import { rankResults, tally } from './scoring'
import {
  demoResults,
  findMyBallot,
  participationCount as demoParticipation,
  submitDemoBallot,
} from './demoStore'

/**
 * 데이터 접근 계층.
 * 데모 모드면 로컬 데이터/localStorage 를, 실서버면 Supabase RPC 를 쓴다.
 * 화면 컴포넌트는 이 파일만 알면 되고 supabase 세부는 몰라도 된다.
 */

/** 사용자 친화 오류 메시지로 변환 (기술 용어 대신 할 행동을 알려준다) */
export function friendlyError(code: string): string {
  const map: Record<string, string> = {
    event_not_found: '행사 정보를 찾지 못했어요. 가족 단체방에서 받은 링크로 다시 들어와 주세요.',
    voting_closed: '투표가 마감되었어요. 결과 화면에서 모두의 선택을 확인해 주세요.',
    invalid_access_code: '이 링크로는 투표할 수 없어요. 가족 단체방에 공유된 링크를 다시 눌러주세요.',
    invalid_name: '이름을 두 글자 이상 적어주세요.',
    invalid_pin: '확인번호는 숫자 네 자리로 적어주세요.',
    invalid_choice_count: '가고 싶은 식당을 한 곳에서 세 곳까지 골라주세요.',
    invalid_rank: '순위를 다시 정해주세요.',
    duplicate_rank: '순위가 겹쳤어요. 다시 정해주세요.',
    duplicate_restaurant: '같은 식당을 두 번 고를 수 없어요.',
    restaurant_not_in_event: '선택한 식당 정보가 올바르지 않아요. 새로고침 후 다시 시도해 주세요.',
    not_admin: '관리자만 볼 수 있는 기능이에요.',
  }
  return map[code] ?? '요청을 처리하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.'
}

function extractCode(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message: unknown }).message)
    // supabase RPC 예외는 "... voting_closed" 형태로 온다
    const known = [
      'event_not_found',
      'voting_closed',
      'invalid_access_code',
      'invalid_name',
      'invalid_pin',
      'invalid_choice_count',
      'invalid_rank',
      'duplicate_rank',
      'duplicate_restaurant',
      'restaurant_not_in_event',
      'not_admin',
    ]
    for (const k of known) if (msg.includes(k)) return k
  }
  return 'unknown'
}

// ── 행사 ────────────────────────────────────────────────────────────

export async function fetchEvent(): Promise<PublicEvent> {
  if (IS_DEMO || !supabase) {
    return {
      slug: EVENT_SLUG,
      title: '우리 가족의 소중한 팔순 식사',
      subtitle: '함께 골라주세요',
      eventDate: null,
      voteDeadline: null,
      expectedGuests: 16,
      budgetPerPerson: 100000,
      maxChoices: 3,
      isOpen: true,
      showLiveResults: false,
    }
  }
  const { data, error } = await supabase.rpc('get_event_public', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(extractCode(error)))
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error(friendlyError('event_not_found'))
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    eventDate: row.event_date,
    voteDeadline: row.vote_deadline,
    expectedGuests: row.expected_guests,
    budgetPerPerson: row.budget_per_person,
    maxChoices: row.max_choices,
    isOpen: row.is_open,
    showLiveResults: row.show_live_results,
  }
}

// ── 식당 ────────────────────────────────────────────────────────────

export async function fetchRestaurants(): Promise<Restaurant[]> {
  if (IS_DEMO || !supabase) {
    return RESTAURANTS.filter((r) => r.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  }
  const { data, error } = await supabase.rpc('get_restaurants', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(extractCode(error)))
  return (data as any[]).map(mapRestaurant)
}

function mapRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    summary: row.summary ?? '',
    description: row.description ?? '',
    address: row.address ?? '',
    phone: row.phone,
    priceMin: row.price_min,
    priceMax: row.price_max,
    recommendedMenu: row.recommended_menu ?? '',
    capacityNote: row.capacity_note ?? '',
    fit: row.fit ?? {},
    pros: row.pros ?? [],
    checkPoints: row.check_points ?? [],
    naverMapUrl: row.naver_map_url ?? '',
    kakaoMapUrl: row.kakao_map_url ?? '',
    sourceUrl: row.source_url ?? '',
    lastVerified: row.last_verified ?? '',
    verificationNote: row.verification_note ?? '',
    imagePath: row.image_path,
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? true,
  }
}

// ── 참여 수 ─────────────────────────────────────────────────────────

export async function fetchParticipationCount(): Promise<number> {
  if (IS_DEMO || !supabase) return demoParticipation(EVENT_SLUG)
  const { data, error } = await supabase.rpc('get_participation_count', { p_slug: EVENT_SLUG })
  if (error) throw new Error(friendlyError(extractCode(error)))
  return (data as number) ?? 0
}

// ── 내 투표 불러오기 ────────────────────────────────────────────────

export interface MyBallot {
  comment: string
  choices: Choice[]
}

export async function fetchMyBallot(name: string, pin: string): Promise<MyBallot | null> {
  if (IS_DEMO || !supabase) {
    const b = findMyBallot(EVENT_SLUG, name, pin)
    if (!b) return null
    return { comment: b.comment, choices: b.choices }
  }
  const { data, error } = await supabase.rpc('get_my_ballot', {
    p_slug: EVENT_SLUG,
    p_name: name,
    p_pin: pin,
  })
  if (error) throw new Error(friendlyError(extractCode(error)))
  const rows = (data as any[]) ?? []
  if (rows.length === 0) return null
  return {
    comment: rows[0].comment ?? '',
    choices: rows
      .map((r) => ({ restaurantId: r.restaurant_id, rank: r.rank }))
      .sort((a, b) => a.rank - b.rank),
  }
}

// ── 투표 제출 ───────────────────────────────────────────────────────

export async function submitBallot(accessCode: string, input: BallotInput): Promise<void> {
  if (IS_DEMO || !supabase) {
    submitDemoBallot(EVENT_SLUG, input, new Date().toISOString())
    return
  }
  const { error } = await supabase.rpc('submit_ballot', {
    p_slug: EVENT_SLUG,
    p_access_code: accessCode,
    p_name: input.voterName,
    p_pin: input.pin,
    p_comment: input.comment,
    p_choices: input.choices.map((c) => ({ restaurant_id: c.restaurantId, rank: c.rank })),
  })
  if (error) throw new Error(friendlyError(extractCode(error)))
}

// ── 공개 결과 ───────────────────────────────────────────────────────

export async function fetchResults(): Promise<ResultsPayload> {
  if (IS_DEMO || !supabase) return demoResults(EVENT_SLUG)

  const [resultsRes, countRes, commentsRes] = await Promise.all([
    supabase.rpc('get_public_results', { p_slug: EVENT_SLUG }),
    supabase.rpc('get_participation_count', { p_slug: EVENT_SLUG }),
    supabase.rpc('get_public_comments', { p_slug: EVENT_SLUG }),
  ])
  if (resultsRes.error) throw new Error(friendlyError(extractCode(resultsRes.error)))

  return buildResults(resultsRes.data as any[], (countRes.data as number) ?? 0, (commentsRes.data as string[]) ?? [])
}

/** RPC의 원자료(식당별 점수)를 순위·동점 처리된 결과로 만든다 */
function buildResults(raw: any[], participantCount: number, comments: string[]): ResultsPayload {
  // 점수가 0보다 큰 식당만 결과에 노출 (아무도 안 뽑은 식당 제외)
  const scored = raw
    .filter((r) => Number(r.total_score) > 0)
    .map((r) => ({
      restaurantId: r.restaurant_id as string,
      totalScore: Number(r.total_score),
      firstChoiceCount: Number(r.first_choice_count),
      selectedCount: Number(r.selected_count),
    }))

  const nameOf = (id: string) => raw.find((r) => r.restaurant_id === id)?.name ?? id
  const catOf = (id: string) => raw.find((r) => r.restaurant_id === id)?.category ?? 'korean'

  // rankResults는 tally 형태를 받으므로 동일 구조로 매핑
  const rows = rankResults(scored, nameOf).map((r) => ({ ...r, category: catOf(r.restaurantId) }))
  return { participantCount, rows, comments }
}

// tally를 실제로 쓰지 않지만 데모/서버 집계 일관성을 위해 재노출
export { tally }
