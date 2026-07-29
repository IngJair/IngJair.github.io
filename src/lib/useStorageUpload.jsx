/**
 * useStorageUpload — Hook centralizado para subir/eliminar archivos en Supabase Storage.
 * Bucket: elky-media
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
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;   // 2 MB
const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // 300 MB

function validateFile(file, folder) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (folder === 'videos') {
    if (!VIDEO_EXTS.includes(ext))
      return `Solo se permiten videos MP4. Archivo recibido: .${ext}`;
    if (file.size > MAX_VIDEO_BYTES)
      return `El video supera el límite de 300 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  } else {
    if (!IMAGE_EXTS.includes(ext))
      return `Solo JPG, PNG o WebP. Archivo recibido: .${ext}`;
    if (file.size > MAX_IMAGE_BYTES)
      return `La imagen supera el límite de 2 MB (${(file.size / 1024 / 1024).toFixed(1)} MB). Comprime la imagen antes de subirla.`;
  }
  return null;
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
  return `${folder}/${Date.now()}-${safeName}.${ext}`;
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
  // https://<project>.supabase.co/storage/v1/object/public/elky-media/<path>
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
      // 1. Eliminar archivo anterior si existe
      if (oldUrl) {
        const oldPath = pathFromUrl(oldUrl);
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      // 2. Subir nuevo archivo
      const path = buildPath(folder, file);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, cacheControl: '3600' });

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        return null;
      }

      // 3. Obtener URL pública
      const publicUrl = getPublicUrl(path);
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
