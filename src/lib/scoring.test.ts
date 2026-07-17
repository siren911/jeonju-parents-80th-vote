import { describe, it, expect } from 'vitest'
import { scoreForRank, tally, rankResults } from './scoring'
import type { Choice } from '../types'

const ballot = (...ids: string[]): Choice[] => ids.map((restaurantId, i) => ({ restaurantId, rank: i + 1 }))

// 테스트용 이름 조회
const nameOf = (id: string) => ({ a: '가게A', b: '나게B', c: '다게C', d: '라게D' }[id] ?? id)

describe('scoreForRank', () => {
  it('1·2·3순위는 3·2·1점', () => {
    expect(scoreForRank(1)).toBe(3)
    expect(scoreForRank(2)).toBe(2)
    expect(scoreForRank(3)).toBe(1)
  })
  it('범위를 벗어난 순위는 0점', () => {
    expect(scoreForRank(4)).toBe(0)
    expect(scoreForRank(0)).toBe(0)
  })
})

describe('tally', () => {
  it('식당별 총점·1순위 수·선택 수를 합산한다', () => {
    // 투표1: a=1위, b=2위, c=3위 / 투표2: a=1위, c=2위
    // a: 3+3 = 6점, 1순위2, 선택2 / b: 2점, 1순위0, 선택1 / c: 1+2 = 3점, 1순위0, 선택2
    const t = tally([ballot('a', 'b', 'c'), ballot('a', 'c')])
    expect(t.get('a')).toEqual({ restaurantId: 'a', totalScore: 6, firstChoiceCount: 2, selectedCount: 2 })
    expect(t.get('b')).toEqual({ restaurantId: 'b', totalScore: 2, firstChoiceCount: 0, selectedCount: 1 })
    expect(t.get('c')).toEqual({ restaurantId: 'c', totalScore: 3, firstChoiceCount: 0, selectedCount: 2 })
  })
})

describe('rankResults 동점 처리', () => {
  it('총점 내림차순으로 순위를 매긴다', () => {
    const rows = rankResults([...tally([ballot('a'), ballot('a'), ballot('b')]).values()], nameOf)
    expect(rows[0].restaurantId).toBe('a')
    expect(rows[0].rank).toBe(1)
    expect(rows[1].restaurantId).toBe('b')
    expect(rows[1].rank).toBe(2)
  })

  it('총점 동점이면 1순위 표가 많은 쪽이 앞선다', () => {
    // a: 1위(3점) / b: 2위+... 로 3점 만들되 1순위 0
    // a = ballot('a') → 3점, 1순위1
    // b = 2위 3표? 순위 재사용 불가하므로 여러 투표로 구성: b가 2위인 투표 + b가 3위인 투표
    // b: 2위(2점) + 3위(1점) = 3점, 1순위0
    const ballots = [ballot('a'), ballot('x', 'b'), ballot('y', 'z', 'b')]
    const rows = rankResults([...tally(ballots).values()], nameOf)
    const a = rows.find((r) => r.restaurantId === 'a')!
    const b = rows.find((r) => r.restaurantId === 'b')!
    expect(a.totalScore).toBe(3)
    expect(b.totalScore).toBe(3)
    expect(a.rank).toBeLessThan(b.rank) // a가 1순위 표가 있어 앞선다
  })

  it('총점·1순위 수가 같으면 전체 선택 수가 많은 쪽이 앞선다', () => {
    // a: 3위 3번 = 3점, 1순위0, 선택3
    // b: 2위+3위 못 만드므로 → 1위 없이 총점3, 선택 적게
    // a: 3위세번 (선택3, 총점3, 1순위0)
    // b: 2위 + 1위? 1위면 firstChoice 생김. → b: 2위 + 3위 = 3점 선택2 1순위0
    const aBallots = [ballot('x1', 'y1', 'a'), ballot('x2', 'y2', 'a'), ballot('x3', 'y3', 'a')]
    const bBallots = [ballot('p', 'b'), ballot('q', 'r', 'b')]
    const rows = rankResults([...tally([...aBallots, ...bBallots]).values()], nameOf)
    const a = rows.find((r) => r.restaurantId === 'a')!
    const b = rows.find((r) => r.restaurantId === 'b')!
    expect(a.totalScore).toBe(3)
    expect(b.totalScore).toBe(3)
    expect(a.firstChoiceCount).toBe(0)
    expect(b.firstChoiceCount).toBe(0)
    expect(a.selectedCount).toBe(3)
    expect(b.selectedCount).toBe(2)
    expect(a.rank).toBeLessThan(b.rank)
  })

  it('모든 지표가 같으면 공동 순위로 isTied=true', () => {
    // a와 b 모두 1위 한 번씩 → 총점3, 1순위1, 선택1 동일
    const rows = rankResults([...tally([ballot('a'), ballot('b')]).values()], nameOf)
    expect(rows[0].rank).toBe(1)
    expect(rows[1].rank).toBe(1)
    expect(rows[0].isTied).toBe(true)
    expect(rows[1].isTied).toBe(true)
  })

  it('공동 1위가 둘이면 다음 순위는 3위가 된다 (경쟁 순위법)', () => {
    // a,b 공동1위(각 3점/1순위1/선택1), c는 2위 표만 있어 더 낮음.
    // 투표1: a=1위, c=2위 / 투표2: b=1위  → a,b 동점 공동1위, c는 2점으로 3위
    const rows = rankResults([...tally([ballot('a', 'c'), ballot('b')]).values()], nameOf)
    const c = rows.find((r) => r.restaurantId === 'c')!
    expect(rows.filter((r) => r.rank === 1)).toHaveLength(2)
    expect(c.rank).toBe(3)
  })
})
