import type { ResultsPayload } from '../types'

const SHARE_TEXT =
  '부모님 팔순 식사 장소를 함께 골라주세요.\n전주 식당 후보를 보고 가고 싶은 곳 세 군데에 투표해 주세요.'

/** 현재 행사 URL (행사 코드 쿼리 포함, HashRouter 형태) */
export function currentShareUrl(): string {
  return window.location.href
}

export type ShareResult = 'shared' | 'copied' | 'failed'

/**
 * Web Share API가 가능하면 공유, 아니면 클립보드 복사로 대체한다.
 * 카카오톡 인앱 브라우저에서는 share가 막힐 수 있어 복사 폴백이 중요하다.
 */
export async function shareEvent(url: string = currentShareUrl()): Promise<ShareResult> {
  const data = { title: '우리 가족 팔순 식사 투표', text: SHARE_TEXT, url }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (e) {
      // 사용자가 취소한 경우는 실패로 취급하지 않는다
      if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
      // 그 외에는 복사로 폴백
    }
  }
  return copyText(`${SHARE_TEXT}\n${url}`)
}

/** 텍스트 클립보드 복사 (구형 브라우저 폴백 포함) */
export async function copyText(text: string): Promise<ShareResult> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return 'copied'
    }
  } catch {
    // 아래 폴백으로 진행
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok ? 'copied' : 'failed'
  } catch {
    return 'failed'
  }
}

/** 가족 단체방에 붙여넣을 결과 요약문 (지시서 6.7) */
export function buildResultSummary(results: ResultsPayload): string {
  const top = results.rows.filter((r) => r.rank <= 3).slice(0, 5)
  const lines = top.map((r) => `${r.rank}위 ${r.name} ${r.totalScore}점`)
  return [
    '[팔순 식사 투표 결과]',
    `참여 ${results.participantCount}명`,
    ...lines,
    '',
    '다음 단계: 상위 후보에 16명 룸, 메뉴, 주차, 어르신 이동을 전화로 확인한 뒤 최종 예약',
  ].join('\n')
}

/** 결과 CSV (관리자용, 개인 원문 정보 제외) */
export function buildResultCsv(results: ResultsPayload): string {
  const header = ['순위', '식당', '총점', '1순위표', '전체선택수', '공동순위']
  const rows = results.rows.map((r) => [
    String(r.rank),
    r.name,
    String(r.totalScore),
    String(r.firstChoiceCount),
    String(r.selectedCount),
    r.isTied ? 'Y' : 'N',
  ])
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  return [header, ...rows].map((line) => line.map(escape).join(',')).join('\r\n')
}

/** CSV/텍스트를 파일로 내려받게 한다 */
export function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  // BOM을 붙여 엑셀에서 한글이 깨지지 않게 한다
  const blob = new Blob(['﻿', content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
