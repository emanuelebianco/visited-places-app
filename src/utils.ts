export function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function clampYear(y: number) {
  const yr = Math.floor(y)
  return Math.max(1900, Math.min(2100, yr))
}

export function formatPlaceTitle(city: string, country: string) {
  const c = city?.trim() || 'Senza città'
  const k = country?.trim() || 'Senza nazione'
  return `${c}, ${k}`
}

export async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}
