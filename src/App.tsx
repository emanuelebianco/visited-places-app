import React, { useEffect, useMemo, useState } from 'react'
import type { Place } from './types'
import { loadPlaces, savePlaces } from './storage'
import Sidebar from './Sidebar'
import MapView from './MapView'
import PlaceForm from './PlaceForm'

type FormState =
  | { open: false }
  | { open: true; mode: 'text' | 'map'; initialLatLng?: { lat: number; lng: number } | null; editing?: Place | null }

export default function App() {
  const [places, setPlaces] = useState<Place[]>(() => loadPlaces())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({ open: false })

  useEffect(() => {
    savePlaces(places)
  }, [places])

  const selected = useMemo(() => places.find(p => p.id === selectedId) ?? null, [places, selectedId])

  function upsert(place: Place) {
    setPlaces(prev => {
      const idx = prev.findIndex(p => p.id === place.id)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = place
        return next
      }
      // Insert newest first
      return [place, ...prev]
    })
    setSelectedId(place.id)
    setForm({ open: false })
  }

  function remove(id: string) {
    const ok = confirm('Vuoi eliminare questo posto?')
    if (!ok) return
    setPlaces(prev => prev.filter(p => p.id !== id))
    setSelectedId(prev => (prev === id ? null : prev))
  }

  return (
    <div className="app">
      <Sidebar
        places={places}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddText={() => setForm({ open: true, mode: 'text', editing: null })}
        onAddMap={() => setForm({ open: true, mode: 'map', initialLatLng: null, editing: null })}
        onEdit={(p) => setForm({ open: true, mode: 'text', editing: p })}
        onDelete={remove}
      />

      <div className="main">
        <div className="topbar">
          <div className="topbarLeft">
            <div className="headline">Mappa viaggi</div>
            <div className="subhead">
              {places.length === 0
                ? 'Aggiungi il tuo primo posto visitato.'
                : selected
                  ? `Selezionato: ${selected.city || '—'}, ${selected.countryName || '—'} (${selected.year})`
                  : 'Seleziona un posto dalla lista o dalla mappa.'}
            </div>
          </div>

          <div className="topbarRight">
            <button className="btn ghost" onClick={() => setForm({ open: true, mode: 'text', editing: null })}>
              + Testo
            </button>
            <button className="btn ghost" onClick={() => setForm({ open: true, mode: 'map', initialLatLng: null, editing: null })}>
              + Mappa
            </button>
          </div>
        </div>

        <MapView
          places={places}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMapPick={(lat, lng) => {
            // If the form is not open, open it in map mode; otherwise just update initialLatLng
            setForm({ open: true, mode: 'map', initialLatLng: { lat, lng }, editing: null })
          }}
        />
      </div>

      <PlaceForm
        open={form.open}
        mode={form.open ? form.mode : 'text'}
        initialLatLng={form.open ? (form.mode === 'map' ? (form.initialLatLng ?? null) : null) : null}
        editing={form.open ? (form.editing ?? null) : null}
        onClose={() => setForm({ open: false })}
        onSaved={upsert}
      />
    </div>
  )
}
