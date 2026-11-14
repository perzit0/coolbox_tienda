import { useTienda } from '../store'

export default function Toast() {
  const { aviso } = useTienda()
  if (!aviso) return null
  return <div key={aviso.id} className={`toast toast-${aviso.tipo}`} role="status">{aviso.texto}</div>
}
