import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api, qs } from '../api'
import PedidoDetalle from '../components/PedidoDetalle'
import Icon from '../components/Icon'
import { useTienda } from '../store'

export default function Confirmacion() {
  const { codigo } = useParams()
  const { state } = useLocation()
  const { email } = useTienda()
  const [p, setP] = useState(state?.pedido || null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (p) return
    api(`/tienda/pedidos/${codigo}${qs({ email })}`).then((r) => setP(r.pedido)).catch((e) => setError(e.message))
  }, [codigo, email, p])

  if (error) return <div className="contenedor vacio"><h1>{error}</h1><Link className="btn btn-dark" to="/seguimiento">Buscar mi pedido</Link></div>
  if (!p) return <div className="contenedor"><div className="skeleton pdp-skel" /></div>
  return (
    <div className="contenedor angosto">
      {state?.pedido && (
        <div className="gracias">
          <span className="gracias-icono"><Icon name="check" size={34} stroke={3} /></span>
          <h1>{p.estado === 'pendiente_pago' ? '¡Pedido registrado! Falta tu pago' : `¡Gracias por tu compra, ${p.nombres.split(' ')[0]}!`}</h1>
          <p className="muted">Te enviamos el detalle a <b>{p.email}</b>. Guarda tu número de pedido para hacer el seguimiento.</p>
        </div>
      )}
      <PedidoDetalle pedido={p} />
      <div className="acciones-centro">
        <Link to="/" className="btn btn-primary">Seguir comprando</Link>
        <button className="btn btn-outline" onClick={() => window.print()}>Imprimir</button>
      </div>
    </div>
  )
}
