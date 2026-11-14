import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, qs } from '../api'
import ProductCard from '../components/ProductCard'
import { PromoTag } from '../components/Precio'

const ORDENES = [
  ['relevancia', 'Relevancia'], ['descuento', 'Mayor descuento'], ['precio_asc', 'Menor precio'],
  ['precio_desc', 'Mayor precio'], ['nuevos', 'Lo último'],
]

export default function Buscar() {
  const [params, setParams] = useSearchParams()
  const [d, setD] = useState(null)
  const [cat, setCat] = useState({ familias: [], marcas: [] })
  const [promo, setPromo] = useState(null)
  const filtros = Object.fromEntries(params.entries())

  useEffect(() => { api('/tienda/catalogo').then(setCat).catch(() => {}) }, [])
  useEffect(() => {
    setD(null)
    api(`/tienda/productos${qs({ ...filtros, per_page: 24 })}`).then(setD).catch(() => setD({ productos: [], total: 0, pages: 1, page: 1 }))
    if (filtros.promocion) {
      api('/tienda/inicio').then((r) => setPromo(r.promociones.find((p) => String(p.id) === filtros.promocion) || null)).catch(() => {})
    } else setPromo(null)
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = (k, v) => {
    const n = new URLSearchParams(params)
    v ? n.set(k, v) : n.delete(k)
    if (k !== 'page') n.delete('page')
    setParams(n)
  }
  const familia = cat.familias.find((f) => String(f.id) === filtros.familia)
  const marca = cat.marcas.find((m) => String(m.id) === filtros.marca)
  const titulo = promo?.nombre || (filtros.q ? `Resultados para "${filtros.q}"` : familia?.nombre || marca?.nombre || (filtros.ofertas ? 'Ofertas' : 'Todos los productos'))

  return (
    <div className="contenedor">
      <nav className="migas"><Link to="/">Inicio</Link> / <span>{titulo}</span></nav>
      <div className="listado-head">
        <div>
          <h1>{titulo}</h1>
          {promo && (<><p className="muted">{promo.descripcion}</p><PromoTag promo={promo} /></>)}
          {d && <span className="muted">{d.total} producto{d.total === 1 ? '' : 's'}</span>}
        </div>
        <label className="orden">Ordenar por
          <select value={filtros.orden || 'relevancia'} onChange={(e) => cambiar('orden', e.target.value)}>
            {ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="listado">
        <aside className="filtros">
          <h3>Categorías</h3>
          <button className={!filtros.familia ? 'activo' : ''} onClick={() => cambiar('familia', '')}>Todas</button>
          {cat.familias.map((f) => (
            <button key={f.id} className={filtros.familia === String(f.id) ? 'activo' : ''} onClick={() => cambiar('familia', f.id)}>
              {f.nombre} <small>({f.productos})</small>
            </button>
          ))}
          <h3>Marcas</h3>
          <select value={filtros.marca || ''} onChange={(e) => cambiar('marca', e.target.value)}>
            <option value="">Todas las marcas</option>
            {cat.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre} ({m.productos})</option>)}
          </select>
          <label className="check"><input type="checkbox" checked={!!filtros.ofertas} onChange={(e) => cambiar('ofertas', e.target.checked ? '1' : '')} /><span>Solo productos con promoción</span></label>
        </aside>
        <div>
          {!d ? <div className="grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton card-skel" />)}</div>
            : d.productos.length === 0 ? (
              <div className="vacio"><h2>No encontramos productos</h2><p className="muted">Prueba con otra palabra, la marca o el SKU del producto.</p></div>
            ) : (
              <>
                <div className="grid">{d.productos.map((p) => <ProductCard key={p.id} p={p} />)}</div>
                {d.pages > 1 && (
                  <div className="paginas">
                    {Array.from({ length: d.pages }).map((_, i) => (
                      <button key={i} className={d.page === i + 1 ? 'activo' : ''} onClick={() => cambiar('page', i + 1)}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  )
}
