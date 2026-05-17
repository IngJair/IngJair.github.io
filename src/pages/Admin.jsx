import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent, ADMIN_PASSWORD } from '../context/SiteContentContext';

// Páginas del editor inline
import AdminHome from '../components/admin/AdminHome';
import AdminPortfolio from '../components/admin/AdminPortfolio';
import AdminServices from '../components/admin/AdminServices';
import AdminContact from '../components/admin/AdminContact';
import ReviewsPanel from '../components/admin/ReviewsPanel';
import PromosPanel from '../components/admin/PromosPanel';

import { EditableSection, EditableText, EditableImage, StyleMiniToolbar } from '../components/admin/EditorHelpers';
import './Admin.css';

const EDITOR_TABS = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'portfolio', label: 'Portafolio', icon: 'photo_library' },
  { id: 'services', label: 'Servicios', icon: 'work' },
  { id: 'contact', label: 'Contactar', icon: 'contact_phone' },
  { id: 'reviews', label: 'Reseñas', icon: 'rate_review' },
  { id: 'promos', label: 'Anuncios', icon: 'campaign' },
  { id: 'config', label: 'Configuración', icon: 'settings' },
];

export default function Admin() {
  const { hasUnsaved, save, reset, content, update } = useSiteContent();
  const [activePage, setActivePage] = useState('home');
  const [saveToast, setSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('luxe_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (btoa(passwordInput) === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('luxe_admin_auth', 'true');
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('luxe_admin_auth');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = save();
    
    // Pequeño delay artificial para feedback visual si es muy rápido
    setTimeout(() => {
      setIsSaving(false);
      if (result.success) {
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2500);
      } else {
        alert(result.error || "Error al guardar. Es posible que el almacenamiento local esté lleno.");
      }
    }, 400);
  };

  useEffect(() => {
    const checkPending = () => {
      const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
      setPendingCount(pending.length);
    };
    checkPending();
    const interval = setInterval(checkPending, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsaved]);

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: 24
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 40,
            maxWidth: 400,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 28,
              fontFamily: 'Playfair Display, serif',
              color: '#0a0a0a',
              marginBottom: 8
            }}>
              Panel de Administración
            </h1>
            <p style={{ fontSize: 14, color: '#888' }}>
              Ingresa la contraseña para continuar
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#888',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 14px',
                  border: '2px solid',
                  borderColor: error ? '#e53935' : '#e0e0e0',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                placeholder="Escribe tu contraseña"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#888',
                  padding: 4
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {error && (
              <p style={{
                fontSize: 12,
                color: '#e53935',
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {error}
              </p>
            )}
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: 12,
              background: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock_open</span>
            Acceder al Admin
          </button>

          <p style={{
            fontSize: 11,
            color: '#aaa',
            textAlign: 'center',
            marginTop: 20
          }}>
            Contraseña por defecto: <code style={{
              background: '#f5f5f5',
              padding: '2px 6px',
              borderRadius: 4,
              fontFamily: 'monospace'
            }}>admin123</code>
            <br />
            Cámbiala desde Configuración después de entrar
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-inline">
      {/* BARRA FLOTANTE SUPERIOR — pequeña, no invasiva */}
      <div className="admin-topbar">
        <div className="admin-topbar__left">
          <span className="material-symbols-outlined admin-topbar__icon">edit_square</span>
          <span className="admin-topbar__title">Modo Editor</span>
          {hasUnsaved && (
            <motion.span
              className="admin-topbar__unsaved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              · Cambios sin guardar
            </motion.span>
          )}
        </div>

        {/* TABS DE PÁGINAS — centrados */}
        <nav className="admin-topbar__tabs">
          {EDITOR_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-topbar__tab ${activePage === tab.id ? 'admin-topbar__tab--active' : ''} ${tab.id === 'reviews' && pendingCount > 0 ? 'admin-topbar__tab--badge' : ''}`}
              onClick={() => setActivePage(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'reviews' && pendingCount > 0 && (
                <span className="admin-topbar__tab-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-topbar__right">
          <button className="admin-topbar__btn admin-topbar__btn--ghost" onClick={reset} title="Restaurar original">
            <span className="material-symbols-outlined">restart_alt</span>
            <span>Reset</span>
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-topbar__btn admin-topbar__btn--ghost">
            <span className="material-symbols-outlined">open_in_new</span>
            <span>Ver sitio</span>
          </a>
          <button
            className={`admin-topbar__btn admin-topbar__btn--save ${hasUnsaved && !isSaving ? 'admin-topbar__btn--pulse' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            <span className="material-symbols-outlined">
              {isSaving ? 'sync' : (hasUnsaved ? 'save' : 'check_circle')}
            </span>
            <span>
              {isSaving ? 'Guardando...' : (hasUnsaved ? 'Guardar Cambios' : 'Guardado')}
            </span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#555',
              marginLeft: 8
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* TOAST DE GUARDADO */}
      <AnimatePresence>
        {saveToast && (
          <motion.div className="admin-toast"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <span className="material-symbols-outlined">check_circle</span>
            ¡Guardado correctamente!
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENIDO DE LA PÁGINA — ocupa TODO el ancho, sin sidebar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="admin-page-content"
        >
          {activePage === 'home' && <AdminHome />}
          {activePage === 'portfolio' && <AdminPortfolio />}
          {activePage === 'services' && <AdminServices />}
          {activePage === 'contact' && <AdminContact />}
          { activePage === 'reviews' && <ReviewsPanel /> }
          { activePage === 'promos' && <PromosPanel /> }
          {activePage === 'config' && (
            <div style={{ padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
                Configuración del Admin
              </h2>
              
              <div style={{
                maxWidth: 500,
                padding: 24,
                background: '#fff',
                border: '2px solid #e0e0e0',
                borderRadius: 12
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  Cambiar contraseña de acceso
                </h3>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                  Esta contraseña protege el acceso al panel de administración
                </p>
                
                <label style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#888',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6
                }}>
                  Nueva contraseña
                </label>
                <input
                  type="text"
                  value="admin123"
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
                    color: '#999'
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
                  gap: 8
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>warning</span>
                  <div>
                    <strong>Importante:</strong> Guarda esta contraseña en un lugar seguro.
                    Si la olvidas, tendrás que editar el archivo de configuración manualmente.
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
