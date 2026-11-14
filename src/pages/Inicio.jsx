import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Hero from '../components/Hero'
import Riel from '../components/Riel'
import { fecha } from '../format'

export default function Inicio() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api('/tienda/inicio').then(setD).catch((e) => setError(e.message)) }, [])

  if (error) return <div className="contenedor vacio"><p>{error}</p><button className="btn btn-dark" onClick={() => window.location.reload()}>Reintentar</button></div>
  if (!d) return <div className="contenedor"><div className="skeleton hero-skel" /><div className="skeleton riel-skel" /></div>
  return (
    <div className="contenedor">
      <Hero banners={d.banners} />
      <section className="promos-strip">
        {d.promociones.filter((p) => !d.banners.some((b) => b.id === p.id)).map((p) => (
          <Link key={p.id} to={`/buscar?promocion=${p.id}`} className="promo-card">
            <span className={`promo-chip promo-${p.tipo.toLowerCase()}`}>{p.etiqueta}</span>
            <b>{p.nombre}</b>
            {p.patrocinador && <span className="promo-sponsor">Auspicia {p.patrocinador}</span>}
            <small>Hasta el {fecha(p.fecha_fin)}</small>
          </Link>
        ))}
      </section>
      <Riel titulo="Ofertas que no puedes dejar pasar" productos={d.ofertas} verTodo="/buscar?ofertas=1&orden=descuento" />
      <Riel titulo="Lo último" productos={d.ultimos} verTodo="/buscar?orden=nuevos" />
      <Riel titulo="Lo más vendido" productos={d.mas_vendidos} />
    </div>
  )
}
