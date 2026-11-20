import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, token } from './api'

const Ctx = createContext(null)
const CARRITO_KEY = 'tienda_carrito'
const EMAIL_KEY = 'tienda_email'
const CUPON_KEY = 'tienda_cupon'

const leer = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def } catch { return def }
}

export function TiendaProvider({ children }) {
  // Carrito: [{producto_id, cantidad, sku, nombre, imagen_url, precio}] — se guarda en el navegador
  const [carrito, setCarrito] = useState(() => leer(CARRITO_KEY, []))
  const [cupon, setCupon] = useState(() => localStorage.getItem(CUPON_KEY) || '')
  const [cliente, setCliente] = useState(null)
  const [email, setEmailState] = useState(() => localStorage.getItem(EMAIL_KEY) || '')
  const [config, setConfig] = useState({ google_client_id: null, codigo_por_correo: false })
  const [loginAbierto, setLoginAbierto] = useState(false) // false | true | 'registro'
  const [aviso, setAviso] = useState(null)

  useEffect(() => { localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito)) }, [carrito])
  useEffect(() => { cupon ? localStorage.setItem(CUPON_KEY, cupon) : localStorage.removeItem(CUPON_KEY) }, [cupon])

  const setEmail = useCallback((e) => {
    setEmailState(e || '')
    e ? localStorage.setItem(EMAIL_KEY, e) : localStorage.removeItem(EMAIL_KEY)
  }, [])

  useEffect(() => {
    api('/tienda/config').then(setConfig).catch(() => {})
    if (token.get()) {
      api('/clientes/me').then((r) => { setCliente(r.cliente); setEmail(r.cliente.email) }).catch(() => token.clear())
    }
    const cerrar = () => setCliente(null)
    window.addEventListener('tienda:sesion-cerrada', cerrar)
    return () => window.removeEventListener('tienda:sesion-cerrada', cerrar)
  }, [setEmail])

  const notificar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(t)
  }, [aviso])

  const agregar = useCallback((producto, cantidad = 1, silencioso = false) => {
    setCarrito((c) => {
      const i = c.findIndex((x) => x.producto_id === producto.id)
      if (i >= 0) {
        const copia = [...c]
        copia[i] = { ...copia[i], cantidad: Math.min(copia[i].cantidad + cantidad, Math.min(20, producto.stock ?? 20)) }
        return copia
      }
      return [...c, { producto_id: producto.id, cantidad, sku: producto.sku, nombre: producto.nombre, imagen_url: producto.imagen_url }]
    })
    if (!silencioso) notificar(`Agregaste ${producto.nombre.slice(0, 48)}${producto.nombre.length > 48 ? '…' : ''} a tu carrito.`)
  }, [notificar])

  const cambiarCantidad = useCallback((producto_id, cantidad) => {
    setCarrito((c) => c.map((x) => (x.producto_id === producto_id ? { ...x, cantidad: Math.max(1, Math.min(20, cantidad)) } : x)))
  }, [])
  const quitar = useCallback((producto_id) => setCarrito((c) => c.filter((x) => x.producto_id !== producto_id)), [])
  const vaciar = useCallback(() => { setCarrito([]); setCupon('') }, [])

  const ingresar = useCallback((resp) => {
    token.set(resp.access_token)
    setCliente(resp.cliente)
    setEmail(resp.cliente.email)
    setLoginAbierto(false)
    notificar(`Hola${resp.cliente.nombres ? `, ${resp.cliente.nombres.split(' ')[0]}` : ''}. Ingresaste con ${resp.cliente.email}.`)
  }, [notificar, setEmail])

  const salir = useCallback(() => {
    token.clear()
    setCliente(null)
    setEmail('')
    notificar('Cerraste sesión.')
  }, [notificar, setEmail])

  const items = useMemo(() => carrito.reduce((s, x) => s + x.cantidad, 0), [carrito])

  const value = {
    carrito, items, agregar, cambiarCantidad, quitar, vaciar, cupon, setCupon,
    cliente, setCliente, email, setEmail, ingresar, salir, config,
    loginAbierto, setLoginAbierto, aviso, notificar,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTienda = () => useContext(Ctx)
