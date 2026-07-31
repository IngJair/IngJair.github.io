import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/useSiteContent';
import { supabase } from '../lib/supabase';

// Páginas del editor inline
import AdminHome from '../components/admin/AdminHome';
import AdminPortfolio from '../components/admin/AdminPortfolio';
import AdminServices from '../components/admin/AdminServices';
import AdminContact from '../components/admin/AdminContact';
import AdminSettings from '../components/admin/AdminSettings';
import ReviewsPanel from '../components/admin/ReviewsPanel';
import PromosPanel from '../components/admin/PromosPanel';

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
  const {
    hasUnsaved,
    save,
    isLoading: isContentLoading,
    syncStatus,
    syncError,
    reloadContent,
  } = useSiteContent();
  const [activePage, setActivePage] = useState('home');
  const [saveToast, setSaveToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authenticatedEmail, setAuthenticatedEmail] = useState('');
  const [error, setError] = useState(() => {
    const authError = new URLSearchParams(window.location.hash.slice(1)).get('error_description');
    return authError ? decodeURIComponent(authError.replace(/\+/g, ' ')) : '';
  });
  const [notice, setNotice] = useState('');
  const [isPasswordSetup, setIsPasswordSetup] = useState(
    () => new URLSearchParams(window.location.search).get('setup') === '1'
  );
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsAuthenticated(Boolean(data.session));
      setAuthenticatedEmail(data.session?.user?.email || '');
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setIsAuthenticated(Boolean(session));
      setAuthenticatedEmail(session?.user?.email || '');
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordSetup(true);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event) => {
    event?.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsLoggingIn(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });
    setIsLoggingIn(false);

    if (authError) {
      setError('No se pudo iniciar sesión. Verifica tus credenciales.');
      setPasswordInput('');
    } else {
      setError('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePasswordRecoveryRequest = async () => {
    const email = emailInput.trim();
    if (!email) {
      setError('Ingresa primero el correo administrativo.');
      return;
    }

    setIsLoggingIn(true);
    setError('');
    setNotice('');
    const redirectTo = `${window.location.origin}/admin?setup=1`;
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setIsLoggingIn(false);

    if (recoveryError) {
      setError('No se pudo enviar el enlace. Intenta nuevamente.');
      return;
    }

    setNotice('Revisa el correo: enviamos un enlace seguro para establecer la contraseña.');
  };

  const handlePasswordSetup = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (newPasswordInput.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsUpdatingPassword(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPasswordInput });
    setIsUpdatingPassword(false);

    if (updateError) {
      setError('No se pudo guardar la contraseña. Solicita un enlace nuevo.');
      return;
    }

    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setNotice('Contraseña creada correctamente. Ya puedes administrar el sitio.');
    setIsPasswordSetup(false);

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('setup');
    cleanUrl.hash = '';
    window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await save();
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSaving(false);

    if (result?.status === 'published') {
      setSaveToast({ type: 'success', message: result.message || 'Cambios publicados correctamente.' });
    } else if (result?.status === 'local-only') {
      setSaveToast({ type: 'warning', message: result.error });
    } else {
      setSaveToast({ type: 'error', message: result?.error || 'No se pudo guardar.' });
    }
    setTimeout(() => setSaveToast(null), 5000);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkPending = async () => {
      try {
        const { count } = await supabase
          .from('pending_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingCount(count || 0);
      } catch {
        // Fallback: localStorage
        const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
        setPendingCount(pending.length);
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 10000); // Poll cada 10s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0a', color: '#fff' }}>
        Verificando acceso seguro…
      </div>
    );
  }

  if (isAuthenticated && !isPasswordSetup && isContentLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0a', color: '#fff' }}>
        Verificando el contenido publicado…
      </div>
    );
  }

  if (isAuthenticated && !isPasswordSetup && syncStatus !== 'synced') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: 24,
      }}>
        <div style={{
          width: 'min(520px, 100%)',
          padding: 32,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 42, color: '#bf953f' }}>
            cloud_off
          </span>
          <h1 style={{ margin: '12px 0 10px', fontSize: 24, color: '#151515' }}>
            Edición protegida
          </h1>
          <p style={{ margin: '0 0 20px', color: '#666', lineHeight: 1.6, fontSize: 14 }}>
            {syncError || 'No se pudo verificar la versión publicada. El editor está bloqueado para impedir una sobrescritura accidental.'}
          </p>
          {hasUnsaved && (
            <p style={{
              margin: '0 0 20px',
              padding: 12,
              borderRadius: 8,
              background: '#fff8e1',
              color: '#795500',
              fontSize: 13,
            }}>
              Tus cambios pendientes quedaron guardados como borrador recuperable en este dispositivo.
            </p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={reloadContent}
            disabled={isContentLoading}
          >
            {isContentLoading ? 'Verificando…' : 'Volver a verificar Supabase'}
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isPasswordSetup) {
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
            maxWidth: 420,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontFamily: 'Playfair Display, serif', color: '#0a0a0a', marginBottom: 8 }}>
              Crea tu contraseña
            </h1>
            <p style={{ fontSize: 14, color: '#777', lineHeight: 1.5 }}>
              Acceso para {authenticatedEmail}. Usa una contraseña de al menos 8 caracteres.
            </p>
          </div>

          <form onSubmit={handlePasswordSetup}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              autoFocus
              autoComplete="new-password"
              value={newPasswordInput}
              onChange={event => setNewPasswordInput(event.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPasswordInput}
              onChange={event => setConfirmPasswordInput(event.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }}
            />

            {error && <p style={{ fontSize: 12, color: '#e53935', marginBottom: 14 }}>{error}</p>}

            <button
              type="submit"
              disabled={isUpdatingPassword}
              style={{
                width: '100%',
                padding: 12,
                background: '#0a0a0a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: isUpdatingPassword ? 'wait' : 'pointer'
              }}
            >
              {isUpdatingPassword ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

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
              Ingresa con tu cuenta administrativa
            </p>
          </div>

          <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#888',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              autoFocus
              autoComplete="username"
              value={emailInput}
              onChange={event => setEmailInput(event.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none'
              }}
              placeholder="admin@ejemplo.com"
            />
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
                autoComplete="current-password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
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
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: 12,
              background: '#0a0a0a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: isLoggingIn ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isLoggingIn ? 'progress_activity' : 'lock_open'}</span>
            {isLoggingIn ? 'Verificando…' : 'Acceder al Admin'}
          </button>

          <button
            type="button"
            onClick={handlePasswordRecoveryRequest}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 8,
              background: 'transparent',
              color: '#555',
              border: 'none',
              fontSize: 12,
              cursor: isLoggingIn ? 'wait' : 'pointer',
              textDecoration: 'underline'
            }}
          >
            Crear o recuperar contraseña
          </button>
          </form>

          {notice && (
            <p style={{
              fontSize: 12,
              color: '#2e7d32',
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 1.5
            }}>
              {notice}
            </p>
          )}

          <p style={{
            fontSize: 11,
            color: '#aaa',
            textAlign: 'center',
            marginTop: 20
          }}>
            Acceso protegido mediante Supabase Auth.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-inline">
      {/* BARRA FLOTANTE SUPERIOR */}
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

        {/* TABS DE PÁGINAS DESKTOP */}
        <nav className="admin-topbar__tabs admin-topbar__tabs--desktop">
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

        {/* SELECT DE PÁGINAS MOBILE */}
        <div className="admin-topbar__mobile-select-wrap">
          <select 
            className="admin-topbar__mobile-select"
            value={activePage} 
            onChange={e => setActivePage(e.target.value)}
          >
            {EDITOR_TABS.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.label} {tab.id === 'reviews' && pendingCount > 0 ? `(${pendingCount})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-topbar__right">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-topbar__btn admin-topbar__btn--ghost" title="Ver sitio web">
            <span className="material-symbols-outlined">open_in_new</span>
            <span className="admin-topbar__btn-label">Ver sitio</span>
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
            <span className="admin-topbar__btn-label">
              {isSaving ? 'Publicando...' : (hasUnsaved ? 'Guardar' : 'Publicado')}
            </span>
          </button>
          <button
            className="admin-topbar__btn-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="admin-topbar__btn-label">Salir</span>
          </button>
        </div>
      </div>

      {/* AVISO MÓVIL */}
      <div className="admin-mobile-warning">
        <span className="material-symbols-outlined">info</span>
        <span>Para una mejor experiencia de edición, usa una tablet o computadora.</span>
      </div>

      {/* TOAST DE GUARDADO */}
      <AnimatePresence>
        {saveToast && (
          <motion.div className={`admin-toast admin-toast--${saveToast.type}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <span className="material-symbols-outlined">
              {saveToast.type === 'success' ? 'cloud_done' : saveToast.type === 'warning' ? 'cloud_off' : 'error'}
            </span>
            {saveToast.message}
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
          {activePage === 'config' && <AdminSettings authenticatedEmail={authenticatedEmail} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
