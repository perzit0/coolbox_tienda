import { money } from '../format'

export default function Resumen({ cot, children, compacto = false }) {
  if (!cot) return <aside className="resumen"><div className="skeleton" style={{ height: 180 }} /></aside>
  return (
    <aside className="resumen">
      <h3>Resumen de la orden</h3>
      {compacto && (
        <ul className="resumen-items">
          {cot.items.map((i) => (
            <li key={i.id}><span>{i.cantidad} x {i.nombre}</span><b>{money(i.neto)}</b></li>
          ))}
        </ul>
      )}
      <div className="resumen-fila"><span>Productos ({cot.cantidad})</span><span>{money(cot.subtotal)}</span></div>
      {cot.descuento > 0 && <div className="resumen-fila verde"><span>Descuentos por promociones</span><span>-{money(cot.descuento)}</span></div>}
      {cot.descuento_cupon > 0 && <div className="resumen-fila verde"><span>Cupón {cot.cupon?.codigo}</span><span>-{money(cot.descuento_cupon)}</span></div>}
      <div className="resumen-fila"><span>Recojo en tienda</span><span className="verde">Gratis</span></div>
      <div className="resumen-total"><span>Total</span><b>{money(cot.total)}</b></div>
      <small className="muted">Precios con IGV incluido.</small>
      {children}
    </aside>
  )
}
