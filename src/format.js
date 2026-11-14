const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
export const money = (n) => soles.format(Number(n || 0)).replace('PEN', 'S/').replace(/\s+/, ' ')

export function fecha(iso, conHora = false) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric',
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
