/**
 * Nominatim (OpenStreetMap) - Geocoding / Reverse geocoding
 * Tip: set a custom "User-Agent" on your server in production. In browser we can only set Accept headers.
 */
export type NominatimSearchResult = {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    country?: string
    country_code?: string // ISO2 lower-case
  }
}

export type NominatimReverseResult = {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    country?: string
    country_code?: string
  }
}

const BASE = 'https://nominatim.openstreetmap.org'

export async function geocodeCityCountry(city: string, country: string): Promise<NominatimSearchResult | null> {
  const q = `${city}, ${country}`.trim()
  const url = new URL(BASE + '/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', q)

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  })
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)
  const data = (await res.json()) as NominatimSearchResult[]
  return data?.[0] ?? null
}

export async function reverseGeocode(lat: number, lng: number): Promise<NominatimReverseResult | null> {
  const url = new URL(BASE + '/reverse')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  })
  if (!res.ok) throw new Error(`Reverse geocoding error: ${res.status}`)
  const data = (await res.json()) as NominatimReverseResult
  return data ?? null
}
