import type { Choice } from '../types'

export const MIN_CHOICES = 1
export const MAX_CHOICES = 3
export const PIN_LENGTH = 4
export const NAME_MIN = 2
export const NAME_MAX = 20

/**
 * 이름 정규화 (지시서 7.4 확정 규칙)
 *   1) 유니코드 NFC 정규화
 *   2) 모든 공백 문자 제거  ("김 영희" → "김영희")
 *   3) 앞뒤 공백 제거 후 소문자화 (영문 별명 대비)
 *
 * ⚠ 주의: 여기 규칙은 서버 RPC(normalize_name)와 반드시 동일해야 한다.
 * voter_key 해시에 쓰이므로 규칙이 어긋나면 본인 투표 수정이 불가능해진다.
 * 이 클라이언트 함수는 데모 모드 해시 생성과 미리보기 용도로만 쓴다.
 */
export function normalizeName(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase()
}

/** 표시용 이름 정리 (앞뒤 공백만 제거, 원래 형태 유지) */
export function displayName(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim()
}

export function isValidName(raw: string): boolean {
  const d = displayName(raw)
  // 정규화(공백 제거) 후 글자 수로 판정해 "ㄱ ㄴ" 같은 공백 우회를 막는다
  const core = normalizeName(raw)
  return core.length >= NAME_MIN && d.length <= NAME_MAX && core.length >= 1
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)
}

export interface ChoiceValidation {
  ok: boolean
  message?: string
}

/**
 * 선택 목록 검증:
 *  - 1~3개
 *  - 같은 식당 중복 금지
 *  - rank는 1..3, 중복 금지
 */
export function validateChoices(choices: Choice[]): ChoiceValidation {
  if (choices.length < MIN_CHOICES) {
    return { ok: false, message: '가고 싶은 식당을 최소 한 곳 골라주세요.' }
  }
  if (choices.length > MAX_CHOICES) {
    return { ok: false, message: `식당은 최대 ${MAX_CHOICES}곳까지 고를 수 있어요.` }
  }
  const ids = new Set<string>()
  const ranks = new Set<number>()
  for (const c of choices) {
    if (ids.has(c.restaurantId)) {
      return { ok: false, message: '같은 식당을 두 번 고를 수 없어요.' }
    }
    if (c.rank < 1 || c.rank > MAX_CHOICES) {
      return { ok: false, message: '순위는 1위부터 3위까지만 정할 수 있어요.' }
    }
    if (ranks.has(c.rank)) {
      return { ok: false, message: '순위가 겹쳐요. 다시 정해주세요.' }
    }
    ids.add(c.restaurantId)
    ranks.add(c.rank)
  }
  return { ok: true }
}

/**
 * 선택 순서 배열(restaurantId[])을 rank가 매겨진 Choice[]로 변환한다.
 * 배열의 앞에서부터 1,2,3 순위가 매겨진다.
 */
export function toChoices(orderedIds: string[]): Choice[] {
  return orderedIds.slice(0, MAX_CHOICES).map((restaurantId, i) => ({
    restaurantId,
    rank: i + 1,
  }))
}

/** 투표 마감 여부 판정. isOpen이 false거나 마감시각이 지났으면 마감. */
export function isVotingClosed(
  isOpen: boolean,
  voteDeadline: string | null,
  now: Date = new Date(),
): boolean {
  if (!isOpen) return true
  if (voteDeadline) {
    const dl = new Date(voteDeadline)
    if (!Number.isNaN(dl.getTime()) && now.getTime() > dl.getTime()) return true
  }
  return false
}

/**
 * 결과 공개 조건:
 *  - 투표가 마감되었거나
 *  - 관리자가 실시간 공개(show_live_results)를 켠 경우
 */
export function canShowResults(
  isOpen: boolean,
  voteDeadline: string | null,
  showLiveResults: boolean,
  now: Date = new Date(),
): boolean {
  if (showLiveResults) return true
  return isVotingClosed(isOpen, voteDeadline, now)
}
