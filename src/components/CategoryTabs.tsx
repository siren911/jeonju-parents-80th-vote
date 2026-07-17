import { CATEGORIES } from '../data/categories'
import type { Category } from '../types'

export type CategoryFilter = 'all' | Category

interface CategoryTabsProps {
  value: CategoryFilter
  counts: Record<string, number>
  onChange: (v: CategoryFilter) => void
}

export function CategoryTabs({ value, counts, onChange }: CategoryTabsProps) {
  const tabs: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    ...CATEGORIES.map((c) => ({ key: c.key as CategoryFilter, label: c.label })),
  ]

  return (
    <div className="tabs" role="tablist" aria-label="음식 종류 필터">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          className="tab"
          onClick={() => onChange(t.key)}
        >
          {t.label}
          <span className="tab__count">{counts[t.key] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
