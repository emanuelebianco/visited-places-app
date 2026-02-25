import React, { useEffect, useMemo, useState } from 'react'
import type { Place } from './types'
import { clampYear, uid } from './utils'
import { geocodeCityCountry, reverseGeocode } from './nominatim'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

type Mode = 'text' | 'map'

type Props = {
  open: boolean
  mode: Mode
  initialLatLng?: { lat: number; lng: number } | null
  editing?: Place | null
  onClose: () => void
  onSaved: (place: Place) => void
}

export default function PlaceForm({ open, mode, initialLatLng, editing, onClose, onSaved }: Props) {
  const [city, setCity] = useState('')
  const [countryName, setCountryName] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [note, setNote] = useState('')

  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [countryIso2, setCountryIso2] = useState<string | undefined>(undefined)
  const [countryIso3, setCountryIso3] = useState<string>('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canSave = useMemo(() => {
    return Boolean(countryIso3 && year && lat !== null && lng !== null)
  }, [countryIso3, year, lat, lng])

  useEffect(() => {
    if (!open) return
    setError(null)
    if (editing) {
      setCity(editing.city)
      setCountryName(editing.countryName)
      setYear(editing.year)
      setNote(editing.note ?? '')
      setLat(editing.lat)
      setLng(editing.lng)
      setCountryIso2(editing.countryIso2)
      setCountryIso3(editing.countryIso3)
    } else {
      setCity('')
      setCountryName('')
      setYear(new Date().getFullYear())
      setNote('')
      setLat(null)
      setLng(null)
      setCountryIso2(undefined)
      setCountryIso3('')
    }
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    if (mode === 'map' && initialLatLng) {
      // Prefill from map click
      setLat(initialLatLng.lat)
      setLng(initialLatLng.lng)
      ;(async () => {
        try {
          setBusy(true)
          setError(null)
          const r = await reverseGeocode(initialLatLng.lat, initialLatLng.lng)
          const addr = r?.address
          const foundCity = addr?.city || addr?.town || addr?.village || addr?.municipality || ''
          const foundCountry = addr?.country || ''
          const iso2 = (addr?.country_code || '').toUpperCase()
          setCity(foundCity)
          setCountryName(foundCountry)
          setCountryIso2(iso2 || undefined)
          const iso3 = iso2 ? countries.alpha2ToAlpha3(iso2) : ''
          setCountryIso3(iso3 || '')
        } catch (e: any) {
          setError(e?.message ?? 'Errore reverse geocoding')
        } finally {
          setBusy(false)
        }
      })()
    }
  }, [open, mode, initialLatLng])

  async function handleGeocodeFromText() {
    try {
      setBusy(true)
      setError(null)
      const r = await geocodeCityCountry(city, countryName)
      if (!r) {
        setError('Nessun risultato trovato. Prova con un nome diverso o aggiungi una provincia/regione.')
        return
      }
      const lt = Number(r.lat)
      const ln = Number(r.lon)
      if (!Number.isFinite(lt) || !Number.isFinite(ln)) {
        setError('Coordinate non valide dal geocoder.')
        return
      }
      setLat(lt)
      setLng(ln)
      const iso2 = (r.address?.country_code || '').toUpperCase()
      setCountryIso2(iso2 || undefined)
      const iso3 = iso2 ? countries.alpha2ToAlpha3(iso2) : ''
      setCountryIso3(iso3 || '')
      if (!countryName && r.address?.country) setCountryName(r.address.country)
      if (!city) {
        const foundCity = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || ''
        setCity(foundCity)
      }
      if (!iso3) setError('Impossibile determinare il codice paese ISO3. Prova a inserire una nazione più precisa.')
    } catch (e: any) {
      setError(e?.message ?? 'Errore geocoding')
    } finally {
      setBusy(false)
    }
  }

  function handleSave() {
    if (!canSave || lat === null || lng === null) return

    const now = new Date().toISOString()
    const place: Place = {
      id: editing?.id ?? uid(),
      city: city.trim(),
      countryName: countryName.trim(),
      countryIso2,
      countryIso3,
      year: clampYear(year),
      note: note.trim() || undefined,
      lat,
      lng,
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
    }
    onSaved(place)
  }

  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{editing ? 'Modifica posto' : 'Aggiungi posto'}</div>
            <div className="modalSubtitle">
              {mode === 'text' ? 'Inserisci città/nazione e geocodifica' : 'Seleziona dalla mappa e completa i dettagli'}
            </div>
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>

        <div className="grid2">
          <label className="field">
            <span>Città</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Es. Roma" />
          </label>

          <label className="field">
            <span>Nazione/Stato</span>
            <input value={countryName} onChange={(e) => setCountryName(e.target.value)} placeholder="Es. Italia" />
          </label>

          <label className="field">
            <span>Anno (YYYY)</span>
            <input
              type="number"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1900}
              max={2100}
            />
          </label>

          <div className="field">
            <span>Coordinate</span>
            <div className="coords">
              <input value={lat ?? ''} readOnly placeholder="lat" />
              <input value={lng ?? ''} readOnly placeholder="lng" />
            </div>
          </div>

          <label className="field full">
            <span>Nota / descrizione (opzionale)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Scrivi un ricordo, consigli, dettagli..." />
          </label>
        </div>

        <div className="hintRow">
          <span className="pill">ISO3: <b>{countryIso3 || '—'}</b></span>
          <span className="pill">ISO2: <b>{countryIso2 || '—'}</b></span>
        </div>

        {error && <div className="errorBox">{error}</div>}

        <div className="modalFooter">
          {mode === 'text' && (
            <button className="btn secondary" onClick={handleGeocodeFromText} disabled={busy || !city || !countryName}>
              {busy ? 'Geocoding…' : 'Trova su mappa'}
            </button>
          )}
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose} disabled={busy}>Annulla</button>
          <button className="btn primary" onClick={handleSave} disabled={busy || !canSave}>
            {editing ? 'Salva modifiche' : 'Aggiungi'}
          </button>
        </div>
      </div>
    </div>
  )
}
