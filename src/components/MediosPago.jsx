/* Logos de texto de los medios de pago (no se usan los logos oficiales de las marcas). */
const MEDIOS = [
  { id: 'visa', nombre: 'VISA' },
  { id: 'mastercard', nombre: 'mastercard' },
  { id: 'amex', nombre: 'AMEX' },
  { id: 'diners', nombre: 'Diners Club' },
  { id: 'yape', nombre: 'yape' },
  { id: 'plin', nombre: 'plin' },
  { id: 'pagoefectivo', nombre: 'PagoEfectivo' },
]

export default function MediosPago({ claro = false }) {
  return (
    <div className={`medios ${claro ? 'medios-claro' : ''}`}>
      {MEDIOS.map((m) => <span key={m.id} className={`medio medio-${m.id}`}>{m.nombre}</span>)}
    </div>
  )
}
