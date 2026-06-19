# Manual QA Checklist

Actualizado: 2026-06-19, America/Costa_Rica.

## Scope

Checklist manual para validar `https://staging.fengzlab.tech` apuntando por Cloudflare Tunnel a `http://localhost:3001`.

No ejecutar con datos reales de clientes hasta que login, portal, PDFs, backups y healthcheck pasen.

## Public pages

- [ ] `/` carga por HTTPS.
- [ ] `/services` carga por HTTPS y describe servicios del taller, no un SaaS.
- [ ] `/products` carga por HTTPS y se siente como tienda/catalogo del taller.
- [ ] `/contact` carga por HTTPS y muestra una llamada clara a solicitar reparacion.
- [ ] Navbar y footer usan FengzLab como marca publica.
- [ ] No quedan textos visibles de demo, SaaS generico o plataforma vendible.
- [ ] No aparecen stack traces, rutas locales, secretos ni placeholders tecnicos.

## Staff auth and admin

- [ ] Abrir `/admin/tickets` en incognito redirige a login con `next=/admin/tickets`.
- [ ] Login staff local funciona.
- [ ] Despues de login, vuelve a la ruta solicitada.
- [ ] Refresh en `/admin` conserva sesion.
- [ ] Refresh en `/admin/tickets` conserva sesion.
- [ ] Refresh en `/admin/intake` conserva sesion.
- [ ] Refresh en `/admin/dashboard` conserva sesion.
- [ ] Logout limpia sesion.
- [ ] Rutas admin vuelven a pedir login despues de logout.

## Workshop workflow

- [ ] Crear intake de prueba.
- [ ] Crear o abrir ticket generado.
- [ ] Revisar detalle de ticket.
- [ ] Actualizar estado de prueba si aplica.
- [ ] Agregar nota/comentario de prueba si aplica.
- [ ] Crear o revisar cotizacion.
- [ ] Crear o revisar factura.
- [ ] Registrar pago de prueba si aplica.
- [ ] Confirmar que dashboard/admin refleja el cambio esperado.

## Portal and PDFs

- [ ] Portal cliente por token carga sin login admin.
- [ ] Portal muestra solo informacion apta para cliente.
- [ ] Portal no muestra notas internas ni rutas privadas.
- [ ] PDF de cotizacion por token genera correctamente.
- [ ] PDF de factura por token genera correctamente.
- [ ] PDFs usan marca FengzLab visible al cliente.

## Private files

- [ ] Upload de archivo permitido funciona en flujo de prueba.
- [ ] Tipo MIME no permitido se rechaza.
- [ ] Limite de tamano se respeta si se prueba con archivo grande.
- [ ] Archivo privado no se sirve desde `public/`.
- [ ] Descargar archivo privado requiere staff autenticado.

## Health and tunnel

- [ ] `http://localhost:3001/api/health` responde `ok`.
- [ ] `https://staging.fengzlab.tech/api/health` responde `ok` o queda protegido intencionalmente por Cloudflare Access.
- [ ] La app no expone secretos, filesystem paths, datos de clientes ni stack traces en healthcheck.
- [ ] Cloudflare Tunnel esta saludable.
- [ ] Workstation no entra en suspension durante la prueba.

## Mobile smoke test

- [ ] Home es legible en telefono.
- [ ] Servicios/productos/contacto son navegables en telefono.
- [ ] Login admin es usable en telefono.
- [ ] Tickets e intake son usables al menos para operaciones basicas.
- [ ] Portal cliente es claro y usable en telefono.

## No-go findings

Detener pruebas con datos reales si aparece cualquiera de estos puntos:

- Sesion admin se pierde al refrescar rutas protegidas.
- Portal cliente expone informacion interna.
- PDFs fallan o muestran marca/datos incorrectos.
- Healthcheck queda `degraded`.
- Upload privado queda accesible publicamente.
- No existe backup reciente antes de probar datos reales.
- Staging queda abierto sin Cloudflare Access o control equivalente.
