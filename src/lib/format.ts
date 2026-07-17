/** 금액을 한국 로케일로 표기: 35000 → "35,000원" */
export function formatWon(v: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(v)}원`
}

/** 가격 범위 표시. 둘 다 없으면 "가격 전화 확인". */
export function formatPriceRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `약 ${formatWon(min)} ~ ${formatWon(max)}`
  if (min !== null && max === null) return `약 ${formatWon(min)}부터`
  if (min === null && max !== null) return `약 ${formatWon(max)}까지`
  return '가격 전화 확인'
}

/** 날짜를 한국 로케일로 표기 */
export function formatEventDate(iso: string | null): string {
  if (!iso) return '일정 협의 중'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '일정 협의 중'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(d)
}

/** 마감 일시를 한국 로케일 날짜+시각으로 표기 */
export function formatDeadline(iso: string | null): string {
  if (!iso) return '미정'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '미정'
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

/** YYYY-MM-DD → "2026년 7월 17일" */
export function formatVerified(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00+09:00`)
  if (Number.isNaN(d.getTime())) return ymd
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}
