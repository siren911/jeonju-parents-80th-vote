import { describe, it, expect } from 'vitest'
import {
  normalizeName,
  displayName,
  isValidName,
  isValidPin,
  validateChoices,
  toChoices,
  isVotingClosed,
  canShowResults,
} from './validation'
import type { Choice } from '../types'

describe('normalizeName', () => {
  it('공백을 모두 제거한다 ("김 영희" === "김영희")', () => {
    expect(normalizeName('김 영희')).toBe(normalizeName('김영희'))
    expect(normalizeName('김  영 희')).toBe('김영희')
  })
  it('앞뒤 공백과 대소문자를 정규화한다', () => {
    expect(normalizeName('  Mom  ')).toBe('mom')
  })
  it('NFC 정규화로 자모 결합 형태를 통일한다', () => {
    const decomposed = '가' // ㄱ+ㅏ (분해형)
    const composed = '가' // 결합형
    expect(normalizeName(decomposed)).toBe(normalizeName(composed))
  })
})

describe('displayName', () => {
  it('여러 공백을 하나로 줄이고 앞뒤를 다듬되 형태는 유지', () => {
    expect(displayName('  김  영희 ')).toBe('김 영희')
  })
})

describe('isValidName', () => {
  it('정규화 후 2자 이상이면 통과', () => {
    expect(isValidName('김영희')).toBe(true)
    expect(isValidName('엄 마')).toBe(true) // 공백 제거 후 2자
  })
  it('한 글자거나 공백뿐이면 실패', () => {
    expect(isValidName('김')).toBe(false)
    expect(isValidName('   ')).toBe(false)
  })
  it('표시 기준 20자를 넘으면 실패', () => {
    expect(isValidName('가'.repeat(21))).toBe(false)
  })
})

describe('isValidPin', () => {
  it('숫자 4자리만 통과', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin('0000')).toBe(true)
  })
  it('길이가 다르거나 숫자가 아니면 실패', () => {
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('')).toBe(false)
  })
})

describe('validateChoices', () => {
  const c = (id: string, rank: number): Choice => ({ restaurantId: id, rank })

  it('1~3개 정상 선택은 통과', () => {
    expect(validateChoices([c('a', 1)]).ok).toBe(true)
    expect(validateChoices([c('a', 1), c('b', 2), c('c', 3)]).ok).toBe(true)
  })
  it('0개는 실패', () => {
    expect(validateChoices([]).ok).toBe(false)
  })
  it('4개는 실패', () => {
    expect(validateChoices([c('a', 1), c('b', 2), c('c', 3), c('d', 1)]).ok).toBe(false)
  })
  it('같은 식당 중복은 실패', () => {
    const r = validateChoices([c('a', 1), c('a', 2)])
    expect(r.ok).toBe(false)
  })
  it('순위 중복은 실패', () => {
    const r = validateChoices([c('a', 1), c('b', 1)])
    expect(r.ok).toBe(false)
  })
})

describe('toChoices', () => {
  it('순서대로 1·2·3 순위를 매긴다', () => {
    expect(toChoices(['a', 'b', 'c'])).toEqual([
      { restaurantId: 'a', rank: 1 },
      { restaurantId: 'b', rank: 2 },
      { restaurantId: 'c', rank: 3 },
    ])
  })
  it('3개를 초과하면 앞에서 3개만 사용', () => {
    expect(toChoices(['a', 'b', 'c', 'd'])).toHaveLength(3)
  })
})

describe('isVotingClosed', () => {
  const now = new Date('2026-08-01T12:00:00+09:00')
  it('is_open=false면 마감', () => {
    expect(isVotingClosed(false, null, now)).toBe(true)
  })
  it('마감시각이 지났으면 마감', () => {
    expect(isVotingClosed(true, '2026-07-31T23:59:00+09:00', now)).toBe(true)
  })
  it('마감시각 전이면 진행 중', () => {
    expect(isVotingClosed(true, '2026-08-02T00:00:00+09:00', now)).toBe(false)
  })
  it('마감시각이 없고 열려 있으면 진행 중', () => {
    expect(isVotingClosed(true, null, now)).toBe(false)
  })
})

describe('canShowResults', () => {
  const now = new Date('2026-08-01T12:00:00+09:00')
  it('실시간 공개가 켜지면 항상 공개', () => {
    expect(canShowResults(true, '2026-08-02T00:00:00+09:00', true, now)).toBe(true)
  })
  it('실시간 공개가 꺼져 있고 진행 중이면 비공개', () => {
    expect(canShowResults(true, '2026-08-02T00:00:00+09:00', false, now)).toBe(false)
  })
  it('마감되었으면 실시간 공개와 무관하게 공개', () => {
    expect(canShowResults(false, null, false, now)).toBe(true)
  })
})
