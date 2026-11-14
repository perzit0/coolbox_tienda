import { useParams } from 'react-router-dom'

const TEXTOS = {
  recojo: ['Recojo en tienda', [
    'Al pagar eliges la tienda donde recogerás tu pedido; te sugerimos la más cercana a tu ubicación y puedes buscar otra en el mapa.',
    'Te avisamos por correo cuando el pedido esté listo. Lo recoge solo el titular de la compra presentando el documento de identidad que registró.',
    'El recojo no tiene costo. Por ahora no realizamos despacho a domicilio.',
  ]],
  pagos: ['Medios de pago', [
    'Tarjetas de crédito y débito Visa, Mastercard, American Express y Diners Club.',
    'Yape y Plin: pagas desde tu app e ingresas el número de operación.',
    'PagoEfectivo: generas un código CIP y lo pagas en tu banca por internet, agentes o bodegas dentro de las 24 horas.',
    'En este proyecto académico todos los pagos son simulados: usa solo las tarjetas de prueba indicadas.',
  ]],
  promociones: ['Condiciones de las promociones', [
    'Cada promoción indica su fecha de vigencia y es válida hasta esa fecha o hasta agotar stock.',
    'Si a un producto le aplican varias promociones, se usa la que más te conviene; las promociones no son acumulables entre sí.',
    'Las promociones del tipo 2x1, 3x2, segunda unidad o por cantidad se aplican automáticamente en el carrito al llevar las unidades indicadas.',
    'Los cupones se ingresan en el carrito, aplican sobre el total ya rebajado y pueden exigir un monto mínimo de compra.',
  ]],
  terminos: ['Términos y condiciones', [
    'Este sitio es un trabajo académico del curso Programación Aplicada III de la Universidad Nacional Federico Villarreal y no constituye una tienda real.',
    'Los productos, precios, promociones y pagos se usan con fines de demostración. Ninguna compra genera cargos ni obligaciones.',
  ]],
  privacidad: ['Política de privacidad', [
    'Usamos tu correo, nombre, documento y celular solo para registrar el pedido de demostración y para que el personal de tienda verifique al titular en el recojo.',
    'No almacenamos números de tarjeta: solo la marca y los últimos 4 dígitos de la tarjeta de prueba.',
    'Si aceptas recibir promociones, se registra tu preferencia; puedes retirarla en cualquier momento.',
  ]],
}

export default function Info() {
  const { tema } = useParams()
  const [titulo, parrafos] = TEXTOS[tema] || ['Información', ['No encontramos esta página.']]
  return (
    <div className="contenedor angosto info">
      <h1>{titulo}</h1>
      {parrafos.map((t) => <p key={t}>{t}</p>)}
    </div>
  )
}
