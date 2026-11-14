import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'
import Inicio from './pages/Inicio'
import Buscar from './pages/Buscar'
import Producto from './pages/Producto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Confirmacion from './pages/Confirmacion'
import MisCompras from './pages/MisCompras'
import Seguimiento from './pages/Seguimiento'
import Info from './pages/Info'

export default function App() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname, search])
  const enCheckout = pathname.startsWith('/checkout')
  return (
    <>
      <div className="aviso-academico" role="note">
        Proyecto académico — Programación Aplicada III (UNFV). No es la tienda oficial de Coolbox: los pagos son simulados, no ingreses datos reales de tarjeta.
      </div>
      <Header simple={enCheckout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/p/:sku" element={<Producto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido/:codigo" element={<Confirmacion />} />
          <Route path="/mis-compras" element={<MisCompras />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/info/:tema" element={<Info />} />
          <Route path="*" element={<div className="contenedor vacio"><h1>Página no encontrada</h1></div>} />
        </Routes>
      </main>
      <Footer simple={enCheckout} />
      <LoginModal />
      <Toast />
    </>
  )
}
