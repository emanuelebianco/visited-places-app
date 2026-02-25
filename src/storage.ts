import type { Place } from './types'

const KEY = 'visited_places_v1'

export function loadPlaces(): Place[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Place[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function savePlaces(places: Place[]) {
  localStorage.setItem(KEY, JSON.stringify(places))
}
