import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import Icon from './Icon'

/** Fila horizontal de productos con flechas (como "Lo último", "Ofertas"). */
export default function Riel({ titulo, productos, verTodo }) {
  const ref = useRef(null)
  if (!productos?.length) return null
  const mover = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="riel">
      <div className="riel-head">
        <h2>{titulo}</h2>
        {verTodo && <Link to={verTodo} className="link">Ver todo</Link>}
      </div>
      <div className="riel-wrap">
        <button className="riel-btn izq" onClick={() => mover(-1)} aria-label="Anterior"><Icon name="left" /></button>
        <div className="riel-lista" ref={ref}>
          {productos.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <button className="riel-btn der" onClick={() => mover(1)} aria-label="Siguiente"><Icon name="right" /></button>
      </div>
    </section>
  )
}
