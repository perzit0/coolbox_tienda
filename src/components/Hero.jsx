import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Img from './Img'
import Icon from './Icon'
import { money, validoHasta } from '../format'

/** Carrusel central de promociones destacadas (cartelería con auspiciador y vigencia). */
export default function Hero({ banners }) {
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const n = banners?.length || 0
  useEffect(() => {
    if (n < 2 || pausa) return
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000)
    return () => clearInterval(t)
  }, [n, pausa])
  if (!n) return null
  const b = banners[i % n]
  const ir = (d) => setI((x) => (x + d + n) % n)
  return (
    <section className="hero" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} aria-roledescription="carrusel">
      <div className={`hero-slide hero-tema-${i % 3}`} key={b.id}>
        <div className="hero-texto">
          {b.patrocinador && <span className="hero-sponsor">{b.patrocinador} presenta</span>}
          <h2 className="hero-titulo">{b.nombre}</h2>
          <p className="hero-desc">{b.descripcion}</p>
          <div className="hero-hasta"><span>Hasta</span><b>-{b.max_descuento}%</b></div>
          <Link to={`/buscar?promocion=${b.id}`} className="btn btn-primary">Ver productos</Link>
          <small className="hero-legal">{validoHasta(b.fecha_fin)} Precios online.</small>
        </div>
        <div className="hero-productos">
          {b.productos.map((p) => (
            <Link to={`/p/${p.sku}`} key={p.id} className="hero-prod">
              {p.descuento_pct > 0 && <span className="hero-badge">-{p.descuento_pct}%</span>}
              <Img producto={p} />
              <span className="hero-prod-nombre">{p.nombre.split(',')[0]}</span>
              <span className="hero-precio">
                {p.precio < p.precio_regular && <s>{money(p.precio_regular)}</s>}
                <b>{money(p.precio)}</b>
              </span>
            </Link>
          ))}
        </div>
      </div>
      {n > 1 && (
        <>
          <button className="hero-nav izq" onClick={() => ir(-1)} aria-label="Promoción anterior"><Icon name="left" size={26} /></button>
          <button className="hero-nav der" onClick={() => ir(1)} aria-label="Promoción siguiente"><Icon name="right" size={26} /></button>
          <div className="hero-dots">
            {banners.map((x, k) => <button key={x.id} className={k === i % n ? 'activo' : ''} onClick={() => setI(k)} aria-label={`Ir a ${x.nombre}`} />)}
          </div>
        </>
      )}
    </section>
  )
}
