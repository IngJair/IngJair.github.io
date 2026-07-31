import { useCallback, useEffect, useRef, useState } from 'react';
import { useSiteContent } from '../../context/useSiteContent';

const cardStyle = {
  padding: 24,
  background: '#fff',
  border: '2px solid #e0e0e0',
  borderRadius: 12,
};

export default function AdminSettings({ authenticatedEmail }) {
  const {
    content,
    getContentVersions,
    replaceContent,
    restoreContentVersion,
  } = useSiteContent();
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [notice, setNotice] = useState('');
  const importInputRef = useRef(null);

  const loadVersions = useCallback(async () => {
    setLoadingVersions(true);
    setVersions(await getContentVersions());
    setLoadingVersions(false);
  }, [getContentVersions]);

  useEffect(() => {
    let active = true;
    getContentVersions().then(items => {
      if (!active) return;
      setVersions(items);
      setLoadingVersions(false);
    });
    return () => {
      active = false;
    };
  }, [getContentVersions]);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `elky-studios-respaldo-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Respaldo descargado correctamente.');
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const result = replaceContent(parsed);
      if (!result.success) throw new Error(result.error);
      setNotice('Respaldo cargado. Revisa el contenido y pulsa Guardar para publicarlo.');
    } catch (error) {
      setNotice(`No se pudo importar el respaldo: ${error.message}`);
    }
  };

  const restoreVersion = (version) => {
    if (!confirm('¿Cargar esta versión? Podrás revisarla antes de pulsar Guardar.')) return;
    const result = restoreContentVersion(version);
    if (result.success) {
      setNotice('Versión recuperada en el editor. Pulsa Guardar para publicarla.');
    } else {
      setNotice(result.error || 'No se pudo recuperar la versión.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        Configuración y respaldos
      </h2>

      {notice && (
        <div style={{
          marginBottom: 18,
          padding: '12px 16px',
          borderRadius: 8,
          background: '#fef9ee',
          border: '1px solid #e8d9b5',
          color: '#6d531c',
          fontSize: 13,
        }}>
          {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <section style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Cuenta administrativa
          </h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
            La sesión está protegida mediante Supabase Auth.
          </p>

          <label style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#888',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 6,
          }}>
            Correo autenticado
          </label>
          <input
            type="email"
            value={authenticatedEmail}
            disabled
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 14,
              boxSizing: 'border-box',
              marginBottom: 12,
              background: '#f5f5f5',
              color: '#777',
            }}
          />

          <div style={{
            padding: 12,
            background: '#fff3e0',
            border: '1px solid #ffb74d',
            borderRadius: 8,
            fontSize: 12,
            color: '#e65100',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
            <span>
              Usa “Olvidé mi contraseña” en la pantalla de acceso si necesitas recuperar la cuenta.
            </span>
          </div>
        </section>

        <section style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Respaldo manual
          </h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 18 }}>
            Descarga una copia completa o importa una copia anterior. Importar no publica nada hasta que pulses Guardar.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" className="btn-primary" onClick={exportBackup}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, marginRight: 6 }}>download</span>
              Descargar respaldo
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => importInputRef.current?.click()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17, marginRight: 6 }}>upload_file</span>
              Importar respaldo
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={importBackup}
            />
          </div>
        </section>
      </div>

      <section style={{ ...cardStyle, marginTop: 20 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Historial recuperable
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Se crea una copia antes de cada publicación y antes de restaurar los valores iniciales.
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={loadVersions} disabled={loadingVersions}>
            {loadingVersions ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>

        {loadingVersions ? (
          <p style={{ color: '#888', fontSize: 13 }}>Cargando historial…</p>
        ) : versions.length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>
            El historial aparecerá después de la primera publicación nueva.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {versions.map(version => (
              <div
                key={`${version.source}-${version.id}-${version.createdAt}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  padding: '12px 14px',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  background: '#fafafa',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: 13 }}>
                    {version.reason || 'Copia automática'}
                  </strong>
                  <span style={{ fontSize: 11, color: '#888' }}>
                    {new Intl.DateTimeFormat('es-PE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(version.createdAt))}
                    {' · '}
                    {version.source === 'Supabase' ? 'Nube' : 'Este dispositivo'}
                  </span>
                </div>
                <button type="button" className="btn-outline" onClick={() => restoreVersion(version)}>
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 10,
        background: '#eef8f0',
        border: '1px solid #b9dfc1',
        color: '#215d2c',
        fontSize: 13,
      }}>
        La restauración completa a la plantilla inicial fue retirada para evitar borrados accidentales.
        Cada publicación crea primero una versión recuperable en la nube y nunca reemplaza una edición más reciente.
      </div>
    </div>
  );
}
