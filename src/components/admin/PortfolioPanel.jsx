import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSiteContent } from '../../context/useSiteContent';
import { AdminSection, AdminField } from './AdminField';
import { useStorageUpload } from '../../lib/useStorageUpload';

const PORTFOLIO_TABS = [
  { id: 'texts', label: 'Textos de la página', icon: 'title' },
  { id: 'categories', label: 'Categorías & Años', icon: 'folder' },
  { id: 'events', label: 'Eventos & Media', icon: 'photo_library' },
];

export default function PortfolioPanel() {
  const { content, update } = useSiteContent();
  const [activeTab, setActiveTab] = useState('texts');
  const portfolio = content.portfolio || {};

  return (
    <div>
      {/* TABS internos */}
      <div className="admin-inner-tabs">
        {PORTFOLIO_TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-inner-tab ${activeTab === tab.id ? 'admin-inner-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'texts' && <PortfolioTextsTab portfolio={portfolio} update={update} />}
          {activeTab === 'categories' && <PortfolioCategoriesTab portfolio={portfolio} update={update} />}
          {activeTab === 'events' && <PortfolioEventsTab portfolio={portfolio} update={update} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PortfolioTextsTab({ portfolio, update }) {
  const applyStyle = (styleObj, base = {}) => ({
    ...base,
    fontSize: styleObj?.fontSize || base.fontSize,
    fontWeight: styleObj?.bold ? 900 : (base.fontWeight || 400),
    fontStyle: styleObj?.italic ? 'italic' : 'normal',
    textDecoration: styleObj?.underline ? 'underline' : 'none',
    color: styleObj?.color || base.color,
  });

  return (
    <div>
      <AdminSection title="Hero del Portafolio" description="Título y subtítulo de la página principal">
        <AdminField label="Título principal">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <textarea
              className="admin-textarea"
              rows={2}
              value={portfolio.hero?.title || ''}
              onChange={e => update('portfolio.hero.title', e.target.value)}
              style={applyStyle(portfolio.hero?.titleStyle)}
            />
            <StyleMiniToolbar
              currentStyle={portfolio.hero?.titleStyle || {}}
              onChange={s => update('portfolio.hero.titleStyle', s)}
              label="Título"
            />
          </div>
        </AdminField>

        <AdminField label="Subtítulo">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <textarea
              className="admin-textarea"
              rows={3}
              value={portfolio.hero?.subtitle || ''}
              onChange={e => update('portfolio.hero.subtitle', e.target.value)}
              style={applyStyle(portfolio.hero?.subtitleStyle)}
            />
            <StyleMiniToolbar
              currentStyle={portfolio.hero?.subtitleStyle || {}}
              onChange={s => update('portfolio.hero.subtitleStyle', s)}
              label="Subtítulo"
            />
          </div>
        </AdminField>
      </AdminSection>

      <AdminSection title="Sección CTA Final" description="El bloque negro al final del portafolio">
        <AdminField label="Título CTA">
          <input
            className="admin-input"
            value={portfolio.cta?.title || ''}
            onChange={e => update('portfolio.cta.title', e.target.value)}
          />
        </AdminField>
        <AdminField label="Subtítulo CTA">
          <textarea
            className="admin-textarea"
            rows={2}
            value={portfolio.cta?.subtitle || ''}
            onChange={e => update('portfolio.cta.subtitle', e.target.value)}
          />
        </AdminField>
        <div className="admin-row">
          <AdminField label="Texto botón primario">
            <input
              className="admin-input"
              value={portfolio.cta?.btnPrimary || ''}
              onChange={e => update('portfolio.cta.btnPrimary', e.target.value)}
            />
          </AdminField>
          <AdminField label="Texto botón secundario">
            <input
              className="admin-input"
              value={portfolio.cta?.btnSecondary || ''}
              onChange={e => update('portfolio.cta.btnSecondary', e.target.value)}
            />
          </AdminField>
        </div>
      </AdminSection>
    </div>
  );
}

function PortfolioCategoriesTab({ portfolio, update }) {
  const [newCat, setNewCat] = useState('');
  const [newYear, setNewYear] = useState('');

  const categories = portfolio.categories || ['Todos'];
  const years = portfolio.years || ['Todos'];

  const addCategory = () => {
    if (!newCat.trim() || categories.includes(newCat.trim())) return;
    update('portfolio.categories', [...categories, newCat.trim()]);
    setNewCat('');
  };

  const removeCategory = (cat) => {
    if (cat === 'Todos') return; 
    update('portfolio.categories', categories.filter(c => c !== cat));
  };

  const addYear = () => {
    if (!newYear.trim() || years.includes(newYear.trim())) return;
    update('portfolio.years', [...years, newYear.trim()].sort((a, b) => {
      if (a === 'Todos') return -1;
      if (b === 'Todos') return 1;
      return b.localeCompare(a); 
    }));
    setNewYear('');
  };

  const removeYear = (year) => {
    if (year === 'Todos') return;
    update('portfolio.years', years.filter(y => y !== year));
  };

  return (
    <div>
      <AdminSection
        title="Categorías"
        description="Estas categorías aparecen como filtros en la página del portafolio y en los menús de navegación del editor. 'Todos' no se puede eliminar."
      >
        <div className="admin-tags-list">
          {categories.map((cat) => (
            <motion.div
              key={cat}
              className="admin-tag"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <span className="material-symbols-outlined admin-tag__icon">folder</span>
              <span className="admin-tag__label">{cat}</span>
              {cat !== 'Todos' && (
                <button
                  className="admin-tag__remove"
                  onClick={() => removeCategory(cat)}
                  title="Eliminar categoría"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="admin-add-tag-row">
          <input
            className="admin-input"
            placeholder="Nueva categoría (ej: Graduaciones)"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <button className="admin-btn admin-btn--primary" onClick={addCategory}>
            <span className="material-symbols-outlined">add</span>
            Agregar
          </button>
        </div>

        <p className="admin-hint">
          <span className="material-symbols-outlined">info</span>
          Al agregar una categoría aquí, aparece automáticamente en los filtros del portafolio.
        </p>
      </AdminSection>

      <AdminSection title="Años" description="Años disponibles como filtro. Se ordenan de más reciente a más antiguo automáticamente.">
        <div className="admin-tags-list">
          {years.map(year => (
            <motion.div key={year} className="admin-tag" layout>
              <span className="material-symbols-outlined admin-tag__icon">calendar_today</span>
              <span className="admin-tag__label">{year}</span>
              {year !== 'Todos' && (
                <button className="admin-tag__remove" onClick={() => removeYear(year)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="admin-add-tag-row">
          <input
            className="admin-input"
            placeholder="Nuevo año (ej: 2025)"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addYear()}
            maxLength={4}
          />
          <button className="admin-btn admin-btn--primary" onClick={addYear}>
            <span className="material-symbols-outlined">add</span>
            Agregar
          </button>
        </div>
      </AdminSection>
    </div>
  );
}

function PortfolioEventsTab({ portfolio, update }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEventData, setNewEventData] = useState({
    id: '', slug: '', title: '', category: 'Bodas', year: '2024',
    location: '', description: '', coverImage: '', hasVideo: false, media: []
  });

  const events = portfolio.events || [];
  const categories = (portfolio.categories || []).filter(c => c !== 'Todos');
  const years = (portfolio.years || []).filter(y => y !== 'Todos');

  const createEvent = () => {
    if (!newEventData.title.trim()) return;
    const slug = newEventData.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const event = { ...newEventData, id: Date.now(), slug };
    update('portfolio.events', [...events, event]);
    setShowNewEventForm(false);
    setNewEventData({ id: '', slug: '', title: '', category: 'Bodas', year: '2024', location: '', description: '', coverImage: '', hasVideo: false, media: [] });
    setSelectedEvent(event.id);
  };

  const deleteEvent = (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    update('portfolio.events', events.filter(e => e.id !== id));
    if (selectedEvent === id) setSelectedEvent(null);
  };

  const updateEvent = (id, field, value) => {
    const updated = events.map(e => e.id === id ? { ...e, [field]: value } : e);
    update('portfolio.events', updated);
  };

  const currentEvent = events.find(e => e.id === selectedEvent);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
      <div className="admin-events-sidebar">
        <div className="admin-events-sidebar__header">
          <span className="admin-events-sidebar__title">Eventos ({events.length})</span>
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => setShowNewEventForm(true)}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo
          </button>
        </div>

        <AnimatePresence>
          {showNewEventForm && (
            <motion.div
              className="admin-new-event-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                className="admin-input"
                placeholder="Nombre del evento *"
                value={newEventData.title}
                onChange={e => setNewEventData(d => ({ ...d, title: e.target.value }))}
              />
              <select
                className="admin-input"
                value={newEventData.category}
                onChange={e => setNewEventData(d => ({ ...d, category: e.target.value }))}
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                className="admin-input"
                value={newEventData.year}
                onChange={e => setNewEventData(d => ({ ...d, year: e.target.value }))}
              >
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn--primary" style={{ flex: 1 }} onClick={createEvent}>
                  Crear
                </button>
                <button className="admin-btn" style={{ flex: 1, background: '#f5f5f5' }} onClick={() => setShowNewEventForm(false)}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="admin-events-list">
          {events.length === 0 && (
            <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: 24 }}>
              Sin eventos todavía. Crea el primero.
            </p>
          )}
          {events.map(event => (
            <button
              key={event.id}
              className={`admin-event-item ${selectedEvent === event.id ? 'admin-event-item--active' : ''}`}
              onClick={() => setSelectedEvent(event.id)}
            >
              <div className="admin-event-item__thumb">
                {event.coverImage
                  ? <img src={event.coverImage} alt={event.title} />
                  : <span className="material-symbols-outlined">photo_camera</span>
                }
              </div>
              <div className="admin-event-item__info">
                <span className="admin-event-item__name">{event.title}</span>
                <span className="admin-event-item__meta">{event.category} · {event.year}</span>
              </div>
              <button
                className="admin-event-item__delete"
                onClick={e => { e.stopPropagation(); deleteEvent(event.id); }}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </button>
          ))}
        </div>
      </div>

      {currentEvent ? (
        <EventEditor
          event={currentEvent}
          categories={categories}
          years={years}
          onUpdate={(field, value) => updateEvent(currentEvent.id, field, value)}
          onUpdateMedia={(media) => updateEvent(currentEvent.id, 'media', media)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#aaa', gap: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>photo_library</span>
          <p style={{ fontSize: 14 }}>Selecciona un evento para editarlo</p>
        </div>
      )}
    </div>
  );
}

function EventEditor({ event, categories, years, onUpdate, onUpdateMedia }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const { uploadFile, uploading } = useStorageUpload();

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const url = await uploadFile(file, 'imagenes', event.coverImage);
    if (url) onUpdate('coverImage', url);
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const folder = isVideo ? 'videos' : 'imagenes';
      const url = await uploadFile(file, folder);
      if (url) {
        const newItem = {
          id: Date.now() + Math.random(),
          type: isVideo ? 'video' : 'image',
          src: url,
          alt: file.name,
          caption: '',
          captionStyle: { fontSize: '14px', bold: false, italic: false, color: '#ffffff' }
        };
        onUpdateMedia([...(event.media || []), newItem]);
      }
    }
  };

  const addYoutubeVideo = () => {
    if (!youtubeUrl.trim()) return;
    let embedUrl = youtubeUrl;
    const ytMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vimeoMatch = youtubeUrl.match(/vimeo\.com\/(\d+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    else if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    const newItem = {
      id: Date.now(),
      type: 'embed',
      src: embedUrl,
      originalUrl: youtubeUrl,
      alt: 'Video',
      caption: '',
      captionStyle: { fontSize: '14px', bold: false, italic: false, color: '#ffffff' }
    };
    onUpdateMedia([...(event.media || []), newItem]);
    setYoutubeUrl('');
  };

  const removeMedia = (id) => {
    onUpdateMedia(event.media.filter(m => m.id !== id));
  };

  const updateMediaCaption = (id, caption, style) => {
    onUpdateMedia(event.media.map(m =>
      m.id === id ? { ...m, caption, captionStyle: style || m.captionStyle } : m
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Información del Evento</h2>
        </div>
        <div className="admin-section__body">
          <div className="admin-row">
            <AdminField label="Nombre del evento">
              <input className="admin-input" value={event.title}
                onChange={e => onUpdate('title', e.target.value)} />
            </AdminField>
            <AdminField label="Ubicación">
              <input className="admin-input" value={event.location || ''}
                onChange={e => onUpdate('location', e.target.value)}
                placeholder="ej: Lima, Perú" />
            </AdminField>
          </div>
          <div className="admin-row">
            <AdminField label="Categoría">
              <select className="admin-input" value={event.category}
                onChange={e => onUpdate('category', e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </AdminField>
            <AdminField label="Año">
              <select className="admin-input" value={event.year}
                onChange={e => onUpdate('year', e.target.value)}>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </AdminField>
          </div>
          <AdminField label="Descripción del evento">
            <textarea className="admin-textarea" rows={3} value={event.description || ''}
              onChange={e => onUpdate('description', e.target.value)}
              placeholder="Cuéntanos sobre este evento..." />
          </AdminField>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Foto de Portada</h2>
        </div>
        <div className="admin-section__body">
          <label htmlFor={`cover-${event.id}`} className="admin-image-upload" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? (
              <div className="admin-image-placeholder">
                <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                <span>Subiendo imagen...</span>
              </div>
            ) : event.coverImage
              ? <img src={event.coverImage} alt="Portada" className="admin-image-preview" />
              : <div className="admin-image-placeholder">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span>Click para subir foto de portada (JPG/PNG/WebP, máx 2MB)</span>
                </div>
            }
          </label>
          <input id={`cover-${event.id}`} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={handleCoverUpload} disabled={uploading} />
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Galería del Evento</h2>
        </div>
        <div className="admin-section__body">
          <div className="admin-media-actions">
            <label htmlFor={`media-${event.id}`} className="admin-btn admin-btn--primary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              <span className="material-symbols-outlined" style={{ animation: uploading ? 'spin 1s linear infinite' : 'none' }}>
                {uploading ? 'sync' : 'add_photo_alternate'}
              </span>
              {uploading ? 'Subiendo...' : 'Subir fotos/videos'}
            </label>
            <input id={`media-${event.id}`} type="file" accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple style={{ display: 'none' }} onChange={handleMediaUpload} disabled={uploading} />
          </div>

          <div className="admin-youtube-row">
            <div style={{ flex: 1 }}>
              <input
                className="admin-input"
                placeholder="URL de YouTube o Vimeo"
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            </div>
            <button className="admin-btn admin-btn--primary" onClick={addYoutubeVideo}
              disabled={!youtubeUrl.trim()}>
              <span className="material-symbols-outlined">add</span>
              Agregar video
            </button>
          </div>

          {(event.media || []).length > 0 && (
            <Reorder.Group
              axis="y"
              values={event.media}
              onReorder={onUpdateMedia}
              className="admin-media-grid"
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {event.media.map(item => (
                <Reorder.Item key={item.id} value={item} className="admin-media-item">
                  <div className="admin-media-item__drag">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="admin-media-item__thumb">
                    {item.type === 'image' && <img src={item.src} alt={item.alt} />}
                    {item.type === 'video' && (
                      <div className="admin-media-item__video-placeholder">
                        <span className="material-symbols-outlined">videocam</span>
                        <span>Video</span>
                      </div>
                    )}
                    {item.type === 'embed' && (
                      <div className="admin-media-item__video-placeholder" style={{ background: '#cc0000' }}>
                        <span className="material-symbols-outlined">play_circle</span>
                        <span>YouTube</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-media-item__caption">
                    <input
                      className="admin-input"
                      placeholder="Texto opcional..."
                      value={item.caption || ''}
                      onChange={e => updateMediaCaption(item.id, e.target.value, item.captionStyle)}
                    />
                    <StyleMiniToolbar
                      currentStyle={item.captionStyle || { fontSize: '14px', bold: false, italic: false, color: '#333333' }}
                      onChange={style => updateMediaCaption(item.id, item.caption, style)}
                      label="Texto foto"
                    />
                  </div>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => removeMedia(item.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}

const FONT_SIZES_MINI = ['10px','11px','12px','13px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];
const COLOR_PRESETS_MINI = ['#0a0a0a','#ffffff','#bf953f','#666666','#999999','#c62828','#1565c0','#2e7d32'];

function StyleMiniToolbar({ currentStyle, onChange, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        className={`text-format-trigger ${open ? 'text-format-trigger--active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={`Formato: ${label}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>text_format</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="text-format-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            style={{ right: 0, left: 'auto', zIndex: 600 }}
          >
            <div className="text-format-panel__header">
              <span className="text-format-panel__title">Formato</span>
              <span className="text-format-panel__field">{label}</span>
              <button className="text-format-panel__close" onClick={() => setOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-format-row">
              <span className="text-format-row__label">Estilo</span>
              <div className="text-format-row__controls">
                <button className={`text-format-btn ${currentStyle.bold ? 'text-format-btn--active' : ''}`}
                  onClick={() => onChange({ ...currentStyle, bold: !currentStyle.bold })}><strong>B</strong></button>
                <button className={`text-format-btn ${currentStyle.italic ? 'text-format-btn--active' : ''}`}
                  onClick={() => onChange({ ...currentStyle, italic: !currentStyle.italic })}><em>I</em></button>
                <button className={`text-format-btn ${currentStyle.underline ? 'text-format-btn--active' : ''}`}
                  onClick={() => onChange({ ...currentStyle, underline: !currentStyle.underline })}>
                  <span style={{ textDecoration: 'underline' }}>U</span></button>
              </div>
            </div>
            <div className="text-format-row">
              <span className="text-format-row__label">Tamaño</span>
              <select className="text-format-select" value={currentStyle.fontSize || '14px'}
                onChange={e => onChange({ ...currentStyle, fontSize: e.target.value })}>
                {FONT_SIZES_MINI.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="text-format-row">
              <span className="text-format-row__label">Color</span>
              <div className="text-format-color-presets">
                {COLOR_PRESETS_MINI.map(c => (
                  <button key={c}
                    className={`text-format-color-swatch ${currentStyle.color === c ? 'text-format-color-swatch--active' : ''}`}
                    style={{ background: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none' }}
                    onClick={() => onChange({ ...currentStyle, color: c })} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
