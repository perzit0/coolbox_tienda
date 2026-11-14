import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ESTADOS_PEDIDO, fecha, money } from '../format'
import { useTienda } from '../store'
import PedidoDetalle from '../components/PedidoDetalle'

export default function MisCompras() {
  const { cliente, setLoginAbierto } = useTienda()
  const [pedidos, setPedidos] = useState(null)
  const [abierto, setAbierto] = useState(null)
  useEffect(() => {
    if (cliente) api('/clientes/me/pedidos').then((r) => setPedidos(r.pedidos)).catch(() => setPedidos([]))
  }, [cliente])

  if (!cliente) {
    return (
      <div className="contenedor vacio">
        <h1>Mis compras</h1>
        <p className="muted">Inicia sesión para ver tus pedidos, o búscalo con el número de pedido y tu correo.</p>
        <div className="acciones-centro">
          <button className="btn btn-primary" onClick={() => setLoginAbierto(true)}>Iniciar sesión</button>
          <Link className="btn btn-outline" to="/seguimiento">Buscar un pedido</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="contenedor angosto">
      <h1>Mis compras</h1>
      {!pedidos ? <div className="skeleton" style={{ height: 200 }} /> : pedidos.length === 0 ? (
        <div className="vacio"><p className="muted">Aún no tienes compras con {cliente.email}.</p><Link to="/" className="btn btn-primary">Ir a la tienda</Link></div>
      ) : (
        <ul className="mis-pedidos">
          {pedidos.map((p) => (
            <li key={p.id}>
              <button className="mis-pedido-fila" onClick={() => setAbierto(abierto === p.id ? null : p.id)} aria-expanded={abierto === p.id}>
                <b>{p.codigo}</b><span>{fecha(p.fecha)}</span><span>{p.cantidad_items} producto{p.cantidad_items > 1 ? 's' : ''}</span>
                <span className={`estado estado-${p.estado}`}>{ESTADOS_PEDIDO[p.estado]}</span><b>{money(p.total)}</b>
              </button>
              {abierto === p.id && <PedidoDetalle pedido={p} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
