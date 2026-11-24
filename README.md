# Opo ATC · ENAIRE

App personal para preparar la oposición de controlador aéreo de ENAIRE: cuentas de usuario, progreso sincronizado entre móvil y PC, y funcionamiento sin conexión.

## Publicarla en Netlify

Las cuentas y la sincronización usan una función de Netlify y Netlify Blobs. **Las funciones no se activan si subes la carpeta arrastrándola**, así que usa una de estas dos opciones:

**A · Con GitHub (recomendado):** sube esta carpeta a un repositorio privado. Después, en Netlify, ve a «Add new site» → «Import an existing project», elige el repositorio y pulsa Deploy. La configuración ya viene en `netlify.toml`.

**B · Con la línea de comandos** (necesitas Node instalado):
```bash
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

### Cuentas y claves de invitación
- La **primera cuenta** que se cree en la web es la **administradora** y no necesita clave.
- Para crear cualquier otra cuenta hace falta una **clave de invitación de un solo uso** (formato `ATC-XXXX-XXXX`). La administradora las crea, copia y anula desde **Ajustes → Claves de invitación**.
- Opcional: en Netlify puedes fijar la variable `ADMIN_USERS` (usuarios separados por comas) para elegir quién es administrador.

## Datos que incluye
- 759 preguntas de los cuestionarios (temas 1, 2, 3, 4, 5, 6, 8 y 9).
- 563 preguntas de 11 exámenes oficiales (2017, 2023 y 2024-25), con la respuesta marcada en verde en el PDF.
- Inglés de examenglish.com: 50 de grammar C2, 50 de vocabulary C2 y 422 palabras C2.
- Resúmenes de los 9 temas, que se leen dentro de la app. Los apuntes a mano están transcritos y se puede ver la foto original de cada página.
- La sección Memorizar y las 85 preguntas falladas del documento.
- El plan diario, sacado del Excel de seguimiento.
