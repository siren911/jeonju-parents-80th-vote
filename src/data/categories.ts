import type { Category, StatusLevel } from '../types'

export interface CategoryMeta {
  key: Category
  label: string
  placeholder: string // public/images 의 플레이스홀더 파일명
}

/** 필터 탭 순서와 라벨 */
export const CATEGORIES: CategoryMeta[] = [
  { key: 'korean', label: '한식·한정식', placeholder: 'korean-placeholder.svg' },
  { key: 'chinese', label: '중식', placeholder: 'chinese-placeholder.svg' },
  { key: 'japanese', label: '일식·회', placeholder: 'japanese-placeholder.svg' },
  { key: 'beef', label: '한우·고기', placeholder: 'beef-placeholder.svg' },
]

export const categoryLabel = (key: Category): string =>
  CATEGORIES.find((c) => c.key === key)?.label ?? key

export const categoryPlaceholder = (key: Category): string =>
  `./images/${CATEGORIES.find((c) => c.key === key)?.placeholder ?? 'korean-placeholder.svg'}`

/** 상태 3단계 라벨 — 색상만으로 표현하지 않도록 문구를 함께 쓴다 */
export const STATUS_LABEL: Record<StatusLevel, string> = {
  ok: '가능',
  call: '전화 확인',
  unknown: '미확인',
}

export const STATUS_BADGE_CLASS: Record<StatusLevel, string> = {
  ok: 'badge--ok',
  call: 'badge--warn',
  unknown: 'badge--unknown',
}

/** 평가 6항목 라벨 (표시 순서) */
export const FIT_FIELDS: { key: keyof import('../types').EventFit; label: string }[] = [
  { key: 'room', label: '16명 독립공간' },
  { key: 'access', label: '어르신 이동' },
  { key: 'parking', label: '주차' },
  { key: 'menu', label: '메뉴 호불호' },
  { key: 'atmosphere', label: '행사 분위기' },
  { key: 'budget', label: '10만 원 예산' },
]
