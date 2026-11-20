import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Img from '../components/Img'
import Icon from '../components/Icon'
import Riel from '../components/Riel'
import Resumen from '../components/Resumen'
import { money } from '../format'
import { useTienda } from '../store'
import useCarrito from '../useCarrito'

const IR_CHECKOUT = 'tienda_ir_checkout'

export default function Carrito() {
  const { carrito, cambiarCantidad, quitar, cupon, setCupon, cliente, setLoginAbierto } = useTienda()
  const { cot, error } = useCarrito()
  const [codigo, setCodigo] = useState('')
  const [abrirCupon, setAbrirCupon] = useState(false)
  const [msgCupon, setMsgCupon] = useState('')
  const navigate = useNavigate()

  useEffect(() => { if (cot?.cupon_error) setMsgCupon(cot.cupon_error) }, [cot])

  // Para comprar se necesita una cuenta: al crearla o ingresar desde aquí, se continúa al checkout.
  useEffect(() => {
    if (cliente && sessionStorage.getItem(IR_CHECKOUT)) {
      sessionStorage.removeItem(IR_CHECKOUT)
      navigate('/checkout')
    }
  }, [cliente, navigate])

  if (!carrito.length) {
    return (
      <div className="contenedor vacio">
        <Icon name="cart" size={56} />
        <h1>Tu carrito está vacío</h1>
        <p className="muted">Revisa nuestras ofertas y agrega lo que te guste.</p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    )
  }
  const irAComprar = () => {
    if (cliente) return navigate('/checkout')
    sessionStorage.setItem(IR_CHECKOUT, '1')
    setLoginAbierto('registro')
  }
  const sinStock = cot?.items.some((i) => i.sin_stock)

  return (
    <div className="contenedor">
      <div className="pasos"><span className="activo">1. Carrito</span><span>2. Perfil</span><span>3. Entrega</span><span>4. Pago</span></div>
      <div className="carrito">
        <section>
          <h1>Carrito <small className="muted">({cot?.cantidad ?? carrito.length} productos)</small></h1>
          {error && <div className="alerta alerta-error">{error}</div>}
          <ul className="carrito-lista">
            {(cot?.items || []).map((i) => (
              <li key={i.id} className="carrito-item">
                <Link to={`/p/${i.sku}`}><Img producto={i} className="carrito-img" ancho={160} /></Link>
                <div className="carrito-info">
                  <span className="card-marca">{i.marca}</span>
                  <Link to={`/p/${i.sku}`} className="carrito-nombre">{i.nombre}</Link>
                  <small className="muted">SKU: {i.sku}</small>
                  {i.promocion_aplicada ? <span className="promo-aplicada"><Icon name="tag" size={14} /> {i.promocion_aplicada.nombre} ({i.promocion_aplicada.etiqueta})</span>
                    : i.promocion && <span className="promo-pendiente">{i.promocion.nombre}: {i.promocion.etiqueta}</span>}
                  {i.sin_stock && <span className="alerta-txt">Solo quedan {i.stock} unidades.</span>}
                </div>
                <div className="cantidad">
                  <button onClick={() => cambiarCantidad(i.id, i.cantidad - 1)} disabled={i.cantidad <= 1} aria-label="Quitar uno">−</button>
                  <span>{i.cantidad}</span>
                  <button onClick={() => cambiarCantidad(i.id, i.cantidad + 1)} disabled={i.cantidad >= Math.min(20, i.stock)} aria-label="Agregar uno">+</button>
                </div>
                <div className="carrito-precios">
                  {i.descuento > 0 && <s className="muted">{money(i.bruto)}</s>}
                  <b>{money(i.neto)}</b>
                  <button className="link link-gris" onClick={() => quitar(i.id)}><Icon name="trash" size={15} /> Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/" className="btn btn-outline"><Icon name="left" size={16} /> Volver al inicio</Link>
          <small className="muted bloque">Tu carrito se guarda: puedes seguir viendo productos y volver cuando quieras.</small>
        </section>
        <Resumen cot={cot}>
          <div className="cupon">
            {cupon && cot?.cupon ? (
              <div className="cupon-ok"><Icon name="tag" size={16} /> Cupón <b>{cot.cupon.codigo}</b> aplicado
                <button className="link" onClick={() => { setCupon(''); setMsgCupon('') }}>Quitar</button></div>
            ) : !abrirCupon ? (
              <button className="link" onClick={() => setAbrirCupon(true)}><Icon name="tag" size={16} /> Agregar cupón de descuento</button>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setMsgCupon(''); setCupon(codigo.trim().toUpperCase()) }} className="cupon-form">
                <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código del cupón" aria-label="Código del cupón" />
                <button className="btn btn-dark">Aplicar</button>
              </form>
            )}
            {msgCupon && <small className="alerta-txt">{msgCupon}</small>}
          </div>
          <button className="btn btn-primary btn-block btn-grande" onClick={irAComprar} disabled={!cot || sinStock}>Ir a comprar</button>
        </Resumen>
      </div>
      {cot?.sugerencias?.length > 0 && <Riel titulo="¡Haz tu compra aún mejor!" productos={cot.sugerencias} />}
    </div>
  )
}
