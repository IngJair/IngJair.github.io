import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useSiteContent } from '../../context/useSiteContent';
import { EditableSection, EditableText, StyleMiniToolbar } from './EditorHelpers';
import { pathFromUrl, useStorageUpload } from '../../lib/useStorageUpload';
import { applyTextStyle } from '../../lib/textStyle';

export default function AdminPortfolio() {
  const { content, update } = useSiteContent();
  const [editingSection, setEditingSection] = useState(null);
  const portfolio = content.portfolio || {};
  const isEditing = (key) => editingSection === key;

  return (
    <div className="admin-portfolio-inline">

      {/* SECCIÓN HERO */}
      <EditableSection
        sectionKey="port-hero"
        label="Título del Portafolio"
        onEdit={setEditingSection}
        isEditing={isEditing('port-hero')}
      >
        <section style={{ padding: 'clamp(60px, 10vw, 120px) clamp(24px, 8vw, 120px)', textAlign: 'center', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8 }}>
            <EditableText
              tag="h1"
              value={portfolio.hero?.title || 'Nuestro Portafolio'}
              onChange={v => update('portfolio.hero.title', v)}
              isEditing={isEditing('port-hero')}
              style={applyTextStyle(portfolio.hero?.titleStyle, {
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 400,
                color: '#0a0a0a',
                marginBottom: 24,
              })}
            />
            {isEditing('port-hero') && (
              <StyleMiniToolbar
                currentStyle={portfolio.hero?.titleStyle || {}}
                onChange={s => update('portfolio.hero.titleStyle', s)}
                label="Título"
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8 }}>
            <EditableText
              tag="p"
              value={portfolio.hero?.subtitle || 'Momentos capturados con maestría técnica y sensibilidad artística.'}
              onChange={v => update('portfolio.hero.subtitle', v)}
              isEditing={isEditing('port-hero')}
              style={applyTextStyle(portfolio.hero?.subtitleStyle, {
                fontSize: '16px',
                fontWeight: 400,
                color: '#666',
                maxWidth: 600, 
                lineHeight: 1.7 
              })}
            />
            {isEditing('port-hero') && (
              <StyleMiniToolbar
                currentStyle={portfolio.hero?.subtitleStyle || {}}
                onChange={s => update('portfolio.hero.subtitleStyle', s)}
                label="Subtítulo"
              />
            )}
          </div>
        </section>
      </EditableSection>

      {/* SECCIÓN CATEGORÍAS — editar categorías y años */}
      <EditableSection
        sectionKey="port-categories"
        label="Filtros (Categorías & Años)"
        onEdit={setEditingSection}
        isEditing={isEditing('port-categories')}
      >
        <section style={{ padding: '0 clamp(24px, 8vw, 120px) 40px', background: '#fafafa' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
            {(portfolio.categories || ['Todos','Bodas','Quinceañeros']).map(cat => (
              <span key={cat} style={{
                padding: '6px 18px',
                border: '1px solid #e0e0e0',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: cat === 'Todos' ? '#0a0a0a' : '#fff',
                color: cat === 'Todos' ? '#fff' : '#555',
                cursor: 'pointer',
              }}>{cat}</span>
            ))}
          </div>

          {isEditing('port-categories') && (
            <CategoryYearEditor
              categories={portfolio.categories || ['Todos']}
              years={portfolio.years || ['Todos', '2024', '2023']}
              onUpdateCategories={cats => update('portfolio.categories', cats)}
              onUpdateYears={years => update('portfolio.years', years)}
            />
          )}
        </section>
      </EditableSection>

      {/* SECCIÓN GALERÍA — gestión de eventos y fotos */}
      <EditableSection
        sectionKey="port-gallery"
        label="Galería de Eventos"
        onEdit={setEditingSection}
        isEditing={isEditing('port-gallery')}
      >
        <section style={{ padding: '0 clamp(24px, 8vw, 120px) clamp(60px, 10vw, 120px)', background: '#fafafa' }}>
          {/* BOTÓN DE LIMPIEZA AUTOMÁTICA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, paddingTop: 20 }}>
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de eliminar automáticamente todos los proyectos de prueba, incompletos o con imágenes rotas/vacías?")) {
                  const placeholders = ['wjdwodw', 'elena & julián', 'sofía, el debut', 'lanzamiento innova', 'retrato de otoño', 'bautizo de mateo', 'aventuras de leo', 'promesa en la cima'];
                  const cleaned = (portfolio.events || []).filter(item => {
                    const titleLower = (item?.title || '').toLowerCase().trim();
                    if (!titleLower) return false;
                    if (placeholders.includes(titleLower)) return false;
                    const img = (item?.coverImage || item?.image || '').trim();
                    if (!img) return false;
                    if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/')) return false;
                    if (img.includes('lh3.googleusercontent.com')) return false;
                    return true;
                  });
                  update('portfolio.events', cleaned);
                  alert(`Limpieza completada. Se mantuvieron ${cleaned.length} proyectos reales.`);
                }
              }}
              style={{ background: '#ff9800', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(255,152,0,0.3)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cleaning_services</span>
              Eliminar proyectos de prueba/incompletos
            </button>
          </div>

          {isEditing('port-gallery') ? (
            <GalleryEditor
              events={portfolio.events || []}
              categories={(portfolio.categories || []).filter(c => c !== 'Todos')}
              years={(portfolio.years || []).filter(y => y !== 'Todos')}
              onUpdate={events => update('portfolio.events', events)}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {(portfolio.events || []).slice(0, 6).map((event, i) => (
                <div key={event.id || i} style={{ cursor: 'pointer', position: 'relative', border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ aspectRatio: '4/3', background: '#111', borderRadius: 4, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
                    {event.coverImage
                      ? <img src={event.coverImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a1a,#333)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
                          Sin imagen de portada
                        </div>
                    }
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#bf953f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{event.category}</p>
                      <h3 style={{ fontSize: 18, fontFamily: 'Playfair Display, serif', margin: 0 }}>{event.title || 'Proyecto incompleto'}</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar "${event.title || 'Proyecto'}" del portafolio?`)) {
                          const updated = (portfolio.events || []).filter(item => item.id !== event.id);
                          update('portfolio.events', updated);
                        }
                      }}
                      style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {(portfolio.events || []).length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>photo_library</span>
                  <p>Haz click en "Editar" para agregar eventos y fotos</p>
                </div>
              )}
            </div>
          )}
        </section>
      </EditableSection>

      {/* SECCIÓN CTA FINAL — fondo negro */}
      <EditableSection
        sectionKey="port-cta"
        label="CTA Final"
        onEdit={setEditingSection}
        isEditing={isEditing('port-cta')}
      >
        <section style={{ padding: 'clamp(80px, 12vw, 140px) clamp(24px, 8vw, 120px)', background: '#0a0a0a', textAlign: 'center' }}>
          <EditableText
            tag="h2"
            value={portfolio.cta?.title || '¿Listo para contar tu historia?'}
            onChange={v => update('portfolio.cta.title', v)}
            isEditing={isEditing('port-cta')}
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'Playfair Display, serif', color: '#fff', marginBottom: 24 }}
          />
          <EditableText
            tag="p"
            value={portfolio.cta?.subtitle || 'Permítenos capturar la esencia de tus momentos más valiosos.'}
            onChange={v => update('portfolio.cta.subtitle', v)}
            isEditing={isEditing('port-cta')}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 500, margin: '0 auto 40px' }}
          />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <EditableText tag="button" value={portfolio.cta?.btnPrimary || 'Escríbenos Hoy'}
              onChange={v => update('portfolio.cta.btnPrimary', v)}
              isEditing={isEditing('port-cta')}
              style={{ padding: '14px 32px', background: '#fff', color: '#0a0a0a', border: 'none', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', cursor: 'pointer' }} />
            <EditableText tag="button" value={portfolio.cta?.btnSecondary || 'Ver Servicios'}
              onChange={v => update('portfolio.cta.btnSecondary', v)}
              isEditing={isEditing('port-cta')}
              style={{ padding: '14px 32px', border: '2px solid #fff', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', cursor: 'pointer' }} />
          </div>
        </section>
      </EditableSection>
    </div>
  );
}

function CategoryYearEditor({ categories, years, onUpdateCategories, onUpdateYears }) {
  const [newCat, setNewCat] = useState('');
  const [newYear, setNewYear] = useState('');

  return (
    <motion.div
      className="inline-editor-panel"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="inline-editor-panel__section">
        <p className="inline-editor-panel__label">
          <span className="material-symbols-outlined">folder</span>
          Categorías
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {categories.map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#fef9ee', border: '1px solid #e8d9b5', borderRadius: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
              {cat !== 'Todos' && (
                <button onClick={() => onUpdateCategories(categories.filter(c => c !== cat))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', padding: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="admin-input" placeholder="Nueva categoría..." value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newCat.trim() && !categories.includes(newCat.trim())) { onUpdateCategories([...categories, newCat.trim()]); setNewCat(''); }}}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          <button
            onClick={() => { if (newCat.trim() && !categories.includes(newCat.trim())) { onUpdateCategories([...categories, newCat.trim()]); setNewCat(''); }}}
            style={{ padding: '8px 16px', background: '#bf953f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            + Agregar
          </button>
        </div>
      </div>

      <div className="inline-editor-panel__section">
        <p className="inline-editor-panel__label">
          <span className="material-symbols-outlined">calendar_today</span>
          Años
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {years.map(year => (
            <div key={year} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#fef9ee', border: '1px solid #e8d9b5', borderRadius: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{year}</span>
              {year !== 'Todos' && (
                <button onClick={() => onUpdateYears(years.filter(y => y !== year))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', padding: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="admin-input" placeholder="Nuevo año (ej: 2025)" value={newYear} maxLength={4}
            onChange={e => setNewYear(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newYear.trim() && !years.includes(newYear.trim())) { onUpdateYears([...years, newYear.trim()].sort((a,b) => a==='Todos'?-1:b==='Todos'?1:b.localeCompare(a))); setNewYear(''); }}}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }} />
          <button
            onClick={() => { if (newYear.trim() && !years.includes(newYear.trim())) { onUpdateYears([...years, newYear.trim()].sort((a,b) => a==='Todos'?-1:b==='Todos'?1:b.localeCompare(a))); setNewYear(''); }}}
            style={{ padding: '8px 16px', background: '#bf953f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            + Agregar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Componente EventCard - Definido fuera para evitar re-renders innecesarios
function EventCard({ event, isSelected, onSelect, onDelete }) {
  const isIncomplete = !event.title?.trim() || !event.coverImage?.trim() || !event.category?.trim();
  const displayTitle = event.title?.trim() ? event.title : 'Proyecto incompleto';
  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: isSelected ? '#bf953f' : 'transparent',
        cursor: 'pointer',
        background: '#fff',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(191,149,63,0.2)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.15s',
        position: 'relative',
        height: '100%'
      }}
    >
      {/* Miniatura */}
      <div style={{ aspectRatio: '4/3', background: '#f0f0f0', position: 'relative' }}>
        {event.coverImage
          ? <img src={event.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fafafa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#ddd' }}>
                add_photo_alternate
              </span>
              <span style={{ fontSize: 10, color: '#bbb' }}>Sin portada</span>
            </div>
        }

        {/* Badge ⚠ si incompleto */}
        {isIncomplete && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: '#c62828', color: '#fff',
            borderRadius: 4, padding: '2px 6px',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 3,
            zIndex: 2
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
            Incompleto
          </div>
        )}

        {/* Drag handle */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: 3,
          cursor: 'grab', color: '#fff', zIndex: 2
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>drag_indicator</span>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', bottom: 6, right: 6,
            background: '#c62828', border: 'none',
            borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 4, zIndex: 2, fontSize: 11, fontWeight: 700
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
          Eliminar
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{
          fontSize: 13, fontWeight: 700, color: isIncomplete ? '#c62828' : '#0a0a0a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          margin: '0 0 3px'
        }}>
          {displayTitle}
        </p>
        <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
          {event.category || 'Sin categoría'} · {event.year} · {(event.media || []).length} arch.
        </p>
      </div>

      {/* Borde inferior dorado si seleccionado */}
      {isSelected && (
        <div style={{ height: 3, background: '#bf953f' }} />
      )}
    </div>
  );
}

function GalleryEditor({ events, categories, years, onUpdate }) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    uploadFile,
    deleteFile,
    uploading: modalUploading,
    error: modalUploadError,
    setError: setModalUploadError,
  } = useStorageUpload();

  // Estados para el modal
  const [modalTitle, setModalTitle] = useState('');
  const [modalCat, setModalCat] = useState(activeCategory);
  const [modalYear, setModalYear] = useState(years[0] || '2024');
  const [modalCover, setModalCover] = useState('');

  const categoryEvents = events.filter(e => e.category === activeCategory);

  const closeCreateModal = async () => {
    if (modalUploading) return;
    const temporaryPath = pathFromUrl(modalCover);
    if (temporaryPath) await deleteFile(modalCover);
    setShowModal(false);
    setModalTitle('');
    setModalCover('');
    setModalUploadError(null);
  };

  const handleModalCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = await uploadFile(file, 'imagenes', modalCover);
    if (url) setModalCover(url);
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`¿Eliminar "${event.title || 'este evento'}" y sus archivos del portafolio?`)) return;
    const urls = [
      event.coverImage,
      ...(event.media || []).filter(item => item.type !== 'embed').map(item => item.src),
    ].filter(url => pathFromUrl(url));
    for (const url of urls) await deleteFile(url);
    onUpdate(events.filter(item => item.id !== event.id));
    if (selectedId === event.id) setSelectedId(null);
  };

  const handleCreateEvent = () => {
    if (!modalTitle.trim() || !modalCat?.trim() || !modalCover?.trim()) {
      alert("Completa los campos mínimos antes de guardar el proyecto.");
      return;
    }
    const slug = modalTitle.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const event = {
      id: Date.now(), slug,
      title: modalTitle, category: modalCat, year: modalYear,
      location: '', description: '', coverImage: modalCover,
      hasVideo: false, media: []
    };
    onUpdate([...events, event]);
    setActiveCategory(modalCat);
    setSelectedId(event.id);
    setShowModal(false);
    setModalTitle('');
    setModalCover('');
    setModalUploadError(null);
  };

  return (
    <div className="gallery-editor-container">
      {/* 1. TABS DE NAVEGACIÓN POR CATEGORÍA */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12,
        borderBottom: '2px solid #f0e8d0', marginBottom: 24,
        scrollbarWidth: 'none'
      }}>
        {categories.map(cat => {
          const count = events.filter(e => e.category === cat).length;
          const isActive = cat === activeCategory;
          return (
            <button key={cat} onClick={() => { setActiveCategory(cat); setModalCat(cat); setSelectedId(null); }}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                border: '1px solid',
                borderColor: isActive ? '#bf953f' : '#e0e0e0',
                borderRadius: 20,
                background: isActive ? '#bf953f' : '#fff',
                color: isActive ? '#fff' : '#555',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}>
              {cat}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                color: isActive ? '#fff' : '#888',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. CABECERA DE CATEGORÍA ACTIVA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a0a0a', margin: 0 }}>
            {activeCategory}
          </h3>
          <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
            {categoryEvents.length} evento{categoryEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', background: '#bf953f', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          fontSize: 13, fontWeight: 700
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
          Nuevo evento
        </button>
      </div>

      {/* 3. GRID DE CARDS DE EVENTOS */}
      {categoryEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 12, opacity: 0.3 }}>
            photo_library
          </span>
          <p style={{ fontSize: 14, marginBottom: 16 }}>
            Sin eventos en {activeCategory} todavía
          </p>
          <button onClick={() => setShowModal(true)} style={{
            padding: '10px 24px', background: '#0a0a0a', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700
          }}>
            + Agregar primer evento
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="x"
          values={categoryEvents}
          onReorder={(reordered) => {
            const otherEvents = events.filter(e => e.category !== activeCategory);
            onUpdate([...otherEvents, ...reordered]);
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {categoryEvents.map(event => (
            <Reorder.Item key={event.id} value={event} style={{ listStyle: 'none' }}>
              <EventCard
                event={event}
                isSelected={selectedId === event.id}
                onSelect={() => setSelectedId(selectedId === event.id ? null : event.id)}
                onDelete={() => handleDeleteEvent(event)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* 4. PANEL DE EDICIÓN DEL EVENTO SELECCIONADO */}
      <AnimatePresence>
        {selectedId && (() => {
          const selectedEvent = events.find(e => e.id === selectedId);
          if (!selectedEvent) return null;
          return (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                marginTop: 24, padding: 24,
                border: '2px solid #bf953f', borderRadius: 12,
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ color: '#bf953f', fontSize: 20 }}>edit</span>
                  Editando: {selectedEvent.title}
                </h4>
                <button onClick={() => setSelectedId(null)}
                  style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
                    padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#666' }}>
                  Cerrar editor
                </button>
              </div>
              <EventMediaEditor
                event={selectedEvent}
                categories={categories}
                years={years}
                onUpdate={(field, value) =>
                  onUpdate(events.map(e => e.id === selectedId ? { ...e, [field]: value } : e))
                }
                onUpdateMedia={media =>
                  onUpdate(events.map(e => e.id === selectedId ? { ...e, media } : e))
                }
              />
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 5. MODAL DE NUEVO EVENTO */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 24
            }}
            onClick={e => { if (e.target === e.currentTarget) closeCreateModal(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#fff', borderRadius: 16, padding: 32,
                width: '100%', maxWidth: 520,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Playfair Display, serif', margin: 0 }}>
                  Nuevo evento
                </h3>
                <button onClick={closeCreateModal}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                </button>
              </div>

              {/* Foto de portada — área grande de upload */}
              <label htmlFor="modal-cover" style={{
                display: 'block', cursor: 'pointer',
                border: '2px dashed #e0e0e0', borderRadius: 10,
                overflow: 'hidden', height: 160, marginBottom: 20,
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#bf953f'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
              >
                {modalCover
                  ? <img src={modalCover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8, color: '#aaa' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                        {modalUploading ? 'sync' : 'add_photo_alternate'}
                      </span>
                      <span style={{ fontSize: 13 }}>
                        {modalUploading ? 'Subiendo a Supabase...' : 'Subir foto de portada * (Requerido)'}
                      </span>
                    </div>
                }
              </label>
              <input id="modal-cover" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                disabled={modalUploading}
                onChange={handleModalCoverUpload} />
              {modalUploadError && (
                <p style={{ margin: '-12px 0 16px', color: '#c62828', fontSize: 12 }}>
                  {modalUploadError}
                </p>
              )}

              {/* Campos en grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#888',
                    textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                    Nombre del evento *
                  </label>
                  <input
                    autoFocus
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0',
                      borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                      outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Ej: Boda de Ana y Carlos"
                    value={modalTitle}
                    onChange={e => setModalTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && modalTitle.trim() && modalCat?.trim() && modalCover?.trim() && handleCreateEvent()}
                    onFocus={e => e.target.style.borderColor = '#bf953f'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#888',
                    textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                    Categoría *
                  </label>
                  <select style={{ width: '100%', padding: '10px 14px',
                    border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13 }}
                    value={modalCat} onChange={e => setModalCat(e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#888',
                    textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                    Año
                  </label>
                  <select style={{ width: '100%', padding: '10px 14px',
                    border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13 }}
                    value={modalYear} onChange={e => setModalYear(e.target.value)}>
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={closeCreateModal}
                  style={{ flex: 1, padding: '11px', border: '1px solid #e0e0e0',
                    background: '#fff', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#555' }}>
                  Cancelar
                </button>
                <button
                  disabled={modalUploading || !modalTitle.trim() || !modalCat?.trim() || !modalCover?.trim()}
                  onClick={handleCreateEvent}
                  style={{
                    flex: 2, padding: '11px', border: 'none',
                    background: (!modalUploading && modalTitle.trim() && modalCat?.trim() && modalCover?.trim()) ? '#0a0a0a' : '#e0e0e0',
                    color: (!modalUploading && modalTitle.trim() && modalCat?.trim() && modalCover?.trim()) ? '#fff' : '#aaa',
                    borderRadius: 8, cursor: (!modalUploading && modalTitle.trim() && modalCat?.trim() && modalCover?.trim()) ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 700, transition: 'all 0.15s'
                  }}>
                  {modalUploading ? 'Subiendo...' : 'Crear evento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventMediaEditor({ event, categories, years, onUpdate, onUpdateMedia }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const { uploadFile, deleteFile, uploading, error, setError } = useStorageUpload();

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadFile(file, 'imagenes', event.coverImage);
    if (url) onUpdate('coverImage', url);
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const uploadedItems = [];
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const url = await uploadFile(file, isVideo ? 'videos' : 'imagenes');
      if (url) {
        uploadedItems.push({
          id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          type: isVideo ? 'video' : 'image',
          src: url,
          alt: file.name,
          caption: '',
          captionStyle: { fontSize: '14px', bold: false, italic: false, color: '#ffffff' },
        });
      }
    }
    if (uploadedItems.length > 0) {
      onUpdateMedia([...(event.media || []), ...uploadedItems]);
    }
  };

  const handleRemoveMedia = async (item) => {
    const storagePath = pathFromUrl(item.src);
    if (storagePath) {
      const removed = await deleteFile(item.src);
      if (!removed) {
        setError('No se pudo eliminar el archivo. Intenta nuevamente.');
        return;
      }
    }
    onUpdateMedia(event.media.filter(mediaItem => mediaItem.id !== item.id));
  };

  const addEmbed = () => {
    if (!youtubeUrl.trim()) return;
    const ytMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vimeoMatch = youtubeUrl.match(/vimeo\.com\/(\d+)/);
    let embedUrl = youtubeUrl;
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    else if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    const item = { id: Date.now(), type: 'embed', src: embedUrl, originalUrl: youtubeUrl, alt: 'Video', caption: '' };
    onUpdateMedia([...(event.media || []), item]);
    setYoutubeUrl('');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto', maxHeight: 600, paddingRight: 10 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nombre</label>
          <input style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
            value={event.title} onChange={e => onUpdate('title', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Ubicación</label>
          <input style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
            placeholder="ej: Lima, Perú" value={event.location || ''} onChange={e => onUpdate('location', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Categoría</label>
          <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
            value={event.category} onChange={e => onUpdate('category', e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Año</label>
          <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
            value={event.year} onChange={e => onUpdate('year', e.target.value)}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Foto de Portada</label>
        <label htmlFor={`cover-${event.id}`} style={{ display: 'block', cursor: 'pointer', border: '2px dashed #e0e0e0', borderRadius: 8, overflow: 'hidden', height: 120 }}>
          {event.coverImage
            ? <img src={event.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#aaa', fontSize: 13 }}>
                <span className="material-symbols-outlined">add_photo_alternate</span>Subir portada
              </div>}
        </label>
        <input id={`cover-${event.id}`} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
          disabled={uploading} onChange={handleCoverUpload} />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Galería de fotos y videos</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <label htmlFor={`media-${event.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px dashed #bf953f', borderRadius: 6, cursor: 'pointer', color: '#bf953f', fontSize: 12, fontWeight: 700 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {uploading ? 'sync' : 'add_photo_alternate'}
            </span>
            {uploading ? 'Subiendo a Supabase...' : 'Subir fotos/videos'}
          </label>
          <input id={`media-${event.id}`} type="file" accept="image/jpeg,image/png,image/webp,video/mp4"
            multiple style={{ display: 'none' }} disabled={uploading} onChange={handleMediaUpload} />
        </div>
        {error && (
          <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: '#ffebee', color: '#c62828', fontSize: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12 }}
            placeholder="URL YouTube o Vimeo..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          <button onClick={addEmbed} disabled={!youtubeUrl.trim()}
            style={{ padding: '8px 14px', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: youtubeUrl.trim() ? 1 : 0.4 }}>
            + Agregar
          </button>
        </div>
        <p style={{ margin: '-8px 0 14px', color: '#888', fontSize: 11 }}>
          Las fotos se optimizan automáticamente. Para videos largos, usa YouTube o Vimeo para ahorrar almacenamiento y acelerar el sitio.
        </p>

        {(event.media || []).length > 0 && (
          <Reorder.Group axis="y" values={event.media} onReorder={onUpdateMedia}
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {event.media.map(item => (
              <Reorder.Item key={item.id} value={item}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'grab', listStyle: 'none' }}>
                <span className="material-symbols-outlined" style={{ color: '#ccc', fontSize: 20 }}>drag_indicator</span>
                <div style={{ width: 56, height: 40, borderRadius: 4, overflow: 'hidden', background: '#e0e0e0', flexShrink: 0 }}>
                  {item.type === 'image' && <img src={item.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {item.type === 'video' && <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>videocam</span></div>}
                  {item.type === 'embed' && <div style={{ width: '100%', height: '100%', background: '#cc0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>play_circle</span></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <input style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12 }}
                    placeholder="Texto de la foto (opcional)..."
                    value={item.caption || ''}
                    onChange={e => onUpdateMedia(event.media.map(m => m.id === item.id ? { ...m, caption: e.target.value } : m))} />
                </div>
                <button onClick={() => handleRemoveMedia(item)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', padding: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
