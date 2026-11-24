# OpoATC

App de preparación para la **Fase I** de la oposición a controlador de tránsito aéreo, con web de venta, cuentas, suscripciones y plan de estudio personalizado.

- `public/index.html` — web de venta (embudo: precios → registro → plan → pago).
- `public/app.html` — la app (pantallas de acceso en `auth.js`, la app en `app.js`).
- `public/legal.html` — términos, privacidad y cookies (**rellena los campos marcados**).
- `content/` — contenido de pago. **No se publica**: solo lo sirve la función a cuentas con plan.
- `netlify/functions/api.mjs` — API: cuentas, email, Google, Stripe, contenido y sincronización (Netlify Blobs).

## Variables de entorno (Netlify → Site configuration → Environment variables)

| Variable | Para qué | Dónde se consigue |
|---|---|---|
| `STRIPE_SECRET_KEY` | Cobros | Stripe → Developers → API keys (`sk_live_…`; prueba primero con `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Confirmar pagos, renovaciones y cancelaciones | Stripe → Developers → Webhooks → Add endpoint |
| `RESEND_API_KEY` | Email de confirmación de cuenta | resend.com → API Keys |
| `EMAIL_FROM` | Remitente, p. ej. `OpoATC <hola@tudominio.com>` | Dominio verificado en Resend |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | «Continuar con Google» | Google Cloud Console → Credenciales → ID de cliente OAuth (aplicación web) |
| `ADMIN_USERS` | Emails con acceso total, separados por comas | — |
| `SITE_URL` (opcional) | URL pública, p. ej. `https://opoatc.netlify.app` | — |

**Nunca** pongas `TEST_MODE` en producción (simula pagos y emails).

### Stripe
1. Webhook: URL `https://TU-DOMINIO/api/billing/webhook`, eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
2. Activa el portal de cliente (Settings → Billing → Customer portal) con «Cancelar suscripción» permitido.
3. No hace falta crear productos: los precios (8, 15 y 19 €/mes) están en `api.mjs`.

### Google
- Orígenes autorizados: `https://TU-DOMINIO`
- URI de redirección: `https://TU-DOMINIO/api/auth/google/callback`

### Resend
Verifica tu dominio (registros DNS) y usa una dirección de ese dominio en `EMAIL_FROM`. Sin Resend configurado, las cuentas nuevas no pueden confirmar el email.

## Acceso
- La primera cuenta creada es administradora (acceso total y códigos de acceso gratuito en Ajustes).
- Las cuentas creadas antes de esta versión conservan el acceso completo.

## Contenido
Las preguntas salen siempre de los documentos originales (cuestionarios, exámenes de convocatorias anteriores e inglés). Los psicotécnicos se generan al momento (ejercicios propios).
