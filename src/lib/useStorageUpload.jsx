/**
 * useStorageUpload — Hook centralizado para subir/eliminar archivos.
 * Las cargas nuevas usan Cloudflare R2. Supabase Storage se mantiene como
 * compatibilidad para los archivos anteriores durante la migración.
 *
 * Estructura de carpetas:
 *   imagenes/   → hero, intro, portafolio (portadas)
 *   videos/     → archivos mp4 de galería
 *   logos/      → logo del sitio, marca
 *   banners/    → imágenes de promos/anuncios
 */

import { useState, useCallback } from 'react';
import { supabase } from './supabase';

const BUCKET = 'elky-studios';
const DEFAULT_MEDIA_API_URL = 'https://elky-studios-media-api.e-j-javier.workers.dev';
const MEDIA_API_URL = (
  import.meta.env.VITE_MEDIA_API_URL || DEFAULT_MEDIA_API_URL
).replace(/\/+$/, '');

// ─── Validaciones ────────────────────────────────────────────────────────────
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const VIDEO_EXTS = ['mp4'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;   // 2 MB después de optimizar
const MAX_IMAGE_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 90 * 1024 * 1024; // Margen bajo el límite HTTP de Workers Free

function validateFile(file, folder) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (folder === 'videos') {
    if (!VIDEO_EXTS.includes(ext) || !VIDEO_MIME_TYPES.includes(file.type))
      return `Solo se permiten videos MP4. Archivo recibido: .${ext}`;
    if (file.size > MAX_VIDEO_BYTES)
      return `El video supera el límite de 90 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  } else {
    if (!IMAGE_EXTS.includes(ext) || !IMAGE_MIME_TYPES.includes(file.type))
      return `Solo JPG, PNG o WebP. Archivo recibido: .${ext}`;
    if (file.size > MAX_IMAGE_SOURCE_BYTES)
      return `La imagen supera el límite de entrada de 25 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

export async function optimizeImage(file, {
  maxDimension = 2400,
  maxBytes = MAX_IMAGE_BYTES,
} = {}) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true });
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    for (const quality of [0.86, 0.78, 0.68]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= maxBytes) {
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagen';
        return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
      }
    }
  } catch (error) {
    console.warn('[Storage] No se pudo optimizar la imagen:', error.message);
  }

  return file.size <= maxBytes ? file : null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Genera un path único: carpeta/timestamp-nombre-limpio.ext */
function buildPath(folder, file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 40);
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${folder}/${uniqueId}-${safeName}.${ext}`;
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function r2PathFromUrl(url) {
  if (!url || !MEDIA_API_URL) return null;
  try {
    const mediaOrigin = new URL(MEDIA_API_URL);
    const objectUrl = new URL(url);
    if (objectUrl.origin !== mediaOrigin.origin || !objectUrl.pathname.startsWith('/media/')) {
      return null;
    }
    return objectUrl.pathname
      .slice('/media/'.length)
      .split('/')
      .map(decodeURIComponent)
      .join('/');
  } catch {
    return null;
  }
}

function supabasePathFromUrl(url) {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

/** Devuelve la URL pública de un path dentro del almacenamiento activo. */
export function getPublicUrl(path) {
  if (!path) return '';
  if (MEDIA_API_URL) return `${MEDIA_API_URL}/media/${encodePath(path)}`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}

/** Extrae el path relativo de una URL pública de R2 o Supabase Storage. */
export function pathFromUrl(url) {
  return r2PathFromUrl(url) || supabasePathFromUrl(url);
}

async function uploadToR2(path, file) {
  const { data, error: sessionError } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  if (sessionError || !accessToken) {
    throw new Error('La sesión administrativa venció. Vuelve a iniciar sesión.');
  }

  const response = await fetch(`${MEDIA_API_URL}/media/${encodePath(path)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: file,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Cloudflare respondió con estado ${response.status}.`);
  }
  return result.url || getPublicUrl(path);
}

async function deleteFromR2(path) {
  const { data, error: sessionError } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;
  if (sessionError || !accessToken) return false;

  const response = await fetch(`${MEDIA_API_URL}/media/${encodePath(path)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.ok;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useStorageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sube un archivo a Cloudflare R2.
   * @param {File} file — Archivo a subir
   * @param {'imagenes'|'videos'|'logos'|'banners'} folder — Carpeta destino
   * @param {string|null} oldUrl — URL anterior para eliminar (reemplazo)
   * @returns {Promise<string|null>} — URL pública o null si hubo error
   */
  const uploadFile = useCallback(async (file, folder = 'imagenes', oldUrl = null) => {
    setError(null);

    // Validar
    const validationError = validateFile(file, folder);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setUploading(true);
    try {
      const preparedFile = folder === 'videos' ? file : await optimizeImage(file);
      if (!preparedFile) {
        setError('No se pudo reducir la imagen a menos de 2 MB. Prueba con otra fotografía.');
        return null;
      }

      // 1. Subir el archivo nuevo antes de retirar el anterior. Así, un fallo
      // de red nunca deja una imagen existente apuntando a un archivo borrado.
      const path = buildPath(folder, preparedFile);
      const publicUrl = await uploadToR2(path, preparedFile);

      // 3. Eliminar el archivo anterior solamente después de confirmar la
      // nueva subida. Los archivos antiguos de Supabase se conservan durante
      // la transición; solo se retiran reemplazos que ya pertenecían a R2.
      const oldPath = r2PathFromUrl(oldUrl);
      if (oldPath && oldPath !== path) {
        const removed = await deleteFromR2(oldPath);
        if (!removed) {
          console.warn('[Storage] No se pudo retirar el archivo reemplazado de R2.');
        }
      }

      return publicUrl;
    } catch (e) {
      setError(`Error inesperado: ${e.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Elimina un archivo dado su URL pública, sea de R2 o del sistema anterior.
   * @param {string} url — URL pública
   * @returns {Promise<boolean>}
   */
  const deleteFile = useCallback(async (url) => {
    const r2Path = r2PathFromUrl(url);
    if (r2Path) return deleteFromR2(r2Path);

    const legacyPath = supabasePathFromUrl(url);
    if (!legacyPath) return false;
    const { error: delError } = await supabase.storage.from(BUCKET).remove([legacyPath]);
    if (delError) {
      console.warn('[Storage] Error al eliminar:', delError.message);
      return false;
    }
    return true;
  }, []);

  return { uploadFile, deleteFile, uploading, error, setError };
}
