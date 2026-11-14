import { useState } from 'react'
import { api, qs } from '../api'
import PedidoDetalle from '../components/PedidoDetalle'
import { useTienda } from '../store'

export default function Seguimiento() {
  const { email: guardado } = useTienda()
  const [f, setF] = useState({ codigo: '', email: guardado || '' })
  const [p, setP] = useState(null)
  const [error, setError] = useState('')
  const buscar = (e) => {
    e.preventDefault(); setError(''); setP(null)
    api(`/tienda/pedidos/${f.codigo.trim().toUpperCase()}${qs({ email: f.email.trim().toLowerCase() })}`).then((r) => setP(r.pedido)).catch((x) => setError(x.message))
  }
  return (
    <div className="contenedor angosto">
      <h1>Seguimiento de pedido</h1>
      <form className="form seguimiento" onSubmit={buscar}>
        <label className="campo"><span>Número de pedido</span><input value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })} placeholder="P-000001" required /></label>
        <label className="campo"><span>Correo de la compra</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
        <button className="btn btn-primary">Buscar</button>
      </form>
      {error && <div className="alerta alerta-error">{error}</div>}
      {p && <PedidoDetalle pedido={p} />}
    </div>
  )
}
