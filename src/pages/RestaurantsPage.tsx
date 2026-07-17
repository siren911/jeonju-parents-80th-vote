import { useMemo, useState } from 'react'
import { SlidersHorizontal, UtensilsCrossed, AlertTriangle } from 'lucide-react'
import type { Restaurant } from '../types'
import { AppHeader } from '../components/AppHeader'
import { DemoBanner } from '../components/DemoBanner'
import { CategoryTabs, type CategoryFilter } from '../components/CategoryTabs'
import { FilterSheet, EMPTY_FILTERS, type Filters } from '../components/FilterSheet'
import { RestaurantCard } from '../components/RestaurantCard'
import { RestaurantDetailSheet } from '../components/RestaurantDetailSheet'
import { BallotBar } from '../components/BallotBar'
import { EmptyState, Notice, RestaurantSkeleton } from '../components/common'
import { useEventData } from '../hooks/useEventData'
import { useBallot } from '../hooks/useBallot'
import { useToast } from '../hooks/useToast'
import { MAX_CHOICES } from '../lib/validation'

type SortKey = 'fit' | 'priceAsc' | 'category'

/** 가족행사 적합도 점수 (확인됨 2, 전화확인 1, 미확인 0의 합) */
function fitScore(r: Restaurant): number {
  const w: Record<string, number> = { ok: 2, call: 1, unknown: 0 }
  return Object.values(r.fit).reduce((s, v) => s + (w[v] ?? 0), 0)
}

function passesFilters(r: Restaurant, f: Filters): boolean {
  if (f.under50k && !(r.priceMin !== null && r.priceMin <= 50000)) return false
  if (f.under100k && !(r.priceMin !== null && r.priceMin <= 100000)) return false
  if (f.room16 && r.fit.room === 'unknown') return false
  if (f.parking && r.fit.parking === 'unknown') return false
  if (f.access && r.fit.access === 'unknown') return false
  return true
}

export function RestaurantsPage() {
  const { restaurants, loading, error, reload } = useEventData()
  const ballot = useBallot()
  const toast = useToast()

  const [cat, setCat] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortKey>('fit')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: restaurants.length }
    for (const r of restaurants) c[r.category] = (c[r.category] ?? 0) + 1
    return c
  }, [restaurants])

  const visible = useMemo(() => {
    let list = restaurants.filter((r) => (cat === 'all' ? true : r.category === cat))
    list = list.filter((r) => passesFilters(r, filters))
    list = [...list].sort((a, b) => {
      if (sort === 'priceAsc') return (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity)
      if (sort === 'category') return a.category.localeCompare(b.category)
      return fitScore(b) - fitScore(a) || a.displayOrder - b.displayOrder
    })
    return list
  }, [restaurants, cat, filters, sort])

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const detail = restaurants.find((r) => r.id === detailId) ?? null

  const onToggle = (r: Restaurant) => {
    if (ballot.isSelected(r.id)) {
      ballot.remove(r.id)
      return
    }
    const ok = ballot.add(r.id)
    if (!ok) {
      toast.show(`식당은 최대 ${MAX_CHOICES}곳까지 담을 수 있어요. 순서 정하기에서 바꿔주세요.`)
    } else {
      toast.show(`${r.name}을(를) 투표함에 담았어요.`)
    }
  }

  return (
    <>
      <DemoBanner />
      <AppHeader title="식당 둘러보기" back="/" showShare />
      <main className="page page--has-ballotbar">
        <div className="wrap stack">
          <CategoryTabs value={cat} counts={counts} onChange={setCat} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="sr-only" htmlFor="sort">
              정렬
            </label>
            <select
              id="sort"
              className="input"
              style={{ width: 'auto', minHeight: 44, paddingRight: 32 }}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="fit">가족행사 적합도순</option>
              <option value="priceAsc">가격 낮은 순</option>
              <option value="category">장르순</option>
            </select>
            <button className="btn btn--outline btn--sm" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              필터{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
            </button>
          </div>

          {loading && restaurants.length === 0 && (
            <div className="stack">
              <RestaurantSkeleton />
              <RestaurantSkeleton />
              <RestaurantSkeleton />
            </div>
          )}

          {error && (
            <Notice tone="error" icon={<AlertTriangle size={18} aria-hidden="true" />}>
              {error}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn--outline btn--sm" onClick={reload}>
                  다시 시도
                </button>
              </div>
            </Notice>
          )}

          {!loading && visible.length === 0 && !error && (
            <EmptyState
              icon={<UtensilsCrossed size={40} aria-hidden="true" />}
              title="조건에 맞는 식당이 없어요"
              desc="필터를 줄이거나 다른 종류를 골라보세요."
              action={
                <button
                  className="btn btn--outline"
                  onClick={() => {
                    setFilters(EMPTY_FILTERS)
                    setCat('all')
                  }}
                >
                  필터 초기화
                </button>
              }
            />
          )}

          <div className="rlist stack">
            {visible.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                selected={ballot.isSelected(r.id)}
                selectedRank={ballot.selected.indexOf(r.id) + 1 || undefined}
                disabledAdd={ballot.isFull}
                onOpen={() => setDetailId(r.id)}
                onToggle={() => onToggle(r)}
              />
            ))}
          </div>
        </div>
      </main>

      <BallotBar />

      {filterOpen && (
        <FilterSheet value={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
      )}
      {detail && (
        <RestaurantDetailSheet
          restaurant={detail}
          selected={ballot.isSelected(detail.id)}
          disabledAdd={ballot.isFull}
          onToggle={() => onToggle(detail)}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  )
}
