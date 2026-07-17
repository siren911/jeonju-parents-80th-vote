import type { Choice, ResultRow } from '../types'

/** 순위별 점수: 1순위 3점, 2순위 2점, 3순위 1점 */
export const RANK_SCORE: Record<number, number> = { 1: 3, 2: 2, 3: 1 }

export const scoreForRank = (rank: number): number => RANK_SCORE[rank] ?? 0

interface Tally {
  restaurantId: string
  totalScore: number
  firstChoiceCount: number
  selectedCount: number
}

/** 여러 투표(각 투표는 Choice[])를 식당별로 집계한다 */
export function tally(ballots: Choice[][]): Map<string, Tally> {
  const map = new Map<string, Tally>()
  for (const choices of ballots) {
    for (const c of choices) {
      const t =
        map.get(c.restaurantId) ??
        { restaurantId: c.restaurantId, totalScore: 0, firstChoiceCount: 0, selectedCount: 0 }
      t.totalScore += scoreForRank(c.rank)
      t.selectedCount += 1
      if (c.rank === 1) t.firstChoiceCount += 1
      map.set(c.restaurantId, t)
    }
  }
  return map
}

/**
 * 동점 정렬 기준 (지시서 2장):
 *   1. 총점 높은 순
 *   2. 1순위 표가 많은 순
 *   3. 전체 선택 횟수가 많은 순
 *   4. 그래도 같으면 공동 순위(이름 기준 안정 정렬)
 *
 * nameOf: 안정적 최종 정렬과 표시를 위한 이름 조회 함수
 */
export function rankResults(
  tallies: Tally[],
  nameOf: (restaurantId: string) => string,
): ResultRow[] {
  const sorted = [...tallies].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
    if (b.firstChoiceCount !== a.firstChoiceCount) return b.firstChoiceCount - a.firstChoiceCount
    if (b.selectedCount !== a.selectedCount) return b.selectedCount - a.selectedCount
    // 완전 동점이면 이름 오름차순으로 안정적으로 배치
    return nameOf(a.restaurantId).localeCompare(nameOf(b.restaurantId), 'ko')
  })

  // 동점 판정: 앞의 세 지표가 모두 같으면 같은 순위(공동)로 본다
  const sameRank = (a: Tally, b: Tally) =>
    a.totalScore === b.totalScore &&
    a.firstChoiceCount === b.firstChoiceCount &&
    a.selectedCount === b.selectedCount

  const rows: ResultRow[] = []
  let currentRank = 0
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i]
    // 표준 경쟁 순위법: 앞 항목과 동점이 아니면 순위 = 인덱스+1
    if (i === 0 || !sameRank(sorted[i - 1], t)) {
      currentRank = i + 1
    }
    rows.push({
      restaurantId: t.restaurantId,
      name: nameOf(t.restaurantId),
      category: 'korean', // 호출부에서 실제 카테고리로 채운다
      totalScore: t.totalScore,
      firstChoiceCount: t.firstChoiceCount,
      selectedCount: t.selectedCount,
      rank: currentRank,
      isTied: false,
    })
  }

  // 같은 rank가 둘 이상이면 isTied 표시
  const rankCount = new Map<number, number>()
  rows.forEach((r) => rankCount.set(r.rank, (rankCount.get(r.rank) ?? 0) + 1))
  rows.forEach((r) => {
    if ((rankCount.get(r.rank) ?? 0) > 1) r.isTied = true
  })

  return rows
}
