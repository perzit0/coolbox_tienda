import { money, validoHasta } from '../format'

/** Bloque de precio: regular tachado, precio online y % de descuento. */
export function Precio({ p, grande = false }) {
  const hayOferta = p.precio < p.precio_regular
  return (
    <div className={`precio ${grande ? 'precio-grande' : ''}`}>
      {hayOferta && <span className="precio-regular">{money(p.precio_regular)}</span>}
      <div className="precio-fila">
        <span className="precio-online">{money(p.precio)}</span>
        {p.descuento_pct > 0 && <span className="badge-dcto">-{p.descuento_pct}%</span>}
      </div>
    </div>
  )
}

/** Etiqueta de la promoción (2x1, -15%...) con su vigencia en letra pequeña. */
export function PromoTag({ promo, conFecha = true }) {
  if (!promo) return null
  return (
    <div className="promo-tag">
      <span className={`promo-chip promo-${promo.tipo.toLowerCase()}`}>{promo.etiqueta}</span>
      {promo.patrocinador && <span className="promo-sponsor">Auspicia {promo.patrocinador}</span>}
      {conFecha && <small className="promo-fecha">{validoHasta(promo.fecha_fin)}</small>}
    </div>
  )
}
