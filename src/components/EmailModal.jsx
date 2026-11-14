import { useState } from 'react'
import { Modal } from './LoginModal'
import { useTienda } from '../store'

const RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/** Antes de pagar se pide el correo (si aún no lo tenemos). */
export default function EmailModal({ onClose, onListo }) {
  const { setEmail, setLoginAbierto } = useTienda()
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')
  const enviar = (e) => {
    e.preventDefault()
    const v = valor.trim().toLowerCase()
    if (!RE.test(v)) return setError('Ingresa un correo válido, por ejemplo nombre@gmail.com o nombre@outlook.com.')
    setEmail(v)
    onListo()
  }
  return (
    <Modal titulo="Para continuar, ingresa tu correo" onClose={onClose}>
      <p className="muted">Te enviaremos la confirmación de tu compra y el aviso cuando tu pedido esté listo para recoger.</p>
      <form onSubmit={enviar} className="form">
        <label className="campo"><span>Correo electrónico</span>
          <input type="email" autoFocus value={valor} onChange={(e) => { setValor(e.target.value); setError('') }} placeholder="nombre@gmail.com" autoComplete="email" />
        </label>
        {error && <div className="alerta alerta-error">{error}</div>}
        <button className="btn btn-primary btn-block">Continuar</button>
      </form>
      <p className="login-links">¿Ya tienes cuenta? <button className="link" onClick={() => { onClose(); setLoginAbierto(true) }}>Inicia sesión</button></p>
    </Modal>
  )
}
