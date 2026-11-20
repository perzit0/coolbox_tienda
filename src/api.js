const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
const TOKEN_KEY = 'tienda_token'

export class ApiError extends Error {
  constructor(code, status, detail) {
    super(detail)
    this.code = code
    this.status = status
  }
}

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export async function api(path, { method = 'GET', body } = {}) {
  const t = token.get()
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('conexion', 0, 'No pudimos conectar con la tienda. Si el servidor estaba dormido, espera unos segundos e intenta de nuevo.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (t && ['token_expirado', 'token_invalido', 'sesion_cliente_requerida'].includes(data.error)) {
      token.clear()
      window.dispatchEvent(new Event('tienda:sesion-cerrada'))
    }
    throw new ApiError(data.error || 'error', res.status, data.detail || 'No se pudo completar la operación.')
  }
  return data
}

export function qs(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v) })
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** Abre en otra pestaña un PDF del cliente (la descarga necesita su sesión). */
export async function abrirArchivo(path) {
  const ventana = window.open('', '_blank')
  const t = token.get()
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new ApiError(data.error || 'error', res.status, data.detail || 'El comprobante aún no está disponible.')
    }
    const url = URL.createObjectURL(await res.blob())
    if (ventana) ventana.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (e) {
    ventana?.close()
    throw e
  }
}
