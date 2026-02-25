import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Place } from './types'
import { COUNTRIES_GEOJSON_URL } from './countries'

type Props = {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMapPick: (lat: number, lng: number) => void
}

function YearIcon({ year }: { year: number }) {
  // Not used directly; we create divIcon below.
  return null
}

function makeYearIcon(year: number) {
  return L.divIcon({
    className: 'yearMarker',
    html: `<div class="yearBadge">${year}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
}

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

export default function MapView({ places, selectedId, onSelect, onMapPick }: Props) {
  const [countriesGeo, setCountriesGeo] = useState<any | null>(null)
  const [countriesError, setCountriesError] = useState<string | null>(null)

  const visitedIso3 = useMemo(() => {
    const s = new Set<string>()
    for (const p of places) {
      if (p.countryIso3) s.add(p.countryIso3)
    }
    return s
  }, [places])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setCountriesError(null)
        const res = await fetch(COUNTRIES_GEOJSON_URL)
        if (!res.ok) throw new Error(`Errore caricamento confini: ${res.status}`)
        const gj = await res.json()
        if (!cancelled) setCountriesGeo(gj)
      } catch (e: any) {
        if (!cancelled) setCountriesError(e?.message ?? 'Errore caricamento confini')
      }
    })()
    return () => { cancelled = true }
  }, [])

  const geoStyle = (feature: any) => {
    const iso3 = feature?.id
    const isVisited = iso3 && visitedIso3.has(iso3)
    return {
      weight: 1,
      opacity: isVisited ? 0.9 : 0.35,
      color: isVisited ? '#2b2b2b' : '#4a4a4a',
      fillOpacity: isVisited ? 0.45 : 0.06,
      fillColor: isVisited ? '#3b82f6' : '#ffffff'
    }
  }

  const geoOnEach = (feature: any, layer: any) => {
    const name = feature?.properties?.name ?? 'Nazione'
    const iso3 = feature?.id
    const visited = iso3 && visitedIso3.has(iso3)
    layer.on({
      click: () => {
        // no-op: kept for future (e.g., filter by country)
      }
    })
    layer.bindTooltip(
      `${name}${visited ? ' • visitata' : ''}`,
      { sticky: true, direction: 'top', opacity: 0.92 }
    )
  }

  const center = useMemo<[number, number]>(() => {
    if (places.length === 0) return [20, 0]
    // center on last place
    const p = places[0]
    return [p.lat, p.lng]
  }, [places])

  return (
    <div className="mapWrap">
      <MapContainer center={center} zoom={2} className="map" worldCopyJump>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickCatcher onPick={onMapPick} />

        {countriesGeo && (
          <GeoJSON data={countriesGeo} style={geoStyle as any} onEachFeature={geoOnEach as any} />
        )}

        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={makeYearIcon(p.year)}
            eventHandlers={{
              click: () => onSelect(p.id),
            }}
          >
            <Popup>
              <div className="popup">
                <div className="popupTitle">{p.city || '—'}, {p.countryName || '—'}</div>
                <div className="popupMeta">
                  <span className="chip">{p.year}</span>
                  <span className="chip mono">{p.countryIso3}</span>
                </div>
                {p.note && <div className="popupNote">{p.note}</div>}
                <div className="popupHint">Usa il pannello a sinistra per modificare o eliminare.</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {countriesError && (
        <div className="toast">
          <b>Confini non caricati</b>
          <div className="muted">{countriesError}</div>
        </div>
      )}
    </div>
  )
}
