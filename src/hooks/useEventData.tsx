import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PublicEvent, Restaurant } from '../types'
import { fetchEvent, fetchParticipationCount, fetchRestaurants } from '../lib/api'

interface EventData {
  event: PublicEvent | null
  restaurants: Restaurant[]
  participation: number
  loading: boolean
  error: string | null
  reload: () => void
  reloadParticipation: () => void
}

const Ctx = createContext<EventData | null>(null)

/** 행사·식당·참여수를 한 번 불러와 앱 전체에서 공유한다. */
export function EventDataProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [participation, setParticipation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ev, rs, pc] = await Promise.all([
        fetchEvent(),
        fetchRestaurants(),
        fetchParticipationCount().catch(() => 0),
      ])
      setEvent(ev)
      setRestaurants(rs)
      setParticipation(pc)
    } catch (e) {
      setError(e instanceof Error ? e.message : '정보를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [])

  const reloadParticipation = useCallback(() => {
    fetchParticipationCount()
      .then(setParticipation)
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Ctx.Provider
      value={{ event, restaurants, participation, loading, error, reload: load, reloadParticipation }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useEventData(): EventData {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useEventData must be used within EventDataProvider')
  return ctx
}
