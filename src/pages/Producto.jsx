import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Img from '../components/Img'
import Icon from '../components/Icon'
import Riel from '../components/Riel'
import { Precio, PromoTag } from '../components/Precio'
import { money } from '../format'
import { useTienda } from '../store'

function LlevalosJuntos({ base, extras }) {
  const { agregar, notificar } = useTienda()
  const todos = [base, ...extras]
  const [sel, setSel] = useState(() => new Set(todos.map((p) => p.id)))
  useEffect(() => { setSel(new Set([base, ...extras].map((p) => p.id))) }, [base, extras])
  if (!extras.length) return null
  const elegidos = todos.filter((p) => sel.has(p.id))
  const total = elegidos.reduce((s, p) => s + p.precio, 0)
  const regular = elegidos.reduce((s, p) => s + p.precio_regular, 0)
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const anadir = () => {
    elegidos.forEach((p) => agregar(p, 1, true))
    notificar(`Agregaste ${elegidos.length} producto${elegidos.length === 1 ? '' : 's'} a tu carrito.`)
  }
  return (
    <section className="juntos">
      <h2>Llévalos juntos</h2>
      <div className="juntos-fila">
        {todos.map((p, i) => (
          <div key={p.id} className="juntos-item-wrap">
            {i > 0 && <span className="juntos-mas">+</span>}
            <label className={`juntos-item ${sel.has(p.id) ? '' : 'apagado'}`}>
              <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} disabled={i === 0} />
              <Img producto={p} />
              <span className="juntos-nombre">{i === 0 ? 'Este producto: ' : ''}{p.nombre}</span>
              <span className="juntos-precio">{money(p.precio)}</span>
            </label>
          </div>
        ))}
        <div className="juntos-total">
          <span>Precio total</span>
          {regular > total && <s className="muted">{money(regular)}</s>}
          <b>{money(total)}</b>
          <button className="btn btn-primary" onClick={anadir} disabled={!elegidos.length}>
            Añadir {elegidos.length} ítem{elegidos.length === 1 ? '' : 's'} al carrito
          </button>
        </div>
      </div>
    </section>
  )
}

export default function Producto() {
  const { sku } = useParams()
  const { agregar } = useTienda()
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [cant, setCant] = useState(1)

  useEffect(() => {
    setD(null); setError(''); setCant(1)
    api(`/tienda/productos/${sku}`).then(setD).catch((e) => setError(e.message))
  }, [sku])

  if (error) return <div className="contenedor vacio"><h1>{error}</h1><Link to="/" className="btn btn-dark">Volver al inicio</Link></div>
  if (!d) return <div className="contenedor"><div className="skeleton pdp-skel" /></div>
  const p = d.producto
  const extra = p.promociones.filter((x) => x.id !== p.promocion?.id)
  return (
    <div className="contenedor">
      <nav className="migas">
        <Link to="/">Inicio</Link> / <Link to={`/buscar?familia=${p.familia_id}`}>{p.familia}</Link> / <span>{p.subfamilia}</span>
      </nav>
      <div className="pdp">
        <div className="pdp-img">
          <Img producto={p} />
          {p.descuento_pct > 0 && <span className="pdp-badge">-{p.descuento_pct}%</span>}
        </div>
        <div className="pdp-info">
          <div className="pdp-top">
            <Link to={`/buscar?marca=${p.marca_id}`} className="pdp-marca">{p.marca}</Link>
            <span className="pdp-sku">SKU: <b>{p.sku}</b></span>
          </div>
          <h1 className="pdp-nombre">{p.nombre}</h1>
          <Precio p={p} grande />
          <PromoTag promo={p.promocion} />
          {extra.map((x) => <PromoTag key={x.id} promo={x} />)}
          {p.promocion && ['NXM', 'SEGUNDA_UNIDAD', 'VOLUMEN'].includes(p.promocion.tipo) && (
            <p className="pdp-nota">El descuento de esta promoción se aplica en el carrito al llevar las unidades indicadas.</p>
          )}
          <div className="pdp-compra">
            <div className="cantidad">
              <button onClick={() => setCant((c) => Math.max(1, c - 1))} aria-label="Quitar uno">−</button>
              <span>{cant}</span>
              <button onClick={() => setCant((c) => Math.min(Math.min(20, p.stock), c + 1))} aria-label="Agregar uno">+</button>
            </div>
            <button className="btn btn-primary btn-grande" disabled={!p.disponible} onClick={() => agregar(p, cant)}>
              {p.disponible ? 'Agregar al carrito' : 'Producto agotado'}
            </button>
          </div>
          <ul className="pdp-beneficios">
            <li><Icon name="store" /> <span><b>Recojo en tienda gratis.</b> Elige la sede más cercana al pagar.</span></li>
            <li><Icon name="shield" /> <span>{p.stock > 5 ? 'Stock disponible' : p.stock > 0 ? `Últimas ${p.stock} unidades` : 'Sin stock por ahora'}</span></li>
          </ul>
          <dl className="pdp-ficha">
            <dt>Marca</dt><dd>{p.marca}</dd>
            <dt>Categoría</dt><dd>{p.familia} / {p.subfamilia}</dd>
            <dt>Código de referencia</dt><dd>{p.codigo}</dd>
            <dt>SKU</dt><dd>{p.sku}</dd>
          </dl>
        </div>
      </div>
      <LlevalosJuntos base={p} extras={d.llevalos_juntos} />
      <Riel titulo={`Más productos ${p.marca}`} productos={d.misma_marca} verTodo={`/buscar?marca=${p.marca_id}`} />
      <Riel titulo={`También te puede interesar en ${p.familia}`} productos={d.misma_familia} verTodo={`/buscar?familia=${p.familia_id}`} />
    </div>
  )
}
