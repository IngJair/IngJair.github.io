import { createRemoteJWKSet, jwtVerify } from 'jose';

const MEDIA_PREFIX = '/media/';
const VALID_KEY = /^(imagenes|videos|logos|banners)\/[a-z0-9][a-z0-9._-]{0,179}$/i;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
// Workers Free accepts requests of up to 100 MB. Leaving a safety margin
// prevents a video from reaching the platform limit after HTTP overhead.
const MAX_VIDEO_BYTES = 90 * 1024 * 1024;
const keySets = new Map();

function json(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), { ...init, headers });
}

function allowedOrigins(env) {
  return new Set(
    String(env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  );
}

function addWriteCors(headers, request, env) {
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins(env).has(origin)) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
  }
}

function isAllowedWriteOrigin(request, env) {
  const origin = request.headers.get('origin');
  return Boolean(origin && allowedOrigins(env).has(origin));
}

function preflight(request, env) {
  if (!isAllowedWriteOrigin(request, env)) {
    return json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const headers = new Headers({
    'access-control-allow-methods': 'GET, HEAD, PUT, DELETE, OPTIONS',
    'access-control-allow-headers': 'Authorization, Content-Type, Cache-Control',
    'access-control-max-age': '86400',
  });
  addWriteCors(headers, request, env);
  return new Response(null, { status: 204, headers });
}

function keyFromUrl(url) {
  if (!url.pathname.startsWith(MEDIA_PREFIX)) return null;

  try {
    const key = url.pathname
      .slice(MEDIA_PREFIX.length)
      .split('/')
      .map(segment => decodeURIComponent(segment))
      .join('/');
    return VALID_KEY.test(key) ? key : null;
  } catch {
    return null;
  }
}

function publicObjectUrl(url, key) {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `${url.origin}${MEDIA_PREFIX}${encodedKey}`;
}

function getKeySet(issuer) {
  if (!keySets.has(issuer)) {
    keySets.set(
      issuer,
      createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)),
    );
  }
  return keySets.get(issuer);
}

async function requireAdmin(request, env) {
  const authorization = request.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || match[1].length > 8192) {
    throw new Error('UNAUTHORIZED');
  }

  const issuer = String(env.SUPABASE_ISSUER || '').replace(/\/+$/, '');
  if (!issuer || !env.ADMIN_USER_ID) {
    throw new Error('MISCONFIGURED');
  }

  const { payload } = await jwtVerify(match[1], getKeySet(issuer), {
    issuer,
    audience: 'authenticated',
    algorithms: ['ES256', 'RS256'],
  });

  if (payload.sub !== env.ADMIN_USER_ID || payload.role !== 'authenticated') {
    throw new Error('FORBIDDEN');
  }

  return payload;
}

function publicHeaders() {
  return new Headers({
    'access-control-allow-origin': '*',
    'cross-origin-resource-policy': 'cross-origin',
    'accept-ranges': 'bytes',
  });
}

async function readObject(request, env, key) {
  if (request.method === 'HEAD') {
    const object = await env.MEDIA.head(key);
    if (!object) return new Response('Archivo no encontrado.', { status: 404 });

    const headers = publicHeaders();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('content-length', String(object.size));
    return new Response(null, { status: 200, headers });
  }

  const object = await env.MEDIA.get(key, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return new Response('Archivo no encontrado.', { status: 404 });

  const headers = publicHeaders();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  // A missing body means that an HTTP conditional request did not match.
  if (!('body' in object)) {
    return new Response(null, { status: 412, headers });
  }

  if (object.range && 'offset' in object.range && 'length' in object.range) {
    const start = object.range.offset;
    const end = start + object.range.length - 1;
    headers.set('content-range', `bytes ${start}-${end}/${object.size}`);
    headers.set('content-length', String(object.range.length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response(object.body, { status: 200, headers });
}

async function writeObject(request, env, url, key) {
  const claims = await requireAdmin(request, env);
  const folder = key.split('/', 1)[0];
  const contentType = (request.headers.get('content-type') || '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase();
  const allowedTypes = folder === 'videos' ? VIDEO_TYPES : IMAGE_TYPES;
  const maxBytes = folder === 'videos' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const declaredLength = Number(request.headers.get('content-length'));

  if (!allowedTypes.has(contentType)) {
    return json({ error: 'Tipo de archivo no permitido.' }, { status: 415 });
  }
  if (
    Number.isFinite(declaredLength)
    && declaredLength > 0
    && declaredLength > maxBytes
  ) {
    return json({ error: 'El archivo supera el límite permitido.' }, { status: 413 });
  }
  if (folder === 'videos' && (!declaredLength || declaredLength < 1)) {
    return json({ error: 'No se pudo comprobar el tamaño del video.' }, { status: 411 });
  }

  let body = request.body;
  if (folder !== 'videos') {
    const imageBytes = await request.arrayBuffer();
    if (imageBytes.byteLength > maxBytes) {
      return json({ error: 'La imagen supera el límite de 2 MB.' }, { status: 413 });
    }
    body = imageBytes;
  }

  const stored = await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
    customMetadata: {
      uploadedBy: claims.sub,
      uploadedAt: new Date().toISOString(),
    },
  });

  if (!stored) {
    return json({ error: 'Cloudflare no confirmó la carga.' }, { status: 502 });
  }

  return json(
    {
      key,
      size: stored.size,
      url: publicObjectUrl(url, key),
    },
    { status: 201 },
  );
}

async function deleteObject(request, env) {
  await requireAdmin(request, env);
  // Keep the object so historical content can always restore its media.
  return new Response(null, { status: 204 });
}

function withWriteCors(response, request, env) {
  const headers = new Headers(response.headers);
  addWriteCors(headers, request, env);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, storage: 'r2' });
    }

    const key = keyFromUrl(url);
    if (!key) {
      return json({ error: 'Ruta de archivo no válida.' }, { status: 404 });
    }

    if (request.method === 'OPTIONS') return preflight(request, env);
    if (request.method === 'GET' || request.method === 'HEAD') {
      return readObject(request, env, key);
    }
    if (request.method !== 'PUT' && request.method !== 'DELETE') {
      return new Response('Método no permitido.', {
        status: 405,
        headers: { allow: 'GET, HEAD, PUT, DELETE, OPTIONS' },
      });
    }
    if (!isAllowedWriteOrigin(request, env)) {
      return json({ error: 'Origen no permitido.' }, { status: 403 });
    }

    try {
      const response = request.method === 'PUT'
        ? await writeObject(request, env, url, key)
        : await deleteObject(request, env);
      return withWriteCors(response, request, env);
    } catch (error) {
      const status = error.message === 'FORBIDDEN'
        ? 403
        : error.message === 'MISCONFIGURED'
          ? 503
          : 401;
      const message = status === 503
        ? 'El servicio de archivos no está configurado.'
        : 'Sesión administrativa no válida.';
      return withWriteCors(json({ error: message }, { status }), request, env);
    }
  },
};
