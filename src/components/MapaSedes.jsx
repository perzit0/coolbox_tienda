import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { api } from '../api'
import Icon from './Icon'

const LIMA = [-12.0464, -77.0428]
const pin = (activo) => L.divIcon({
  className: '', iconSize: [30, 40], iconAnchor: [15, 40],
  html: `<div class="map-pin ${activo ? 'map-pin-activo' : ''}"><span></span></div>`,
})
const yo = L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9], html: '<div class="map-yo"></div>' })

/** Mapa de tiendas con buscador encima. Prioriza la tienda más cercana al cliente. */
export default function MapaSedes({ valor, onCambio }) {
  const divRef = useRef(null)
  const mapRef = useRef(null)
  const capaRef = useRef(null)
  const yoRef = useRef(null)
  const [sedes, setSedes] = useState([])
  const [origen, setOrigen] = useState(null) // {lat,lng,etiqueta}
  const [q, setQ] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [msg, setMsg] = useState('')

  const cargar = (o) => api(`/tienda/sedes${o ? `?lat=${o.lat}&lng=${o.lng}` : ''}`).then((r) => {
    setSedes(r.sedes)
    if (o && r.sedes[0]) onCambio(r.sedes[0])   // la más cercana queda elegida
    return r.sedes
  })

  // Mapa
  useEffect(() => {
    const m = L.map(divRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(LIMA, 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; colaboradores de OpenStreetMap',
    }).addTo(m)
    capaRef.current = L.layerGroup().addTo(m)
    mapRef.current = m
    return () => m.remove()
  }, [])

  // Ubicación del cliente (si la permite) -> tienda más cercana
  useEffect(() => {
    cargar(null).then(() => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => usarOrigen({ lat: pos.coords.latitude, lng: pos.coords.longitude, etiqueta: 'Tu ubicación' }),
        () => setMsg('Activa tu ubicación o busca tu distrito para ver la tienda más cercana.'),
        { timeout: 8000, maximumAge: 600000 },
      )
    }).catch((e) => setMsg(e.message))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const usarOrigen = (o) => {
    setOrigen(o); setMsg('')
    cargar(o).then((lista) => {
      if (lista[0]) mapRef.current?.fitBounds(L.latLngBounds([[o.lat, o.lng], [lista[0].lat, lista[0].lng]]).pad(0.6))
    })
  }

  // Marcadores
  useEffect(() => {
    const capa = capaRef.current
    if (!capa) return
    capa.clearLayers()
    sedes.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: pin(valor?.id === s.id), title: s.nombre, zIndexOffset: valor?.id === s.id ? 1000 : 0 })
        .addTo(capa).on('click', () => onCambio(s))
        .bindTooltip(s.nombre, { direction: 'top', offset: [0, -36] })
    })
    if (yoRef.current) yoRef.current.remove()
    if (origen) yoRef.current = L.marker([origen.lat, origen.lng], { icon: yo, title: origen.etiqueta }).addTo(mapRef.current)
  }, [sedes, valor, origen, onCambio])

  useEffect(() => {
    if (valor && mapRef.current) mapRef.current.panTo([valor.lat, valor.lng])
  }, [valor])

  // Coincidencias con el nombre o distrito de una tienda
  const coincidencias = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t.length < 2) return []
    return sedes.filter((s) => `${s.nombre} ${s.distrito} ${s.direccion}`.toLowerCase().includes(t)).slice(0, 5)
  }, [q, sedes])

  const buscar = async (e) => {
    e.preventDefault()
    const t = q.trim()
    if (!t) return
    if (coincidencias.length) { onCambio(coincidencias[0]); mapRef.current?.setView([coincidencias[0].lat, coincidencias[0].lng], 15); return }
    setBuscando(true); setMsg('')
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pe&accept-language=es&q=${encodeURIComponent(`${t}, Lima, Perú`)}`
      const r = await fetch(url).then((x) => x.json())
      if (!r[0]) setMsg('No encontramos esa dirección. Prueba con tu distrito, una avenida o un centro comercial.')
      else usarOrigen({ lat: +r[0].lat, lng: +r[0].lon, etiqueta: t })
    } catch {
      setMsg('No se pudo buscar la dirección. Elige una tienda de la lista.')
    } finally { setBuscando(false) }
  }

  const ubicarme = () => {
    if (!navigator.geolocation) return setMsg('Tu navegador no permite obtener la ubicación.')
    navigator.geolocation.getCurrentPosition(
      (pos) => usarOrigen({ lat: pos.coords.latitude, lng: pos.coords.longitude, etiqueta: 'Tu ubicación' }),
      () => setMsg('No pudimos obtener tu ubicación. Busca tu distrito o dirección.'),
    )
  }

  return (
    <div className="mapa-sedes">
      <div className="mapa-wrap">
        <form className="mapa-buscador" onSubmit={buscar}>
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca tu distrito, dirección o una tienda" aria-label="Buscar dirección o tienda" />
          <button type="submit" className="btn btn-dark btn-sm" disabled={buscando}>{buscando ? 'Buscando…' : 'Buscar'}</button>
          <button type="button" className="mapa-yo-btn" onClick={ubicarme} title="Usar mi ubicación" aria-label="Usar mi ubicación"><Icon name="locate" size={18} /></button>
          {coincidencias.length > 0 && (
            <ul className="mapa-sugerencias">
              {coincidencias.map((s) => (
                <li key={s.id}><button type="button" onClick={() => { onCambio(s); setQ(''); mapRef.current?.setView([s.lat, s.lng], 15) }}>
                  <b>{s.nombre}</b> <small>{s.distrito}</small></button></li>
              ))}
            </ul>
          )}
        </form>
        <div ref={divRef} className="mapa" />
      </div>
      {msg && <div className="alerta alerta-info">{msg}</div>}
      <ul className="sedes-lista">
        {sedes.map((s, i) => (
          <li key={s.id}>
            <label className={`sede ${valor?.id === s.id ? 'sede-activa' : ''}`}>
              <input type="radio" name="sede" checked={valor?.id === s.id} onChange={() => onCambio(s)} />
              <div>
                <b>{s.nombre}</b>{origen && i === 0 && <span className="chip-cercana">Más cercana</span>}
                <span>{s.direccion}, {s.distrito}</span>
                <small className="muted">{s.horario}{s.distancia_km != null ? ` · a ${s.distancia_km.toFixed(1)} km` : ''}</small>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
