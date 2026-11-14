import { useEffect, useRef, useState } from 'react'

export default function Img({ producto, className = '' }) {
  const [fallo, setFallo] = useState(false)
  const ref = useRef(null)
  // Si la imagen no responde en 8 s se muestra el recuadro con la marca
  useEffect(() => {
    setFallo(false)
    const t = setTimeout(() => { if (ref.current && !ref.current.complete) setFallo(true) }, 8000)
    return () => clearTimeout(t)
  }, [producto?.imagen_url])
  if (!producto?.imagen_url || fallo) {
    return <div className={`img-ph ${className}`}><span>{producto?.marca || 'Coolbox'}</span></div>
  }
  return <img ref={ref} className={className} src={producto.imagen_url} alt={producto.nombre} loading="lazy"
    referrerPolicy="no-referrer" onError={() => setFallo(true)} />
}
