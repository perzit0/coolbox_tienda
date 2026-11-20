/** Zona horaria del negocio (VITE_ZONA_HORARIA; Perú por defecto). */
export const ZONA_HORARIA = import.meta.env.VITE_ZONA_HORARIA || 'America/Lima'

/** Las fotos del catálogo vienen del CDN de VTEX de coolbox.pe (originales de 1000×1000 px).
 * VTEX entrega una copia reducida si se pide "/ids/<id>-<ancho>-<alto>/": se descarga solo el
 * tamaño que se muestra (una tarjeta de 300 px pesa ~10 veces menos que el original). */
const VTEX = /(\/arquivos\/ids\/\d+)(-\d+-\d+)?\//
export function imagenAncho(url, ancho) {
  if (!url || !ancho || !VTEX.test(url)) return url
  return url.replace(VTEX, `$1-${ancho}-${ancho}/`)
}

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
export const money = (n) => soles.format(Number(n || 0)).replace('PEN', 'S/').replace(/\s+/, ' ')

export function fecha(iso, conHora = false) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('es-PE', {
    timeZone: ZONA_HORARIA, day: '2-digit', month: '2-digit', year: 'numeric',
    ...(conHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

/** "Válido hasta el 23/11/2026" — la promoción vence a la hora indicada (hora de Lima). */
export const validoHasta = (iso) => `Válido hasta el ${fecha(iso)} o hasta agotar stock.`

export const ESTADOS_PEDIDO = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado — en preparación',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export const slug = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
