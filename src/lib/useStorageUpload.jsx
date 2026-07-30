/**
 * useStorageUpload — Hook centralizado para subir/eliminar archivos en Supabase Storage.
 * Bucket: elky-studios
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

// ─── Validaciones ────────────────────────────────────────────────────────────
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const VIDEO_EXTS = ['mp4'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;   // 2 MB después de optimizar
const MAX_IMAGE_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // 300 MB

function validateFile(file, folder) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (folder === 'videos') {
    if (!VIDEO_EXTS.includes(ext) || !VIDEO_MIME_TYPES.includes(file.type))
      return `Solo se permiten videos MP4. Archivo recibido: .${ext}`;
    if (file.size > MAX_VIDEO_BYTES)
      return `El video supera el límite de 300 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
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

/** Devuelve la URL pública de un path dentro del bucket */
export function getPublicUrl(path) {
  if (!path) return '';
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || '';
}

/** Extrae el path relativo de una URL pública de Supabase Storage */
export function pathFromUrl(url) {
  if (!url) return null;
  // https://<project>.supabase.co/storage/v1/object/public/elky-studios/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useStorageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sube un archivo a Supabase Storage.
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
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, preparedFile, { upsert: false, cacheControl: '3600' });

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        return null;
      }

      // 2. Obtener URL pública.
      const publicUrl = getPublicUrl(path);

      // 3. Eliminar el archivo anterior solamente después de confirmar la
      // nueva subida. Los enlaces externos y datos antiguos se conservan.
      const oldPath = pathFromUrl(oldUrl);
      if (oldPath && oldPath !== path) {
        const { error: removeError } = await supabase.storage.from(BUCKET).remove([oldPath]);
        if (removeError) {
          console.warn('[Storage] No se pudo retirar el archivo reemplazado:', removeError.message);
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
   * Elimina un archivo dado su URL pública.
   * @param {string} url — URL pública de Supabase Storage
   * @returns {Promise<boolean>}
   */
  const deleteFile = useCallback(async (url) => {
    const path = pathFromUrl(url);
    if (!path) return false;
    const { error: delError } = await supabase.storage.from(BUCKET).remove([path]);
    if (delError) {
      console.warn('[Storage] Error al eliminar:', delError.message);
      return false;
    }
    return true;
  }, []);

  return { uploadFile, deleteFile, uploading, error, setError };
}
