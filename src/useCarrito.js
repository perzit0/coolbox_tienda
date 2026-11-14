import { useEffect, useState } from 'react'
import { api } from './api'
import { useTienda } from './store'

/** Precios del carrito según el servidor (promociones + cupón + sugerencias). */
export default function useCarrito() {
  const { carrito, cupon, setCupon } = useTienda()
  const [cot, setCot] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let vivo = true
    const t = setTimeout(() => {
      api('/tienda/carrito', { method: 'POST', body: { items: carrito.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })), cupon: cupon || null } })
        .then((r) => {
          if (!vivo) return
          setCot(r); setError('')
          if (r.cupon_error) setCupon('')
        })
        .catch((e) => vivo && setError(e.message))
    }, 150)
    return () => { vivo = false; clearTimeout(t) }
  }, [carrito, cupon, setCupon])
  return { cot, error }
}
