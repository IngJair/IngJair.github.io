import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContentContext';
import { EditableSection, EditableText, EditableImage, EditableLink, StyleMiniToolbar } from './EditorHelpers';

function ServiceCardEditor({ item, index, isEditing, onUpdate }) {
  const { content } = useSiteContent();
  const [showLinkConfig, setShowLinkConfig] = useState(false);
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [subPanelType, setSubPanelType] = useState(null);

  // Detectar tipo de destino actual al montar o cambiar item
  useEffect(() => {
    if (item.linkDestination?.startsWith('/portfolio')) {
      setSubPanelType('portfolio');
      setShowSubPanel(true);
    } else if (item.linkDestination?.startsWith('/services')) {
      setSubPanelType('services');
      setShowSubPanel(true);
    } else {
      setSubPanelType(null);
      setShowSubPanel(false);
    }
  }, []);

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
      onUpdate(index, 'linkDestination', 'https://wa.me/34600000000');
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
                  fontSize: '12px', fontWeight: 700,
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
                style={{ 
                  fontSize: hero.titleStyle?.fontSize || 'clamp(2.5rem, 6vw, 4.5rem)',
                  fontWeight: hero.titleStyle?.bold ? 900 : 400,
                  fontStyle: hero.titleStyle?.italic ? 'italic' : 'normal',
                  textDecoration: hero.titleStyle?.underline ? 'underline' : 'none',
                  color: hero.titleStyle?.color || '#fff',
                  lineHeight: 1.1,
                  marginBottom: '24px'
                }}
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
                style={{ 
                  fontSize: hero.subtitleStyle?.fontSize || '18px',
                  fontWeight: hero.subtitleStyle?.bold ? 700 : 400,
                  fontStyle: hero.subtitleStyle?.italic ? 'italic' : 'normal',
                  color: hero.subtitleStyle?.color || 'rgba(255,255,255,0.9)',
                  maxWidth: '700px',
                  margin: '0 auto 40px',
                  lineHeight: 1.6
                }}
              />
              {isEditing('hero') && (
                <StyleMiniToolbar
                  currentStyle={hero.subtitleStyle || {}}
                  onChange={(s) => update('hero.subtitleStyle', s)}
                  label="Subtítulo Hero"
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
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
                  style={{
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
                  }}
                />
              </EditableLink>
              
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
                  style={{
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
                  }}
                />
              </EditableLink>
            </div>

            {isEditing('hero') && (
              <div style={{ marginTop: '40px' }}>
                <EditableImage
                  src={hero.backgroundImage}
                  alt="Background"
                  onChange={(v) => update('hero.backgroundImage', v)}
                  isEditing={true}
                  style={{ width: '200px', height: '120px', margin: '0 auto', borderRadius: '8px', border: '2px solid #bf953f' }}
                />
                <p style={{ fontSize: '12px', color: '#bf953f', marginTop: '8px', fontWeight: 700 }}>CAMBIAR FONDO</p>
              </div>
            )}
          </div>
        </section>
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
              <EditableText
                tag="span"
                value={intro.tag}
                onChange={(v) => update('intro.tag', v)}
                isEditing={isEditing('intro')}
                style={{ 
                  fontSize: intro.tagStyle?.fontSize || '11px',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#bf953f',
                  marginBottom: '16px',
                  display: 'block'
                }}
              />
              <EditableText
                tag="h2"
                value={intro.title}
                onChange={(v) => update('intro.title', v)}
                isEditing={isEditing('intro')}
                style={{ 
                  fontSize: '48px',
                  fontFamily: 'Playfair Display, serif',
                  marginBottom: '24px',
                  color: '#0a0a0a'
                }}
              />
              <EditableText
                tag="p"
                value={intro.body}
                onChange={(v) => update('intro.body', v)}
                isEditing={isEditing('intro')}
                style={{ 
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: '#555',
                  marginBottom: '32px'
                }}
              />
              <EditableText
                tag="a"
                value={intro.ctaText}
                onChange={(v) => update('intro.ctaText', v)}
                isEditing={isEditing('intro')}
                style={{ 
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  borderBottom: '2px solid #bf953f',
                  paddingBottom: '4px'
                }}
              />
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
            <EditableText
              tag="h2"
              value={services.title}
              onChange={(v) => update('services.title', v)}
              isEditing={isEditing('services')}
              style={{ 
                fontSize: '48px',
                fontFamily: 'Playfair Display, serif',
                textAlign: 'center',
                marginBottom: '60px',
                color: '#0a0a0a'
              }}
            />
            
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
            <EditableText
              tag="h2"
              value={cta.title}
              onChange={(v) => update('cta.title', v)}
              isEditing={isEditing('cta')}
              style={{ 
                fontSize: '48px',
                fontFamily: 'Playfair Display, serif',
                marginBottom: '20px',
                color: '#fff'
              }}
            />
            <EditableText
              tag="p"
              value={cta.subtitle}
              onChange={(v) => update('cta.subtitle', v)}
              isEditing={isEditing('cta')}
              style={{ 
                fontSize: '18px',
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            />
          </div>
        </section>
      </EditableSection>

    </div>
  );
}
