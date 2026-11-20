import { useEffect, useState } from 'react'
import { imagenAncho } from '../format'

/** Foto del producto en el tamaño en que se muestra (ancho en px) con versión 2x para pantallas
 * de alta densidad. `prioridad` = imagen principal visible al cargar (no se difiere).
 * Si la copia reducida falla se intenta la original; si también falla, se muestra la marca. */
export default function Img({ producto, className = '', ancho = 300, prioridad = false }) {
  const url = producto?.imagen_url
  const [intento, setIntento] = useState(0) // 0 reducida, 1 original, 2 sin imagen
  useEffect(() => { setIntento(0) }, [url])
  if (!url || intento >= 2) {
    return <div className={`img-ph ${className}`}><span>{producto?.marca || 'Coolbox'}</span></div>
  }
  const reducida = intento === 0 && imagenAncho(url, ancho) !== url
  return (
    <img className={className} alt={producto.nombre} width={ancho} height={ancho}
      src={reducida ? imagenAncho(url, ancho) : url}
      srcSet={reducida ? `${imagenAncho(url, ancho)} 1x, ${imagenAncho(url, ancho * 2)} 2x` : undefined}
      loading={prioridad ? 'eager' : 'lazy'} fetchPriority={prioridad ? 'high' : 'auto'} decoding="async"
      referrerPolicy="no-referrer" onError={() => setIntento((n) => (reducida ? 1 : 2))} />
  )
}
