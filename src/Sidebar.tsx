import React, { useMemo, useState } from 'react'
import type { Place } from './types'
import { formatPlaceTitle } from './utils'

type Props = {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onAddText: () => void
  onAddMap: () => void
  onEdit: (p: Place) => void
  onDelete: (id: string) => void
}

export default function Sidebar({ places, selectedId, onSelect, onAddText, onAddMap, onEdit, onDelete }: Props) {
  const [q, setQ] = useState('')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  const years = useMemo(() => {
    const ys = Array.from(new Set(places.map(p => p.year))).sort((a,b)=>b-a)
    return ys
  }, [places])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return places
      .slice()
      .sort((a,b) => (b.year - a.year) || (b.updatedAt.localeCompare(a.updatedAt)))
      .filter(p => yearFilter === 'all' ? true : p.year === yearFilter)
      .filter(p => {
        if (!qq) return true
        return (
          p.city.toLowerCase().includes(qq) ||
          p.countryName.toLowerCase().includes(qq) ||
          p.countryIso3.toLowerCase().includes(qq) ||
          (p.note ?? '').toLowerCase().includes(qq)
        )
      })
  }, [places, q, yearFilter])

  const visitedCountriesCount = useMemo(() => new Set(places.map(p => p.countryIso3)).size, [places])

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="logo">🧭</div>
        <div>
          <div className="brandTitle">Visited Places</div>
          <div className="brandSubtitle">{visitedCountriesCount} nazioni • {places.length} posti</div>
        </div>
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onAddText}>+ Aggiungi (testo)</button>
        <button className="btn secondary" onClick={onAddMap}>+ Aggiungi (mappa)</button>
      </div>

      <div className="filters">
        <input
          className="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca città, nazione, nota…"
        />
        <select
          className="select"
          value={yearFilter === 'all' ? 'all' : String(yearFilter)}
          onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">Tutti gli anni</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="list">
        {filtered.length === 0 && (
          <div className="empty">
            <div className="emptyTitle">Nessun posto trovato</div>
            <div className="muted">Aggiungi un viaggio o cambia filtri.</div>
          </div>
        )}

        {filtered.map((p) => {
          const selected = p.id === selectedId
          return (
            <div key={p.id} className={"card " + (selected ? 'selected' : '')} onClick={() => onSelect(p.id)}>
              <div className="cardTop">
                <div className="cardTitle">{formatPlaceTitle(p.city, p.countryName)}</div>
                <div className="cardYear">{p.year}</div>
              </div>
              <div className="cardMeta">
                <span className="chip mono">{p.countryIso3}</span>
                {p.note && <span className="chip subtle">nota</span>}
              </div>
              <div className="cardActions">
                <button className="mini" onClick={(e) => { e.stopPropagation(); onEdit(p) }}>Modifica</button>
                <button className="mini danger" onClick={(e) => { e.stopPropagation(); onDelete(p.id) }}>Elimina</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="footer">
        <div className="muted small">
          Suggerimento: con “Aggiungi (mappa)” puoi cliccare dove sei stato e poi salvare anno e nota.
        </div>
      </div>
    </div>
  )
}
