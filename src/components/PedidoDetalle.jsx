import { useState } from 'react'
import { abrirArchivo } from '../api'
import Img from './Img'
import Icon from './Icon'
import { ESTADOS_PEDIDO, fecha, money } from '../format'

const TIPO_COMPROBANTE = { boleta: 'Boleta electrónica', nota_credito: 'Nota de crédito' }

const PASOS = ['pagado', 'listo', 'entregado']

function Comprobantes({ pedido: p }) {
  const [error, setError] = useState('')
  const lista = (p.comprobantes || []).filter((c) => c.numero)
  // Devoluciones después de la entrega: cada una tiene su nota de crédito
  const devoluciones = p.devoluciones || []
  if (!lista.length && !devoluciones.length) return null
  const abrir = (c) => abrirArchivo(`/clientes/me/pedidos/${p.codigo}/comprobante/${c.tipo}/pdf`).catch((e) => setError(e.message))
  const abrirNota = (d) => abrirArchivo(`/clientes/me/pedidos/${p.codigo}/devoluciones/${d.id}/pdf`).catch((e) => setError(e.message))
  return (
    <div className="comprobantes">
      {lista.map((c) => (
        <div key={c.id} className="comprobante">
          <Icon name="lock" size={16} /> <span>{TIPO_COMPROBANTE[c.tipo]} <b>{c.numero}</b></span>
          {c.tiene_pdf && <button type="button" className="link" onClick={() => abrir(c)}>Ver PDF</button>}
        </div>
      ))}
      {devoluciones.map((d) => (
        <div key={`d${d.id}`} className="comprobante">
          <Icon name="lock" size={16} />
          <span>
            Devolución {d.codigo}: {money(d.total)}
            {d.nota_credito ? <> · Nota de crédito <b>{d.nota_credito}</b></> : ' · nota de crédito en proceso'}
          </span>
          {d.tiene_pdf && <button type="button" className="link" onClick={() => abrirNota(d)}>Ver PDF</button>}
        </div>
      ))}
      {error && <div className="alerta alerta-error">{error}</div>}
    </div>
  )
}

export default function PedidoDetalle({ pedido: p }) {
  const idx = p.estado === 'pendiente_pago' ? -1 : PASOS.indexOf(p.estado)
  const metodo = p.metodo_pago === 'tarjeta' ? `${p.marca_tarjeta} terminada en ${p.ultimos4}`
    : p.metodo_pago === 'pagoefectivo' ? 'PagoEfectivo' : p.metodo_pago === 'yape' ? 'Yape' : 'Plin'
  return (
    <div className="pedido">
      <div className="pedido-head">
        <div><span className="muted">Pedido</span><h2>{p.codigo}</h2><small className="muted">{fecha(p.fecha, true)}</small></div>
        <span className={`estado estado-${p.estado}`}>{ESTADOS_PEDIDO[p.estado]}</span>
      </div>
      {p.estado !== 'cancelado' && (
        <ol className="tracking">
          {['Pago confirmado', 'Listo para recoger', 'Entregado'].map((t, i) => (
            <li key={t} className={i <= idx ? 'hecho' : ''}><span>{i <= idx ? <Icon name="check" size={14} /> : i + 1}</span>{t}</li>
          ))}
        </ol>
      )}
      {p.estado === 'pendiente_pago' && (
        <div className="cip">
          <span>Código de pago CIP</span>
          <b>{p.cip}</b>
          <small>Págalo hasta el {fecha(p.cip_expira, true)} en tu banca por internet (BCP, BBVA, Interbank, Scotiabank), agentes o bodegas afiliadas a PagoEfectivo. Monto: {money(p.total)}.</small>
        </div>
      )}
      {p.estado === 'cancelado' && <div className="alerta alerta-error">Pedido cancelado{p.motivo_cancelacion ? `: ${p.motivo_cancelacion}` : ''}.</div>}
      <div className="pedido-grid">
        <div>
          <h4><Icon name="store" size={18} /> Recojo en tienda</h4>
          <p><b>{p.sede?.nombre}</b><br />{p.sede?.direccion}, {p.sede?.distrito}<br /><small className="muted">{p.sede?.horario}</small></p>
          <p className="muted">Presenta tu {p.tipo_documento} {p.nro_documento}. Solo el titular ({p.cliente_nombre}) puede recoger el pedido.</p>
        </div>
        <div>
          <h4><Icon name="lock" size={18} /> Pago</h4>
          <p>{metodo}{p.nro_operacion && p.metodo_pago !== 'tarjeta' ? ` · Operación ${p.nro_operacion}` : ''}</p>
          <p className="muted">Comprobante enviado a {p.email}</p>
          <Comprobantes pedido={p} />
        </div>
      </div>
      <ul className="pedido-items">
        {p.detalles?.map((d) => (
          <li key={d.id}>
            <Img producto={d} className="pedido-img" ancho={120} />
            <div><span>{d.nombre}</span><small className="muted">SKU {d.sku} · {d.cantidad} unidad{d.cantidad > 1 ? 'es' : ''}{d.promocion_nombre ? ` · ${d.promocion_nombre}` : ''}</small></div>
            <b>{money(d.subtotal)}</b>
          </li>
        ))}
      </ul>
      <div className="pedido-totales">
        <div><span>Subtotal</span><span>{money(p.subtotal)}</span></div>
        {p.descuento > 0 && <div className="verde"><span>Promociones</span><span>-{money(p.descuento)}</span></div>}
        {p.descuento_cupon > 0 && <div className="verde"><span>Cupón {p.cupon}</span><span>-{money(p.descuento_cupon)}</span></div>}
        <div className="muted"><span>Op. gravada / IGV</span><span>{money(p.base)} / {money(p.igv)}</span></div>
        <div className="pedido-total"><span>Total</span><b>{money(p.total)}</b></div>
      </div>
    </div>
  )
}
