import { Link } from 'react-router-dom'
import Img from './Img'
import { Precio } from './Precio'
import { useTienda } from '../store'

export default function ProductCard({ p }) {
  const { agregar } = useTienda()
  const promo = p.promocion
  const etiquetaMultiple = promo && ['NXM', 'SEGUNDA_UNIDAD', 'VOLUMEN'].includes(promo.tipo)
  return (
    <article className="card-prod">
      <Link to={`/p/${p.sku}`} className="card-link">
        <div className="card-img">
          <Img producto={p} />
          {etiquetaMultiple && <span className="card-flag">{promo.etiqueta}</span>}
        </div>
        <span className="card-marca">{p.marca}</span>
        <h3 className="card-nombre">{p.nombre}</h3>
        <Precio p={p} />
      </Link>
      <button className="btn btn-dark btn-block" disabled={!p.disponible} onClick={() => agregar(p)}>
        {p.disponible ? 'Agregar' : 'Agotado'}
      </button>
    </article>
  )
}
