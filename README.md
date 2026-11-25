# Opo ATC

App de preparación para la **Fase I** de la oposición a controlador de tránsito aéreo, con web de venta, cuentas, suscripciones y plan de estudio personalizado.

- `public/index.html` — web de venta. Ahora mismo el registro es **solo con código de invitación**.
- `public/app.html` — la app (pantallas de acceso en `auth.js`, la app en `app.js`).
- `public/legal.html` — términos, privacidad y cookies (**rellena los campos marcados**).
- `content/` — contenido de pago. **No se publica**: solo lo sirve la función a cuentas con plan.
- `src/api.mjs` — servidor (cuentas, email, Google, Stripe, contenido, sincronización). Código común.
- `functions/api/[[path]].js` + `src/d1.mjs` — publicación en **Cloudflare Pages** (datos en D1). **Es la que se usa.**
- `netlify/functions/api.mjs` — adaptador de Netlify (ya no se usa; se mantiene por si acaso).

## Cloudflare Pages (configuración)
- Build: *Framework preset* None · *Build command* vacío · *Build output directory* `public`.
- Settings → Bindings → **D1 database**: nombre de variable `DB` (la tabla se crea sola).
- Settings → Runtime → Compatibility date reciente (p. ej. 2025-09-01).
- Si al entrar o crear cuenta aparece «Error 1102» (límite de CPU del plan gratuito), añade la variable `PBKDF2_ITER` = `40000`.

## Variables de entorno (Cloudflare: Settings → Variables and Secrets)

| Variable | Para qué | Dónde se consigue |
|---|---|---|
| `STRIPE_SECRET_KEY` | Cobros | Stripe → Developers → API keys (`sk_live_…`; prueba primero con `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Confirmar pagos, renovaciones y cancelaciones | Stripe → Developers → Webhooks → Add endpoint |
| `RESEND_API_KEY` | Email de confirmación de cuenta | resend.com → API Keys |
| `EMAIL_FROM` | Remitente, p. ej. `OpoATC <hola@tudominio.com>` | Dominio verificado en Resend |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | «Continuar con Google» | Google Cloud Console → Credenciales → ID de cliente OAuth (aplicación web) |
| `ADMIN_USERS` | Emails de las cuentas administradoras, separados por comas (en Cloudflare pon aquí tu email) | — |
| `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET` | Casilla «No soy un robot» al crear cuenta (gratis) | google.com/recaptcha/admin → reCAPTCHA v2 «Casilla No soy un robot», dominio de tu web |
| `OPEN_SIGNUP` | Pon `1` para permitir crear cuentas sin código | — |
| `PAYMENTS` | Pon `1` (con Stripe configurado) para activar los pagos | — |
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

## Acceso (de momento, solo por invitación)
- El administrador (`pablusm99`) crea códigos en su perfil → **Códigos de invitación**. Cada código sirve para **una sola cuenta** y da acceso completo.
- Sin código no se puede crear cuenta (tampoco con Google: pedirá el código después).
- Los pagos están apagados hasta que pongas `PAYMENTS=1` y las claves de Stripe.
- Las cuentas creadas antes conservan el acceso completo.

## Tiempos del plan
Referencia inicial: 2 páginas de resumen con sus preguntas ≈ 1 hora. La app mide lo que tarda cada usuario al estudiar páginas (desde que abre la página hasta que la marca como estudiada) y al responder preguntas, y recalcula el plan con su media.

## Contenido
Las preguntas salen siempre de los documentos originales (cuestionarios, exámenes de convocatorias anteriores e inglés). Los psicotécnicos se generan al momento (ejercicios propios).
