import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Icon from '../components/Icon'
import Resumen from '../components/Resumen'
import MapaSedes from '../components/MapaSedes'
import { money } from '../format'
import { useTienda } from '../store'
import useCarrito from '../useCarrito'

const PERFIL_KEY = 'tienda_perfil'

// Tarjetas de prueba: es un proyecto académico, no se aceptan tarjetas reales.
const TARJETAS_PRUEBA = {
  '4111111111111111': 'Visa', '4242424242424242': 'Visa',
  '5555555555554444': 'Mastercard', '5105105105105100': 'Mastercard',
  '378282246310005': 'American Express', '371449635398431': 'American Express',
  '30569309025904': 'Diners Club', '38520000023237': 'Diners Club',
}
function marcaDe(num) {
  if (/^4/.test(num)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard'
  if (/^3[47]/.test(num)) return 'American Express'
  if (/^3(0[0-5]|[68])/.test(num)) return 'Diners Club'
  return null
}
const luhn = (n) => n.split('').reverse().reduce((s, d, i) => {
  let x = +d
  if (i % 2) { x *= 2; if (x > 9) x -= 9 }
  return s + x
}, 0) % 10 === 0

function Pasos({ paso }) {
  const lista = [['carrito', 'Carrito'], ['perfil', 'Perfil'], ['entrega', 'Entrega'], ['pago', 'Pago']]
  const idx = lista.findIndex(([k]) => k === paso)
  return (
    <div className="pasos">
      {lista.map(([k, t], i) => (
        <span key={k} className={i === idx ? 'activo' : i < idx ? 'hecho' : ''}>
          {i < idx ? <Icon name="check" size={14} /> : `${i + 1}.`} {t}
        </span>
      ))}
    </div>
  )
}

function Perfil({ datos, setDatos, onSiguiente }) {
  const { email, salir } = useTienda()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const set = (k) => (e) => setDatos({ ...datos, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const noSoyYo = () => { salir(); navigate('/carrito') }
  const validar = (e) => {
    e.preventDefault()
    const d = datos
    if (d.nombres.trim().length < 2 || d.apellidos.trim().length < 2) return setError('Ingresa tus nombres y apellidos.')
    if (d.tipo_documento === 'DNI' && !/^\d{8}$/.test(d.nro_documento)) return setError('El DNI debe tener 8 dígitos.')
    if (d.tipo_documento !== 'DNI' && !/^[A-Za-z0-9]{6,12}$/.test(d.nro_documento)) return setError('Revisa el número de documento.')
    if (!/^9\d{8}$/.test(d.celular)) return setError('El celular debe tener 9 dígitos y empezar con 9.')
    if (!d.acepta_terminos) return setError('Debes aceptar los términos y condiciones y la política de privacidad.')
    setError('')
    onSiguiente()
  }
  return (
    <form className="paso-card form" onSubmit={validar}>
      <h2><span className="paso-num">1</span> Datos personales</h2>
      <p className="muted">Solicitamos tu información para la boleta y para entregarte el pedido en tienda.</p>
      <div className="email-fijo"><Icon name="mail" size={18} /> <b>{email}</b>
        <button type="button" className="link" onClick={noSoyYo}>No soy yo</button></div>
      <div className="fila-2">
        <label className="campo"><span>Nombres</span><input value={datos.nombres} onChange={set('nombres')} autoComplete="given-name" required /></label>
        <label className="campo"><span>Apellidos</span><input value={datos.apellidos} onChange={set('apellidos')} autoComplete="family-name" required /></label>
      </div>
      <div className="fila-2">
        <label className="campo"><span>Tipo de documento</span>
          <select value={datos.tipo_documento} onChange={set('tipo_documento')}>
            <option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASAPORTE">Pasaporte</option>
          </select></label>
        <label className="campo"><span>Número de documento</span>
          <input value={datos.nro_documento} onChange={(e) => setDatos({ ...datos, nro_documento: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) })}
            inputMode={datos.tipo_documento === 'DNI' ? 'numeric' : 'text'} required /></label>
      </div>
      <label className="campo"><span>Celular</span>
        <div className="celular"><span>+51</span>
          <input value={datos.celular} onChange={(e) => setDatos({ ...datos, celular: e.target.value.replace(/\D/g, '').slice(0, 9) })} inputMode="tel" autoComplete="tel-national" placeholder="9XX XXX XXX" required /></div></label>
      <label className="check"><input type="checkbox" checked={datos.acepta_terminos} onChange={set('acepta_terminos')} />
        <span>He leído y acepto los <Link to="/info/terminos" target="_blank">términos y condiciones</Link> y la <Link to="/info/privacidad" target="_blank">política de privacidad</Link>.</span></label>
      <label className="check"><input type="checkbox" checked={datos.acepta_promociones} onChange={set('acepta_promociones')} />
        <span>Acepto recibir promociones y ofertas personalizadas por correo y celular (opcional).</span></label>
      {error && <div className="alerta alerta-error">{error}</div>}
      <button className="btn btn-primary btn-grande">Ir a entrega</button>
    </form>
  )
}

function Pago({ cot, onPagar, enviando, error }) {
  const [metodo, setMetodo] = useState('tarjeta')
  const [t, setT] = useState({ numero: '', nombre: '', exp: '', cvv: '' })
  const [op, setOp] = useState('')
  const [err, setErr] = useState('')
  const num = t.numero.replace(/\D/g, '')
  const marca = marcaDe(num)

  const pagar = (e) => {
    e.preventDefault()
    setErr('')
    if (metodo === 'tarjeta') {
      if (!marca || !luhn(num) || num.length < 14) return setErr('Revisa el número de tarjeta.')
      if (!TARJETAS_PRUEBA[num]) return setErr('Esta tienda es un proyecto académico: usa una de las tarjetas de prueba indicadas, nunca una tarjeta real.')
      const [mm, aa] = t.exp.split('/').map((x) => parseInt(x, 10))
      const hoy = new Date()
      if (!mm || mm > 12 || !aa || 2000 + aa < hoy.getFullYear() || (2000 + aa === hoy.getFullYear() && mm < hoy.getMonth() + 1)) return setErr('La fecha de vencimiento no es válida.')
      if (!/^\d{3,4}$/.test(t.cvv)) return setErr('El código de seguridad no es válido.')
      if (t.nombre.trim().length < 3) return setErr('Ingresa el nombre como figura en la tarjeta.')
      return onPagar({ metodo: 'tarjeta', marca, ultimos4: num.slice(-4) })
    }
    if (metodo === 'yape' || metodo === 'plin') {
      if (!/^\d{6,12}$/.test(op)) return setErr('Ingresa el número de operación (6 a 12 dígitos).')
      return onPagar({ metodo, nro_operacion: op })
    }
    onPagar({ metodo: 'pagoefectivo' })
  }
  const fmtNum = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  return (
    <form className="paso-card form" onSubmit={pagar}>
      <h2><span className="paso-num">3</span> Pago</h2>
      <div className="metodos">
        {[['tarjeta', 'Tarjeta de crédito o débito', 'Visa · Mastercard · American Express · Diners Club'],
          ['yape', 'Yape', 'Paga desde tu app Yape'],
          ['plin', 'Plin', 'Paga desde la app de tu banco con Plin'],
          ['pagoefectivo', 'PagoEfectivo', 'Banca por internet, agentes y bodegas (código CIP)']].map(([k, n, d]) => (
          <label key={k} className={`metodo ${metodo === k ? 'metodo-activo' : ''}`}>
            <input type="radio" name="metodo" checked={metodo === k} onChange={() => { setMetodo(k); setErr('') }} />
            <div><b>{n}</b><small>{d}</small></div>
            <span className={`medio medio-${k === 'tarjeta' ? 'visa' : k}`}>{k === 'tarjeta' ? 'TARJETA' : n}</span>
          </label>
        ))}
      </div>

      {metodo === 'tarjeta' && (
        <div className="tarjeta-form">
          <div className="alerta alerta-info">
            Pago simulado. Usa una tarjeta de prueba: Visa 4111 1111 1111 1111 · Mastercard 5555 5555 5555 4444 · American Express 3782 822463 10005 · Diners Club 3056 9309 0259 04 (cualquier fecha futura y CVV).
          </div>
          <label className="campo"><span>Número de tarjeta {marca && <b className="marca-detectada">{marca}</b>}</span>
            <input value={fmtNum(t.numero)} onChange={(e) => setT({ ...t, numero: e.target.value })} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" /></label>
          <label className="campo"><span>Nombre del titular</span>
            <input value={t.nombre} onChange={(e) => setT({ ...t, nombre: e.target.value.toUpperCase() })} autoComplete="off" /></label>
          <div className="fila-2">
            <label className="campo"><span>Vencimiento (MM/AA)</span>
              <input value={t.exp} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setT({ ...t, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }) }} placeholder="MM/AA" autoComplete="off" /></label>
            <label className="campo"><span>CVV</span>
              <input type="password" value={t.cvv} onChange={(e) => setT({ ...t, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} autoComplete="off" /></label>
          </div>
          <small className="muted">Solo guardamos la marca y los 4 últimos dígitos de la tarjeta.</small>
        </div>
      )}
      {(metodo === 'yape' || metodo === 'plin') && (
        <div className="billetera">
          <div className={`billetera-qr billetera-${metodo}`}><span>{metodo === 'yape' ? 'yape' : 'plin'}</span><small>QR de demostración</small></div>
          <ol>
            <li>Abre tu app {metodo === 'yape' ? 'Yape' : 'de tu banco con Plin'} y paga <b>{money(cot?.total)}</b> a "Coolbox Tienda (demo)".</li>
            <li>Copia el número de operación de la constancia.</li>
            <li>Ingrésalo aquí para confirmar tu compra.</li>
          </ol>
          <label className="campo"><span>Número de operación</span>
            <input value={op} onChange={(e) => setOp(e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" /></label>
        </div>
      )}
      {metodo === 'pagoefectivo' && (
        <div className="alerta alerta-info">
          Al confirmar te daremos un código CIP para pagar en tu banca por internet, agentes o bodegas. Tienes 24 horas para pagarlo; luego tu pedido se anula y los productos vuelven a estar disponibles.
        </div>
      )}
      {(err || error) && <div className="alerta alerta-error">{err || error}</div>}
      <button className="btn btn-primary btn-grande btn-block" disabled={enviando || !cot}>
        <Icon name="lock" size={18} /> {enviando ? 'Procesando…' : metodo === 'pagoefectivo' ? `Generar código CIP por ${money(cot?.total)}` : `Pagar ${money(cot?.total)}`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { carrito, cliente, cupon, vaciar } = useTienda()
  const { cot, error: errCot } = useCarrito()
  const navigate = useNavigate()
  const [paso, setPaso] = useState('perfil')
  const [sede, setSede] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [datos, setDatos] = useState(() => {
    const base = { nombres: '', apellidos: '', tipo_documento: 'DNI', nro_documento: '', celular: '', acepta_terminos: false, acepta_promociones: false }
    try { return { ...base, ...JSON.parse(localStorage.getItem(PERFIL_KEY) || '{}') } } catch { return base }
  })

  useEffect(() => {
    if (!cliente) return
    setDatos((d) => ({
      ...d,
      nombres: d.nombres || cliente.nombres || '', apellidos: d.apellidos || cliente.apellidos || '',
      tipo_documento: cliente.tipo_documento || d.tipo_documento, nro_documento: d.nro_documento || cliente.nro_documento || '',
      celular: d.celular || cliente.celular || '', acepta_terminos: d.acepta_terminos || cliente.acepta_terminos,
      acepta_promociones: d.acepta_promociones || cliente.acepta_promociones,
    }))
  }, [cliente])
  useEffect(() => { localStorage.setItem(PERFIL_KEY, JSON.stringify(datos)) }, [datos])

  if (!carrito.length && !enviando) return <Navigate to="/carrito" replace />
  if (!cliente) return <Navigate to="/carrito" replace />

  const pagar = async (pago) => {
    setEnviando(true); setError('')
    try {
      const r = await api('/tienda/pedidos', {
        method: 'POST',
        body: { ...datos, sede_id: sede.id, cupon: cupon || null, pago, items: carrito.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })) },
      })
      vaciar()
      navigate(`/pedido/${r.pedido.codigo}`, { state: { pedido: r.pedido }, replace: true })
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor">
      <Pasos paso={paso} />
      <div className="checkout">
        <div className="checkout-pasos">
          {paso === 'perfil' ? <Perfil datos={datos} setDatos={setDatos} onSiguiente={() => setPaso('entrega')} /> : (
            <div className="paso-cerrado"><span><Icon name="check" size={16} /> <b>Datos personales</b> {datos.nombres} {datos.apellidos} · {datos.tipo_documento} {datos.nro_documento} · +51 {datos.celular}</span>
              <button className="link" onClick={() => setPaso('perfil')}>Editar</button></div>
          )}
          {paso === 'entrega' && (
            <div className="paso-card">
              <h2><span className="paso-num">2</span> Entrega: recojo en tienda</h2>
              <p className="muted">Por ahora solo atendemos con recojo en tienda (sin costo). Te sugerimos la tienda más cercana; también puedes buscar otra en el mapa.</p>
              <MapaSedes valor={sede} onCambio={setSede} />
              <div className="recojo-nota"><Icon name="clock" size={18} /> Te avisaremos por correo cuando tu pedido esté listo. Para recogerlo presenta tu {datos.tipo_documento} ({datos.nro_documento}); solo el titular puede retirarlo.</div>
              <button className="btn btn-primary btn-grande" disabled={!sede} onClick={() => setPaso('pago')}>Ir a pagar</button>
            </div>
          )}
          {paso === 'pago' && (
            <>
              <div className="paso-cerrado"><span><Icon name="check" size={16} /> <b>Recojo en</b> {sede?.nombre} — {sede?.direccion}, {sede?.distrito}</span>
                <button className="link" onClick={() => setPaso('entrega')}>Cambiar</button></div>
              <Pago cot={cot} onPagar={pagar} enviando={enviando} error={error || errCot} />
            </>
          )}
        </div>
        <Resumen cot={cot} compacto>
          <Link to="/carrito" className="link">Modificar carrito</Link>
        </Resumen>
      </div>
    </div>
  )
}
