import type { BallotInput, Choice, ResultsPayload, StoredBallot } from '../types'
import { RESTAURANTS } from '../data/restaurants'
import { normalizeName } from './validation'
import { tally, rankResults } from './scoring'

/**
 * 데모 모드 저장소 (localStorage 기반)
 *
 * 실제 Supabase 없이 이 기기에서만 투표가 저장/집계된다.
 * localStorage key 는 버전 + 행사 slug 를 포함한다.
 *   parents80-v1:<slug>
 */
const VERSION = 'parents80-v1'

const keyFor = (slug: string) => `${VERSION}:${slug}`

/** 데모용 voter_key: 서버 해시 대신 정규화 이름+PIN+slug 조합 (평문 저장 아님) */
function demoVoterKey(name: string, pin: string, slug: string): string {
  return `${normalizeName(name)}#${pin}#${slug}`
}

function readAll(slug: string): StoredBallot[] {
  try {
    const raw = localStorage.getItem(keyFor(slug))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredBallot[]) : []
  } catch {
    return []
  }
}

function writeAll(slug: string, ballots: StoredBallot[]): void {
  localStorage.setItem(keyFor(slug), JSON.stringify(ballots))
}

/** 현재 기기에서 이 이름+PIN으로 이미 낸 투표가 있으면 불러온다 (수정 화면용) */
export function findMyBallot(slug: string, name: string, pin: string): StoredBallot | null {
  const vk = demoVoterKey(name, pin, slug)
  return readAll(slug).find((b) => b.voterKey === vk) ?? null
}

/** 투표 저장 (같은 이름+PIN이면 수정, 아니면 생성) */
export function submitDemoBallot(slug: string, input: BallotInput, nowIso: string): StoredBallot {
  const vk = demoVoterKey(input.voterName, input.pin, slug)
  const all = readAll(slug)
  const existing = all.findIndex((b) => b.voterKey === vk)
  const record: StoredBallot = {
    voterKey: vk,
    voterName: input.voterName.trim(),
    comment: input.comment.trim(),
    choices: input.choices,
    updatedAt: nowIso,
  }
  if (existing >= 0) all[existing] = record
  else all.push(record)
  writeAll(slug, all)
  return record
}

export function participationCount(slug: string): number {
  return readAll(slug).length
}

/** 데모 결과 집계 */
export function demoResults(slug: string): ResultsPayload {
  const all = readAll(slug)
  const ballots: Choice[][] = all.map((b) => b.choices)
  const nameOf = (id: string) => RESTAURANTS.find((r) => r.id === id)?.name ?? id
  const catOf = (id: string) => RESTAURANTS.find((r) => r.id === id)?.category ?? 'korean'

  const rows = rankResults([...tally(ballots).values()], nameOf).map((r) => ({
    ...r,
    category: catOf(r.restaurantId),
  }))

  const comments = all.map((b) => b.comment).filter((c) => c.length > 0)

  return { participantCount: all.length, rows, comments }
}

/** 데모 데이터 초기화 (관리자 화면 테스트용) */
export function clearDemo(slug: string): void {
  localStorage.removeItem(keyFor(slug))
}
