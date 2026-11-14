import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useTienda } from '../store'
import Icon from './Icon'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Inicio de la tienda">
      <span className="logo-cool">cool</span><span className="logo-box">box</span>
      <span className="logo-sub">tienda académica</span>
    </Link>
  )
}

export default function Header({ simple }) {
  const { items, cliente, setLoginAbierto, salir } = useTienda()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [familias, setFamilias] = useState([])
  const [menu, setMenu] = useState(false)
  const [cuenta, setCuenta] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { api('/tienda/catalogo').then((r) => setFamilias(r.familias)).catch(() => {}) }, [])
  useEffect(() => { setQ(params.get('q') || '') }, [params])

  const buscar = (e) => {
    e.preventDefault()
    navigate(`/buscar?q=${encodeURIComponent(q.trim())}`)
  }

  if (simple) {
    return (
      <header className="header header-simple">
        <div className="contenedor header-fila">
          <Logo />
          <span className="compra-segura"><Icon name="lock" size={18} /> Compra 100 % segura</span>
        </div>
      </header>
    )
  }

  return (
    <header className="header">
      <div className="contenedor header-fila">
        <Logo />
        <button className="btn-cat" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          <Icon name={menu ? 'close' : 'menu'} /> Categorías
        </button>
        <form className="buscador" onSubmit={buscar} role="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué estás buscando? Nombre, marca o SKU"
            aria-label="Buscar productos" />
          <button type="submit" aria-label="Buscar"><Icon name="search" /></button>
        </form>
        <div className="header-acciones">
          {cliente ? (
            <div className="cuenta" onMouseLeave={() => setCuenta(false)}>
              <button className="h-accion" onClick={() => setCuenta((c) => !c)}>
                <Icon name="user" /><span>Hola, {cliente.nombres?.split(' ')[0] || cliente.email.split('@')[0]}</span>
              </button>
              {cuenta && (
                <div className="cuenta-menu">
                  <small>{cliente.email}</small>
                  <Link to="/mis-compras" onClick={() => setCuenta(false)}>Mis compras</Link>
                  <button onClick={() => { setCuenta(false); salir() }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="h-accion" onClick={() => setLoginAbierto(true)}>
              <Icon name="user" /><span>Iniciar sesión</span>
            </button>
          )}
          <Link to={cliente ? '/mis-compras' : '/seguimiento'} className="h-accion"><Icon name="bag" /><span>Mis compras</span></Link>
          <Link to="/carrito" className="h-accion h-carrito" aria-label={`Carrito con ${items} productos`}>
            <Icon name="cart" size={24} />
            {items > 0 && <span className="carrito-count">{items}</span>}
          </Link>
        </div>
      </div>
      {menu && (
        <div className="mega" onMouseLeave={() => setMenu(false)}>
          <div className="contenedor mega-grid">
            {familias.map((f) => (
              <div key={f.id}>
                <Link to={`/buscar?familia=${f.id}`} onClick={() => setMenu(false)} className="mega-fam">{f.nombre}</Link>
                {f.subfamilias.map((s) => <span key={s.id} className="mega-sub">{s.nombre}</span>)}
              </div>
            ))}
          </div>
        </div>
      )}
      <nav className="nav-cat">
        <div className="contenedor nav-cat-fila">
          <NavLink to="/buscar?ofertas=1" className="nav-oferta">Ofertas</NavLink>
          {familias.slice(0, 9).map((f) => <Link key={f.id} to={`/buscar?familia=${f.id}`}>{f.nombre}</Link>)}
        </div>
      </nav>
    </header>
  )
}
