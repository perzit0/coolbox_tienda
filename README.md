# Coolbox — Tienda online (proyecto académico UNFV)

Tienda web para clientes que usa la misma base de datos y el mismo backend del sistema de caja
(`coolbox_backend`). Proyecto del curso Programación Aplicada III; los pagos son simulados.

## Qué incluye
- Inicio con carrusel de promociones destacadas (auspiciador y fecha de fin en letra pequeña),
  ofertas, lo último y lo más vendido.
- Búsqueda por nombre, marca o SKU; filtros por familia, marca y promoción.
- Ficha de producto con el SKU a la derecha, precio regular y online, promociones vigentes,
  "Llévalos juntos" y más productos de la misma marca y categoría.
- Carrito guardado en el navegador, cupones, venta cruzada "¡Haz tu compra aún mejor!".
- Compra en 3 pasos: Perfil (correo, nombres, apellidos, documento, celular +51, términos y
  promociones) → Entrega (recojo en tienda, la sede más cercana primero, mapa con buscador) →
  Pago (Visa, Mastercard, American Express, Diners Club, Yape, Plin, PagoEfectivo).
- Cuentas de cliente con cualquier correo (Gmail, Outlook, Hotmail, Yahoo...), "Mis compras"
  y seguimiento por número de pedido.

## Ejecutar en local
```
npm install
set VITE_API_URL=http://localhost:5000/api
npm run dev
```
Abre http://localhost:5174

## Desplegar en Vercel
1. Importa este repositorio en Vercel (framework: Vite).
2. Variable de entorno: `VITE_API_URL=https://coolbox-backend-diny.onrender.com/api`
3. Si en Render `FRONTEND_ORIGIN` no es `*`, agrega allí la URL de esta tienda (separada por coma).

## Opcional (backend en Render)
- Ingreso con Google: crea un "OAuth Client ID" (tipo Web) en Google Cloud con el dominio de
  Vercel como origen autorizado y define `GOOGLE_CLIENT_ID` en Render.
- Código de acceso por correo: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`,
  `SMTP_PASSWORD` (contraseña de aplicación de Gmail) y `SMTP_FROM`.
Si no se configuran, esos botones no aparecen y se usa correo + contraseña.

## Tarjetas de prueba
Visa 4111 1111 1111 1111 · Mastercard 5555 5555 5555 4444 · American Express 3782 822463 10005 ·
Diners Club 3056 9309 0259 04 (cualquier fecha futura y CVV). Solo se guarda la marca y los
últimos 4 dígitos.
