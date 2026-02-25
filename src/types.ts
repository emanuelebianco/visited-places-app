export type Place = {
  id: string
  city: string
  countryName: string
  countryIso2?: string // optional, as returned by Nominatim
  countryIso3: string  // used to color the map (matches GeoJSON feature.id)
  year: number
  note?: string
  lat: number
  lng: number
  createdAt: string
  updatedAt: string
}
