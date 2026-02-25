# Visited Places (MVP)

Web app (React + Vite + Leaflet) per tracciare posti visitati:
- Marker con anno (YYYY)
- Nazioni colorate se visitate, altre in bianco/nero
- Aggiunta posti via testo (geocoding) o click su mappa (reverse geocoding)
- Note/descrizione
- Modifica / eliminazione
- Salvataggio in localStorage (offline sul browser)

## Avvio
```bash
npm install
npm run dev
```

Apri poi: http://localhost:5173

## Note tecniche
- Geocoding: Nominatim (OpenStreetMap)
- Confini nazioni: GeoJSON pubblico con feature.id = ISO3
