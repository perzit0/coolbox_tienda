import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useTienda } from '../store'
import Icon from './Icon'

export function Modal({ titulo, onClose, children, ancho = 440 }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: ancho }} role="dialog" aria-modal="true" aria-label={titulo}>
        <button className="modal-cerrar" onClick={onClose} aria-label="Cerrar"><Icon name="close" /></button>
        {titulo && <h2 className="modal-titulo">{titulo}</h2>}
        {children}
      </div>
    </div>
  )
}

function BotonGoogle({ clientId, onCredencial }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!clientId) return
    const pintar = () => {
      window.google?.accounts.id.initialize({ client_id: clientId, callback: (r) => onCredencial(r.credential) })
      window.google?.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 340, text: 'continue_with', locale: 'es' })
    }
    if (window.google?.accounts) return pintar()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = pintar
    document.head.appendChild(s)
  }, [clientId, onCredencial])
  return <div ref={ref} className="google-btn" />
}

export default function LoginModal() {
  const { loginAbierto, setLoginAbierto, ingresar, config, email: emailGuardado } = useTienda()
  const [modo, setModo] = useState('ingresar') // ingresar | registro | codigo
  const paraComprar = loginAbierto === 'registro'
  const [f, setF] = useState({ email: '', password: '', codigo: '', acepta_terminos: false, acepta_promociones: false })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (loginAbierto) {
      setF((x) => ({ ...x, email: emailGuardado || '', password: '', codigo: '' })); setError(''); setEnviado(false)
      setModo(loginAbierto === 'registro' ? 'registro' : 'ingresar')
    }
  }, [loginAbierto, emailGuardado])

  if (!loginAbierto) return null
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const correr = async (fn) => {
    setError(''); setCargando(true)
    try { await fn() } catch (e) { setError(e.message) } finally { setCargando(false) }
  }
  const enviar = (e) => {
    e.preventDefault()
    correr(async () => {
      if (modo === 'ingresar') return ingresar(await api('/clientes/login', { method: 'POST', body: f }))
      if (modo === 'registro') return ingresar(await api('/clientes/registro', { method: 'POST', body: f }))
      if (!enviado) { await api('/clientes/codigo', { method: 'POST', body: { email: f.email } }); return setEnviado(true) }
      ingresar(await api('/clientes/codigo/verificar', { method: 'POST', body: { email: f.email, codigo: f.codigo } }))
    })
  }
  const google = (credential) => correr(async () => ingresar(await api('/clientes/google', { method: 'POST', body: { credential } })))

  return (
    <Modal titulo={modo === 'registro' ? 'Crea tu cuenta' : 'Inicia sesión'} onClose={() => setLoginAbierto(false)}>
      {paraComprar && <div className="alerta">Para comprar necesitas una cuenta: así tu pedido, tu boleta y el seguimiento quedan guardados. Si ya tienes una, ingresa.</div>}
      <p className="muted">Usa tu correo de Gmail, Outlook, Hotmail, Yahoo o cualquier otro.</p>
      {config.google_client_id && modo !== 'registro' && (
        <>
          <BotonGoogle clientId={config.google_client_id} onCredencial={google} />
          <div className="separador"><span>o</span></div>
        </>
      )}
      <form onSubmit={enviar} className="form">
        <label className="campo">
          <span>Correo electrónico</span>
          <input type="email" required value={f.email} onChange={set('email')} placeholder="nombre@gmail.com" autoComplete="email" disabled={enviado} />
        </label>
        {modo !== 'codigo' && (
          <label className="campo">
            <span>Contraseña</span>
            <input type="password" required value={f.password} onChange={set('password')} minLength={modo === 'registro' ? 8 : 1}
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} />
            {modo === 'registro' && <small className="muted">Mínimo 8 caracteres, con letras y números.</small>}
          </label>
        )}
        {modo === 'codigo' && enviado && (
          <label className="campo">
            <span>Código de 6 dígitos que llegó a tu correo</span>
            <input inputMode="numeric" maxLength={6} required value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.replace(/\D/g, '') })} autoFocus />
          </label>
        )}
        {modo === 'registro' && (
          <>
            <label className="check"><input type="checkbox" checked={f.acepta_terminos} onChange={set('acepta_terminos')} required />
              <span>Acepto los <a href="/info/terminos" target="_blank">términos y condiciones</a> y la <a href="/info/privacidad" target="_blank">política de privacidad</a>.</span></label>
            <label className="check"><input type="checkbox" checked={f.acepta_promociones} onChange={set('acepta_promociones')} />
              <span>Quiero recibir promociones y novedades por correo.</span></label>
          </>
        )}
        {error && <div className="alerta alerta-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={cargando}>
          {cargando ? 'Procesando…' : modo === 'registro' ? 'Crear cuenta' : modo === 'codigo' && !enviado ? 'Enviar código' : 'Ingresar'}
        </button>
      </form>
      <div className="login-links">
        {modo !== 'ingresar' && <button className="link" onClick={() => { setModo('ingresar'); setError('') }}>Ingresar con contraseña</button>}
        {modo !== 'registro' && <button className="link" onClick={() => { setModo('registro'); setError('') }}>Crear una cuenta</button>}
        {config.codigo_por_correo && modo !== 'codigo' && (
          <button className="link" onClick={() => { setModo('codigo'); setError(''); setEnviado(false) }}><Icon name="mail" size={16} /> Recibir un código en mi correo</button>
        )}
      </div>
    </Modal>
  )
}
