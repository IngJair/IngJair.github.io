# Elky Studios

Sitio web y panel de administración de Elky Studios, construido con React, Vite,
Supabase y Cloudflare R2.

Sitio público principal: <https://elkystudio.pages.dev>

## Desarrollo local

1. Instala las dependencias con `npm install`.
2. Configura `.env` con la URL y la clave publicable del proyecto de Supabase.
3. Inicia el proyecto con `npm run dev`.

## Supabase

El proyecto usa:

- `site_content` para el contenido editable del sitio.
- `pending_reviews` para las reseñas enviadas por visitantes.
- `contact_requests` para las solicitudes de reserva.
- Supabase Storage `elky-studios` conserva los archivos anteriores durante la migración.
- Cloudflare R2 `elky-studios-media` recibe las nuevas imágenes y videos mediante
  un Worker que valida la sesión administrativa de Supabase.

[`supabase/security.sql`](./supabase/security.sql) crea las tablas, índices, bucket, permisos y políticas RLS. Es idempotente y puede volver a ejecutarse desde el SQL Editor.

## Cloudflare R2

El Worker reproducible está en
[`cloudflare/media-worker.js`](./cloudflare/media-worker.js) y su configuración
en [`cloudflare/wrangler.media.jsonc`](./cloudflare/wrangler.media.jsonc).

```bash
npm run deploy:media
```

La página usa por defecto
`https://elky-studios-media-api.e-j-javier.workers.dev`. Puede reemplazarse con
`VITE_MEDIA_API_URL` cuando se conecte un dominio propio.

## Acceso administrativo

El panel `/admin` usa Supabase Auth; no contiene una contraseña administrativa en el código.

El registro público está desactivado. Para habilitar a un administrador:

1. Abre **Authentication → Users** en Supabase.
2. Selecciona **Add user → Send invitation**.
3. Invita el correo que administrará el sitio.
4. El enlace abre `/admin?setup=1`, donde el usuario crea su contraseña.
5. Después puede entrar normalmente en `/admin` con su correo y contraseña.

En desarrollo local, Vite usa `http://localhost:3000`. Configura esa misma URL en **Authentication → URL Configuration** o reemplázala por el dominio público cuando el sitio sea desplegado.

## Validación

```bash
npm run lint
npm run build
npm audit
```
