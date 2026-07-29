import { useId } from 'react';
import { useStorageUpload } from '../../lib/useStorageUpload';

/**
 * Zona reutilizable para subir imágenes o videos con vista previa y estado de carga.
 */
export default function ImageUploadZone({
  currentUrl,
  onUploaded,
  folder = 'imagenes',
  label = 'Subir imagen',
  aspectRatio = '16/9',
  isHero = false,
}) {
  const { uploadFile, uploading, error, setError } = useStorageUpload();
  const reactId = useId();
  const inputId = `upload-${folder}-${reactId.replace(/:/g, '')}`;

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';
    const url = await uploadFile(file, folder, currentUrl);
    if (url) {
      if (isHero) console.info('[Storage] Imagen principal actualizada.');
      onUploaded(url);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={inputId}
        className="admin-image-upload"
        style={{ cursor: uploading ? 'wait' : 'pointer', aspectRatio }}
      >
        {uploading ? (
          <div className="admin-image-placeholder">
            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
              sync
            </span>
            <span>Subiendo...</span>
          </div>
        ) : currentUrl ? (
          <img src={currentUrl} alt="Vista previa" className="admin-image-preview" />
        ) : (
          <div className="admin-image-placeholder">
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <span>{label}</span>
          </div>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept={folder === 'videos' ? 'video/mp4' : 'image/jpeg,image/png,image/webp'}
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={uploading}
      />
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', background: '#ffebee',
          border: '1px solid #ffcdd2', borderRadius: 6,
          fontSize: 12, color: '#c62828',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Cerrar mensaje de error"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>
      )}
    </div>
  );
}
