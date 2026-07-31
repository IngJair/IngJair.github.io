import { useState } from 'react';
import { useSiteContent } from '../../context/useSiteContent';
import { EditableSection, EditableText, EditableImage, EditableLink, StyleMiniToolbar } from './EditorHelpers';
import { applyTextStyle } from '../../lib/textStyle';

const getDestinationType = (destination = '') => {
  if (destination.startsWith('/portfolio')) return 'portfolio';
  if (destination.startsWith('/services')) return 'services';
  return null;
};

function ServiceCardEditor({ item, index, isEditing, onUpdate }) {
  const { content } = useSiteContent();
  const [showLinkConfig, setShowLinkConfig] = useState(false);
  const initialDestinationType = getDestinationType(item.linkDestination);
  const [showSubPanel, setShowSubPanel] = useState(Boolean(initialDestinationType));
  const [subPanelType, setSubPanelType] = useState(initialDestinationType);

  const portfolioCategories = (content.portfolio?.categories || [
    'Bodas', 'Quinceañeros', 'Fiestas Infantiles',
    'Compromisos', 'Bautizos', 'Eventos Corporativos', 'Sesiones Personales'
  ]).filter(c => c !== 'Todos');

  const catIcons = {
    'Bodas': 'favorite', 'Quinceañeros': 'auto_awesome',
    'Fiestas Infantiles': 'celebration', 'Compromisos': 'diamond',
    'Bautizos': 'church', 'Eventos Corporativos': 'business_center',
    'Sesiones Personales': 'portrait', 'Cumpleaños': 'cake',
    'Graduaciones': 'school',
  };

  const PAGE_OPTIONS = [
    { label: 'Inicio', value: '/', icon: 'home' },
    { label: 'Portafolio', value: '/portfolio', icon: 'photo_library' },
    { label: 'Servicios', value: '/services', icon: 'work' },
    { label: 'Contacto', value: '/contact', icon: 'contact_phone' },
    { label: 'WhatsApp', value: 'whatsapp', icon: 'chat_bubble' },
  ];

  // Determina qué opción principal está activa
  const getActivePage = () => {
    if (!item.linkDestination) return null;
    if (item.linkDestination.startsWith('/portfolio')) return '/portfolio';
    if (item.linkDestination.startsWith('/services')) return '/services';
    if (item.linkDestination === '/') return '/';
    if (item.linkDestination === '/contact') return '/contact';
    if (item.linkDestination?.includes('wa.me') || item.linkDestination?.includes('whatsapp')) return 'whatsapp';
    return item.linkDestination;
  };

  const handlePageSelect = (value) => {
    if (value === '/portfolio') {
      onUpdate(index, 'linkDestination', '/portfolio');
      setSubPanelType('portfolio');
      setShowSubPanel(true);
    } else if (value === '/services') {
      onUpdate(index, 'linkDestination', '/services');
      setSubPanelType('services');
      setShowSubPanel(true);
    } else if (value === 'whatsapp') {
      onUpdate(index, 'linkDestination', 'https://wa.me/51978752237');
      setShowSubPanel(false);
      setSubPanelType(null);
    } else {
      onUpdate(index, 'linkDestination', value);
      setShowSubPanel(false);
      setSubPanelType(null);
    }
  };

  const handleSubCategorySelect = (cat) => {
    if (subPanelType === 'portfolio') {
      const dest = cat === 'Todos'
        ? '/portfolio'
        : `/portfolio?categoria=${encodeURIComponent(cat)}`;
      onUpdate(index, 'linkDestination', dest);
    } else if (subPanelType === 'services') {
      const dest = cat === 'Todos'
        ? '/services'
        : `/services?tipo=${encodeURIComponent(cat)}`;
      onUpdate(index, 'linkDestination', dest);
    }
  };

  const isSubCatActive = (cat) => {
    if (subPanelType === 'portfolio') {
      if (cat === 'Todos') return item.linkDestination === '/portfolio';
      return item.linkDestination === `/portfolio?categoria=${encodeURIComponent(cat)}`;
    } else {
      if (cat === 'Todos') return item.linkDestination === '/services';
      return item.linkDestination === `/services?tipo=${encodeURIComponent(cat)}`;
    }
  };

  return (
    <div className="service-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <EditableImage
        src={item.image}
        alt={item.title}
        onChange={(v) => onUpdate(index, 'image', v)}
        isEditing={isEditing}
        style={{ height: '240px' }}
      />
      <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <EditableText
          tag="h3"
          value={item.title}
          onChange={(v) => onUpdate(index, 'title', v)}
          isEditing={isEditing}
          style={{ fontSize: '20px', fontFamily: 'Playfair Display, serif', marginBottom: '12px' }}
        />
        <EditableText
          tag="p"
          value={item.desc}
          onChange={(v) => onUpdate(index, 'desc', v)}
          isEditing={isEditing}
          style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}
        />

        <div style={{ marginTop: 'auto' }}>
          {/* LINK — texto + botón de configurar destino */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {/* Texto del link — editable cuando isEditing */}
            {isEditing ? (
              <span
                contentEditable
                suppressContentEditableWarning
                className="editable-text--active"
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: item.linkStyle?.color || '#0a0a0a',
                  fontWeight: item.linkStyle?.bold ? 900 : 700,
                  fontStyle: item.linkStyle?.italic ? 'italic' : 'normal',
                  textDecoration: 'underline', textUnderlineOffset: '4px',
                  outline: 'none', cursor: 'text', display: 'inline-block',
                }}
                onBlur={e => onUpdate(index, 'linkText', e.target.innerText)}
              >
                {item.linkText}
              </span>
            ) : (
              <span style={{
                fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: item.linkStyle?.color || '#0a0a0a',
                textDecoration: 'underline', textUnderlineOffset: '4px',
                cursor: 'pointer',
              }}>
                {item.linkText}
              </span>
            )}

            {/* Botón configurar link — SIEMPRE visible cuando isEditing */}
            {isEditing && (
              <button
                onClick={() => setShowLinkConfig(v => !v)}
                title="Configurar destino"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1.5px solid #bf953f',
                  background: showLinkConfig ? '#bf953f' : '#fff',
                  cursor: 'pointer',
                  color: showLinkConfig ? '#fff' : '#bf953f',
                  flexShrink: 0,
                  zIndex: 10,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>link</span>
              </button>
            )}
          </div>

          {/* PANEL DE DESTINO */}
          {isEditing && showLinkConfig && (
            <div style={{ marginTop: 12, padding: 16, background: '#fff', border: '1px solid #e8d9b5', borderRadius: 8, boxShadow: '0 4px 16px rgba(191,149,63,0.12)' }}>
              
              {/* Destino actual */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#bf953f', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Destino actual: {item.linkDestination || '(sin definir)'}
              </p>

              {/* Opciones principales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                {PAGE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handlePageSelect(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      border: `1px solid ${getActivePage() === opt.value ? '#bf953f' : '#e0e0e0'}`,
                      background: getActivePage() === opt.value ? '#fef9ee' : '#fafafa',
                      color: getActivePage() === opt.value ? '#bf953f' : '#444',
                      borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: getActivePage() === opt.value ? 700 : 500,
                      textAlign: 'left',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{opt.icon}</span>
                    {opt.label}
                    {(opt.value === '/portfolio' || opt.value === '/services') && (
                      <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', color: '#ccc' }}>
                        chevron_right
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* SUB-PANEL — aparece cuando Portafolio o Servicios está seleccionado */}
              {showSubPanel && subPanelType && (
                <div style={{ borderTop: '1px dashed #e8d9b5', paddingTop: 12, marginTop: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#bf953f', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                      {subPanelType === 'portfolio' ? 'photo_library' : 'work'}
                    </span>
                    {subPanelType === 'portfolio' ? '¿A qué categoría?' : '¿A qué tipo de servicio?'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                    {/* Opción Todos */}
                    <button
                      onClick={() => handleSubCategorySelect('Todos')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px',
                        border: `1px solid ${isSubCatActive('Todos') ? '#bf953f' : 'transparent'}`,
                        background: isSubCatActive('Todos') ? '#fef9ee' : 'transparent',
                        color: isSubCatActive('Todos') ? '#bf953f' : '#555',
                        borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: isSubCatActive('Todos') ? 700 : 500,
                        textAlign: 'left',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
                      Todos
                      {isSubCatActive('Todos') && <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: 16, color: '#bf953f' }}>check_circle</span>}
                    </button>

                    {/* Categorías del portafolio */}
                    {portfolioCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleSubCategorySelect(cat)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px',
                          border: `1px solid ${isSubCatActive(cat) ? '#bf953f' : 'transparent'}`,
                          background: isSubCatActive(cat) ? '#fef9ee' : 'transparent',
                          color: isSubCatActive(cat) ? '#bf953f' : '#555',
                          borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: isSubCatActive(cat) ? 700 : 500,
                          textAlign: 'left',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          {catIcons[cat] || 'photo_camera'}
                        </span>
                        {cat}
                        {isSubCatActive(cat) && <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: 16, color: '#bf953f' }}>check_circle</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHome() {
  const { content, update } = useSiteContent();
  const [editingSection, setEditingSection] = useState(null);
  
   const { hero, intro, services, cta } = content;
  const isEditing = (key) => editingSection === key;

  const updateServiceItem = (index, field, value) => {
    const newItems = [...services.items];
    newItems[index] = { ...newItems[index], [field]: value };
    update('services.items', newItems);
  };

  return (
    <div className="admin-home-inline">
      
      {/* HERO SECTION */}
      <EditableSection
        sectionKey="hero"
        label="Hero Principal"
        onEdit={setEditingSection}
        isEditing={isEditing('hero')}
      >
        <section className="hero" style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${hero.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#fff',
          padding: '0 24px'
        }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 10 }}>
              <EditableText
                tag="h1"
                value={hero.title}
                onChange={(v) => update('hero.title', v)}
                isEditing={isEditing('hero')}
                style={applyTextStyle(hero.titleStyle, {
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  fontWeight: 400,
                  color: '#fff',
                  lineHeight: 1.1,
                  marginBottom: '24px'
                })}
              />
              {isEditing('hero') && (
                <StyleMiniToolbar
                  currentStyle={hero.titleStyle || {}}
                  onChange={(s) => update('hero.titleStyle', s)}
                  label="Título Hero"
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 10 }}>
              <EditableText
                tag="p"
                value={hero.subtitle}
                onChange={(v) => update('hero.subtitle', v)}
                isEditing={isEditing('hero')}
                style={applyTextStyle(hero.subtitleStyle, {
                  fontSize: '18px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '700px',
                  margin: '0 auto 40px',
                  lineHeight: 1.6
                })}
              />
              {isEditing('hero') && (
                <StyleMiniToolbar
                  currentStyle={hero.subtitleStyle || {}}
                  onChange={(s) => update('hero.subtitleStyle', s)}
                  label="Subtítulo Hero"
                />
              )}
            </div>

            <div className="editable-actions-row">
              <div className="editable-action-with-style">
                <EditableLink
                  value={hero.ctaPrimaryDestination}
                  onChange={(v) => update('hero.ctaPrimaryDestination', v)}
                  isEditing={isEditing('hero')}
                >
                  <EditableText
                    tag="button"
                    value={hero.ctaPrimary}
                    onChange={(v) => update('hero.ctaPrimary', v)}
                    isEditing={isEditing('hero')}
                    style={applyTextStyle(hero.ctaPrimaryStyle, {
                      padding: '16px 32px',
                      background: '#bf953f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    })}
                  />
                </EditableLink>
                {isEditing('hero') && (
                  <StyleMiniToolbar
                    currentStyle={hero.ctaPrimaryStyle || {}}
                    onChange={(style) => update('hero.ctaPrimaryStyle', style)}
                    label="Botón principal"
                  />
                )}
              </div>

              <div className="editable-action-with-style">
                <EditableLink
                  value={hero.ctaSecondaryDestination}
                  onChange={(v) => update('hero.ctaSecondaryDestination', v)}
                  isEditing={isEditing('hero')}
                >
                  <EditableText
                    tag="button"
                    value={hero.ctaSecondary}
                    onChange={(v) => update('hero.ctaSecondary', v)}
                    isEditing={isEditing('hero')}
                    style={applyTextStyle(hero.ctaSecondaryStyle, {
                      padding: '16px 32px',
                      background: 'transparent',
                      color: '#fff',
                      border: '2px solid #fff',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    })}
                  />
                </EditableLink>
                {isEditing('hero') && (
                  <StyleMiniToolbar
                    currentStyle={hero.ctaSecondaryStyle || {}}
                    onChange={(style) => update('hero.ctaSecondaryStyle', style)}
                    label="Botón secundario"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PANEL CLARO DE CONFIGURACIÓN DE IMÁGENES DE FONDO (VISIBLE AL EDITAR) */}
        {isEditing('hero') && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8d9b5',
            borderRadius: '12px',
            padding: '28px',
            margin: '24px auto',
            maxWidth: '960px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a0a0a', marginBottom: '24px', borderBottom: '2px solid #bf953f', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#bf953f' }}>wallpaper</span>
              Configuración de Imágenes de Fondo del Hero
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {/* Bloque 1: Desktop */}
              <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>Imagen para PC / Desktop</h4>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>Recomendado 1920x1080 o 1600x900</p>
                <div style={{ width: '100%', height: '180px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #bf953f' }}>
                  <EditableImage
                    src={hero.backgroundImage}
                    alt="Hero Desktop"
                    onChange={(v) => update('hero.backgroundImage', v)}
                    isEditing={true}
                    label="Reemplazar imagen Desktop"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Enfoque Desktop</label>
                  <select className="admin-input" value={hero.imagePosition || 'center center'} onChange={e => update('hero.imagePosition', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', background: '#fff' }}>
                    <option value="center center">Centro</option>
                    <option value="center top">Arriba</option>
                    <option value="center bottom">Abajo</option>
                    <option value="left center">Izquierda</option>
                    <option value="right center">Derecha</option>
                  </select>
                </div>
              </div>

              {/* Bloque 2: Mobile */}
              <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginBottom: '6px' }}>Imagen para celular / Mobile</h4>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>Recomendado 1080x1920 o 900x1600</p>
                <div style={{ width: '120px', height: '180px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #bf953f' }}>
                  <EditableImage
                    src={hero.mobileBackgroundImage || hero.backgroundImage}
                    alt="Hero Mobile"
                    onChange={(v) => update('hero.mobileBackgroundImage', v)}
                    isEditing={true}
                    label="Reemplazar imagen Mobile"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Enfoque Mobile</label>
                  <select className="admin-input" value={hero.mobileImagePosition || 'center center'} onChange={e => update('hero.mobileImagePosition', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', background: '#fff' }}>
                    <option value="center center">Centro</option>
                    <option value="center top">Arriba</option>
                    <option value="center bottom">Abajo</option>
                    <option value="left center">Izquierda</option>
                    <option value="right center">Derecha</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </EditableSection>

      {/* INTRO SECTION */}
      <EditableSection
        sectionKey="intro"
        label="Sección Intro"
        onEdit={setEditingSection}
        isEditing={isEditing('intro')}
      >
        <section className="intro section-padding" style={{ padding: '100px 0', background: '#fff' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <EditableImage
              src={intro.image}
              alt="Intro"
              onChange={(v) => update('intro.image', v)}
              isEditing={isEditing('intro')}
              style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
            
            <div>
              <div className="editable-text-with-toolbar">
                <EditableText
                  tag="span"
                  value={intro.tag}
                  onChange={(v) => update('intro.tag', v)}
                  isEditing={isEditing('intro')}
                  style={applyTextStyle(intro.tagStyle, {
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#bf953f',
                    marginBottom: '16px',
                    display: 'block'
                  })}
                />
                {isEditing('intro') && (
                  <StyleMiniToolbar
                    currentStyle={intro.tagStyle || {}}
                    onChange={(style) => update('intro.tagStyle', style)}
                    label="Etiqueta de introducción"
                  />
                )}
              </div>
              <div className="editable-text-with-toolbar">
                <EditableText
                  tag="h2"
                  value={intro.title}
                  onChange={(v) => update('intro.title', v)}
                  isEditing={isEditing('intro')}
                  style={applyTextStyle(intro.titleStyle, {
                    fontSize: '48px',
                    fontFamily: 'Playfair Display, serif',
                    marginBottom: '24px',
                    color: '#0a0a0a'
                  })}
                />
                {isEditing('intro') && (
                  <StyleMiniToolbar
                    currentStyle={intro.titleStyle || {}}
                    onChange={(style) => update('intro.titleStyle', style)}
                    label="Título de introducción"
                  />
                )}
              </div>
              <div className="editable-text-with-toolbar">
                <EditableText
                  tag="p"
                  value={intro.body}
                  onChange={(v) => update('intro.body', v)}
                  isEditing={isEditing('intro')}
                  style={applyTextStyle(intro.bodyStyle, {
                    fontSize: '16px',
                    lineHeight: 1.8,
                    color: '#555',
                    marginBottom: '32px'
                  })}
                />
                {isEditing('intro') && (
                  <StyleMiniToolbar
                    currentStyle={intro.bodyStyle || {}}
                    onChange={(style) => update('intro.bodyStyle', style)}
                    label="Texto de introducción"
                  />
                )}
              </div>
              <div className="editable-text-with-toolbar editable-text-with-toolbar--compact">
                <EditableText
                  tag="a"
                  value={intro.ctaText}
                  onChange={(v) => update('intro.ctaText', v)}
                  isEditing={isEditing('intro')}
                  style={applyTextStyle(intro.ctaTextStyle, {
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0a0a0a',
                    textDecoration: 'none',
                    borderBottom: '2px solid #bf953f',
                    paddingBottom: '4px'
                  })}
                />
                {isEditing('intro') && (
                  <StyleMiniToolbar
                    currentStyle={intro.ctaTextStyle || {}}
                    onChange={(style) => update('intro.ctaTextStyle', style)}
                    label="Enlace de introducción"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </EditableSection>

      {/* SERVICES PREVIEW */}
      <EditableSection
        sectionKey="services"
        label="Preview Servicios"
        onEdit={setEditingSection}
        isEditing={isEditing('services')}
      >
        <section className="services-preview section-padding" style={{ padding: '100px 0', background: '#f9f9f9' }}>
          <div className="container">
            <div className="editable-text-with-toolbar editable-text-with-toolbar--centered">
              <EditableText
                tag="h2"
                value={services.title}
                onChange={(v) => update('services.title', v)}
                isEditing={isEditing('services')}
                style={applyTextStyle(services.titleStyle, {
                  fontSize: '48px',
                  fontFamily: 'Playfair Display, serif',
                  textAlign: 'center',
                  marginBottom: '60px',
                  color: '#0a0a0a'
                })}
              />
              {isEditing('services') && (
                <StyleMiniToolbar
                  currentStyle={services.titleStyle || {}}
                  onChange={(style) => update('services.titleStyle', style)}
                  label="Título de servicios"
                />
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
              {services.items.map((item, i) => (
                <ServiceCardEditor
                  key={i}
                  item={item}
                  index={i}
                  isEditing={isEditing('services')}
                  onUpdate={updateServiceItem}
                />
              ))}
            </div>
          </div>
        </section>
      </EditableSection>

      {/* CTA SECTION */}
      <EditableSection
        sectionKey="cta"
        label="Sección CTA Final"
        onEdit={setEditingSection}
        isEditing={isEditing('cta')}
      >
        <section className="cta section-padding" style={{ padding: '100px 0', background: '#0a0a0a', color: '#fff', textAlign: 'center' }}>
          <div className="container">
            <div className="editable-text-with-toolbar editable-text-with-toolbar--centered">
              <EditableText
                tag="h2"
                value={cta.title}
                onChange={(v) => update('cta.title', v)}
                isEditing={isEditing('cta')}
                style={applyTextStyle(cta.titleStyle, {
                  fontSize: '48px',
                  fontFamily: 'Playfair Display, serif',
                  marginBottom: '20px',
                  color: '#fff'
                })}
              />
              {isEditing('cta') && (
                <StyleMiniToolbar
                  currentStyle={cta.titleStyle || {}}
                  onChange={(style) => update('cta.titleStyle', style)}
                  label="Título final"
                />
              )}
            </div>
            <div className="editable-text-with-toolbar editable-text-with-toolbar--centered">
              <EditableText
                tag="p"
                value={cta.subtitle}
                onChange={(v) => update('cta.subtitle', v)}
                isEditing={isEditing('cta')}
                style={applyTextStyle(cta.subtitleStyle, {
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: '600px',
                  margin: '0 auto'
                })}
              />
              {isEditing('cta') && (
                <StyleMiniToolbar
                  currentStyle={cta.subtitleStyle || {}}
                  onChange={(style) => update('cta.subtitleStyle', style)}
                  label="Subtítulo final"
                />
              )}
            </div>
          </div>
        </section>
      </EditableSection>

    </div>
  );
}
