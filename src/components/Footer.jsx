import { Link } from 'react-router-dom'
import MediosPago from './MediosPago'
import Icon from './Icon'

export default function Footer({ simple }) {
  return (
    <footer className="footer">
      {!simple && (
        <div className="footer-beneficios">
          <div><Icon name="store" size={26} /><div><b>Recojo en tienda</b><span>Elige la sede más cercana</span></div></div>
          <div><Icon name="shield" size={26} /><div><b>Compra segura</b><span>Tus datos protegidos</span></div></div>
          <div><Icon name="tag" size={26} /><div><b>Promociones</b><span>Ofertas por tiempo limitado</span></div></div>
          <div><Icon name="clock" size={26} /><div><b>Pedido listo</b><span>Te avisamos por correo</span></div></div>
        </div>
      )}
      <div className="footer-main contenedor">
        {!simple && (
          <div className="footer-cols">
            <div>
              <h4>Tienda</h4>
              <Link to="/buscar?ofertas=1">Ofertas</Link>
              <Link to="/buscar?orden=nuevos">Lo último</Link>
              <Link to="/seguimiento">Seguimiento de pedido</Link>
            </div>
            <div>
              <h4>Ayuda</h4>
              <Link to="/info/recojo">Recojo en tienda</Link>
              <Link to="/info/pagos">Medios de pago</Link>
              <Link to="/info/promociones">Condiciones de promociones</Link>
            </div>
            <div>
              <h4>Legal</h4>
              <Link to="/info/terminos">Términos y condiciones</Link>
              <Link to="/info/privacidad">Política de privacidad</Link>
            </div>
          </div>
        )}
        <div className="footer-pago">
          <span className="footer-pago-titulo"><Icon name="lock" size={16} /> PAGO SEGURO</span>
          <MediosPago claro />
        </div>
      </div>
      <div className="footer-legal">
        Proyecto académico del curso Programación Aplicada III — Universidad Nacional Federico Villarreal. Sitio de demostración sin fines comerciales; no está afiliado a Coolbox. Los precios y pagos son simulados.
      </div>
    </footer>
  )
}
