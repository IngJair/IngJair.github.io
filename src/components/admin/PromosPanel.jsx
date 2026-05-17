import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContentContext';
import { ImageUploadZone } from '../../lib/useStorageUpload';

export default function PromosPanel() {
  const { content, update } = useSiteContent();
  const [activeTab, setActiveTab] = useState('home');
  const [expandedCard, setExpandedCard] = useState(0); // Solo una card expandida a la vez

  const promos = content.promos || {};
  const homePopup = promos.homePopup || {};
  const portfolioPopup = promos.portfolioPopup || {};

  const updateCard = (index, field, value) => {
    const cards = [...(homePopup.cards || [])];
    cards[index] = { ...cards[index], [field]: value };
    update('promos.homePopup.cards', cards);
  };

  const updateCardFeature = (cardIdx, featIdx, value) => {
    const cards = [...(homePopup.cards || [])];
    const feats = [...(cards[cardIdx].features || [])];
    feats[featIdx] = value;
    cards[cardIdx] = { ...cards[cardIdx], features: feats };
    update('promos.homePopup.cards', cards);
  };

  const addCard = () => {
    const newCard = {
      id: `promo-${Date.now()}`, category: 'Nueva Categoría',
      title: 'Nuevo Paquete', description: 'Descripción del paquete',
      price: 'S/500', currency: 'S/', features: ['Característica 1'],
      image: '', ctaText: 'Conocer más', ctaLink: '/services',
      whatsappText: 'Hola! Me interesa este paquete', active: true,
    };
    const newCards = [...(homePopup.cards || []), newCard];
    update('promos.homePopup.cards', newCards);
    setExpandedCard(newCards.length - 1);
  };

  const removeCard = (index) => {
    if (!confirm('¿Eliminar esta card de anuncio?')) return;
    update('promos.homePopup.cards', (homePopup.cards || []).filter((_, i) => i !== index));
    setExpandedCard(Math.max(0, expandedCard - 1));
  };

  const categoryIcons = {
    'Bodas': 'favorite', 'Quinceañeros': 'auto_awesome',
    'Bautizos': 'church', 'Fiestas Infantiles': 'celebration',
    'Eventos Corporativos': 'business_center', 'Sesiones Personales': 'portrait',
    'Compromisos': 'diamond', 'Cumpleaños': 'cake',
  };

  return (
    <div style={{ maxWidth: 860 }}>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '2px solid #f0e8d0', paddingBottom: 0 }}>
        {[
          { id: 'home', label: 'Popup de Inicio', icon: 'home', desc: 'Aparece al entrar a la web' },
          { id: 'portfolio', label: 'Popup de Portafolio', icon: 'photo_library', desc: 'Aparece tras 1 min viendo una categoría' },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '12px 20px', border: 'none', background: 'transparent',
              cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #bf953f' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: activeTab === tab.id ? '#bf953f' : '#aaa' }}>{tab.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: activeTab === tab.id ? '#bf953f' : '#555' }}>{tab.label}</span>
            </div>
            <span style={{ fontSize: 11, color: '#aaa', paddingLeft: 26 }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ===== TAB HOME ===== */}
      {activeTab === 'home' && (
        <div>

          {/* Config general — tarjeta de estado */}
          <div style={{ background: '#0a0a0a', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Toggle ON/OFF grande */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</span>
              <button
                onClick={() => update('promos.homePopup.enabled', homePopup.enabled === false ? true : false)}
                style={{
                  width: 64, height: 32, borderRadius: 16,
                  background: homePopup.enabled !== false ? '#bf953f' : '#333',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.3s',
                }}
              >
                <motion.div
                  animate={{ x: homePopup.enabled !== false ? 34 : 4 }}
                  transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', top: 4, width: 24, height: 24, background: '#fff', borderRadius: '50%' }}
                />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: homePopup.enabled !== false ? '#bf953f' : '#555' }}>
                {homePopup.enabled !== false ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>

            <div style={{ width: 1, height: 60, background: '#222' }} />

            {/* Frecuencia */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>repeat</span>
                Frecuencia
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { value: 'daily', label: 'Diario' },
                  { value: 'session', label: 'Por sesión' },
                  { value: 'always', label: 'Siempre' },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => update('promos.homePopup.frequency', opt.value)}
                    style={{
                      padding: '6px 14px', border: '1px solid',
                      borderColor: (homePopup.frequency || 'daily') === opt.value ? '#bf953f' : '#333',
                      background: (homePopup.frequency || 'daily') === opt.value ? '#bf953f' : 'transparent',
                      color: (homePopup.frequency || 'daily') === opt.value ? '#0a0a0a' : '#888',
                      borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: 1, height: 60, background: '#222' }} />

            {/* Delay */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                Aparece después de
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={0} max={30} step={1}
                  value={homePopup.delaySeconds || 2}
                  onChange={e => update('promos.homePopup.delaySeconds', Number(e.target.value))}
                  style={{ width: 100, accentColor: '#bf953f' }} />
                <span style={{ fontSize: 18, fontWeight: 900, color: '#bf953f', minWidth: 40, textAlign: 'center' }}>
                  {homePopup.delaySeconds || 2}s
                </span>
              </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Título del popup</label>
                <input
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '7px 12px', borderRadius: 6, fontSize: 13, width: 200 }}
                  value={homePopup.title || ''}
                  onChange={e => update('promos.homePopup.title', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Subtítulo</label>
                <input
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '7px 12px', borderRadius: 6, fontSize: 13, width: 200 }}
                  value={homePopup.subtitle || ''}
                  onChange={e => update('promos.homePopup.subtitle', e.target.value)} />
              </div>
            </div>
          </div>

          {/* CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>
                Cards del Anuncio
                <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, marginLeft: 8 }}>
                  ({(homePopup.cards || []).filter(c => c.active).length} de {(homePopup.cards || []).length} activas)
                </span>
              </h3>
            </div>

            {(homePopup.cards || []).map((card, i) => (
              <motion.div key={card.id} layout
                style={{
                  border: `2px solid ${expandedCard === i ? '#bf953f' : card.active ? '#e8d9b5' : '#e0e0e0'}`,
                  borderRadius: 10, overflow: 'hidden',
                  opacity: card.active ? 1 : 0.6,
                  transition: 'border-color 0.2s',
                }}>

                {/* Header de la card — siempre visible */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    background: expandedCard === i ? '#fef9ee' : '#fff',
                    cursor: 'pointer',
                    borderBottom: expandedCard === i ? '1px solid #e8d9b5' : 'none',
                  }}
                  onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                >
                  {/* Número grande */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: expandedCard === i ? '#bf953f' : '#f0e8d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: expandedCard === i ? '#fff' : '#bf953f' }}>{i + 1}</span>
                  </div>

                  {/* Thumbnail si tiene imagen */}
                  {card.image && (
                    <div style={{ width: 48, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Info rápida */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#bf953f' }}>
                        {categoryIcons[card.category] || 'photo_camera'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{card.title}</span>
                      <span style={{ fontSize: 11, color: '#888', background: '#f0f0f0', padding: '2px 8px', borderRadius: 10 }}>{card.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#bf953f' }}>{card.price}</span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{(card.features || []).length} características</span>
                    </div>
                  </div>

                  {/* Toggle activa */}
                  <button
                    onClick={e => { e.stopPropagation(); updateCard(i, 'active', !card.active); }}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: card.active ? '#bf953f' : '#ddd',
                      border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                    }}>
                    <motion.div animate={{ x: card.active ? 22 : 2 }} transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%' }} />
                  </button>

                  {/* Expandir/colapsar */}
                  <motion.span className="material-symbols-outlined"
                    animate={{ rotate: expandedCard === i ? 180 : 0 }}
                    style={{ fontSize: 20, color: '#aaa', flexShrink: 0 }}>
                    expand_more
                  </motion.span>

                  {/* Eliminar */}
                  <button onClick={e => { e.stopPropagation(); removeCard(i); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffcdd2', display: 'flex', padding: 4, flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c62828' }}>delete</span>
                  </button>
                </div>

                {/* Contenido expandido */}
                <AnimatePresence initial={false}>
                  {expandedCard === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* SECCIÓN IMAGEN */}
                      <div style={{ padding: '20px 24px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#bf953f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>image</span>
                          Imagen del anuncio
                        </p>
                        <ImageUploadZone
                          currentUrl={card.image}
                          onUploaded={url => updateCard(i, 'image', url)}
                          folder="banners"
                          label="Subir imagen del anuncio (JPG/PNG/WebP, máx 2MB)"
                          aspectRatio="16/9"
                        />
                      </div>

                      {/* SECCIÓN INFO BÁSICA */}
                      <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#bf953f' }}>info</span>
                          Información básica
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {[
                            { label: 'Categoría', icon: 'folder', field: 'category', value: card.category },
                            { label: 'Título del paquete', icon: 'title', field: 'title', value: card.title },
                            { label: 'Precio (ej: S/500)', icon: 'payments', field: 'price', value: card.price },
                            { label: 'Link destino', icon: 'link', field: 'ctaLink', value: card.ctaLink },
                          ].map(field => (
                            <div key={field.field}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{field.icon}</span>
                                {field.label}
                              </label>
                              <input
                                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', transition: 'border 0.2s' }}
                                value={field.value || ''}
                                onChange={e => updateCard(i, field.field, e.target.value)}
                                onFocus={e => e.target.style.borderColor = '#bf953f'}
                                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                              />
                            </div>
                          ))}
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>description</span>
                              Descripción
                            </label>
                            <textarea
                              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                              rows={2}
                              value={card.description || ''}
                              onChange={e => updateCard(i, 'description', e.target.value)}
                              onFocus={e => e.target.style.borderColor = '#bf953f'}
                              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN CARACTERÍSTICAS */}
                      <div style={{ padding: '20px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#4caf50' }}>check_circle</span>
                          Lo que incluye
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(card.features || []).map((feat, j) => (
                            <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4caf50', flexShrink: 0 }}>check</span>
                              <input
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, background: '#fff' }}
                                value={feat}
                                onChange={e => updateCardFeature(i, j, e.target.value)}
                                onFocus={e => e.target.style.borderColor = '#bf953f'}
                                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                              />
                              <button onClick={() => updateCard(i, 'features', card.features.filter((_, fi) => fi !== j))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', display: 'flex', padding: 4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove_circle</span>
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateCard(i, 'features', [...(card.features || []), ''])}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px dashed #4caf50', borderRadius: 6, background: 'rgba(76,175,80,0.05)', cursor: 'pointer', color: '#4caf50', fontSize: 12, fontWeight: 600, width: 'fit-content' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
                            Agregar característica
                          </button>
                        </div>
                      </div>

                      {/* SECCIÓN WHATSAPP */}
                      <div style={{ padding: '20px 24px', background: '#f0fdf4' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#25d366' }}>chat_bubble</span>
                          Mensaje de WhatsApp
                        </p>
                        <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                          Este mensaje se pre-escribe cuando el visitante hace click en "Reservar ahora"
                        </p>
                        <textarea
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #c5e1a5', borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }}
                          rows={2}
                          value={card.whatsappText || ''}
                          onChange={e => updateCard(i, 'whatsappText', e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Botón agregar nueva card */}
            <motion.button
              onClick={addCard}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '18px 24px', border: '2px dashed #bf953f',
                borderRadius: 10, background: '#fef9ee',
                cursor: 'pointer', color: '#bf953f', fontSize: 14, fontWeight: 700,
                width: '100%', transition: 'background 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add_circle</span>
              Agregar nueva card de anuncio
            </motion.button>
          </div>
        </div>
      )}

      {/* ===== TAB PORTFOLIO ===== */}
      {activeTab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Estado del popup */}
          <div style={{ background: '#0a0a0a', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</span>
              <button
                onClick={() => update('promos.portfolioPopup.enabled', portfolioPopup.enabled === false ? true : false)}
                style={{ width: 64, height: 32, borderRadius: 16, background: portfolioPopup.enabled !== false ? '#bf953f' : '#333', border: 'none', cursor: 'pointer', position: 'relative' }}>
                <motion.div animate={{ x: portfolioPopup.enabled !== false ? 34 : 4 }} transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', top: 4, width: 24, height: 24, background: '#fff', borderRadius: '50%' }} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: portfolioPopup.enabled !== false ? '#bf953f' : '#555' }}>
                {portfolioPopup.enabled !== false ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>

            <div style={{ width: 1, height: 60, background: '#222' }} />

            <div>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                Tiempo antes de aparecer
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min={10} max={300} step={5}
                  value={portfolioPopup.delaySeconds || 60}
                  onChange={e => update('promos.portfolioPopup.delaySeconds', Number(e.target.value))}
                  style={{ width: 150, accentColor: '#bf953f' }} />
                <span style={{ fontSize: 22, fontWeight: 900, color: '#bf953f', minWidth: 60 }}>
                  {portfolioPopup.delaySeconds >= 60
                    ? `${Math.floor(portfolioPopup.delaySeconds / 60)}m ${portfolioPopup.delaySeconds % 60 > 0 ? portfolioPopup.delaySeconds % 60 + 's' : ''}`
                    : `${portfolioPopup.delaySeconds || 60}s`}
                </span>
              </div>
            </div>

            <div style={{ width: 1, height: 60, background: '#222' }} />

            <div>
              <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>notifications</span>
                Aviso previo
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min={0} max={30} step={1}
                  value={portfolioPopup.countdownSeconds || 10}
                  onChange={e => update('promos.portfolioPopup.countdownSeconds', Number(e.target.value))}
                  style={{ width: 100, accentColor: '#bf953f' }} />
                <span style={{ fontSize: 22, fontWeight: 900, color: '#bf953f', minWidth: 40 }}>
                  {portfolioPopup.countdownSeconds || 10}s
                </span>
              </div>
            </div>
          </div>

          {/* Textos */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: '#fef9ee', borderBottom: '1px solid #e8d9b5', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>text_fields</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Textos del popup</span>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Título', field: 'title', value: portfolioPopup.title },
                { label: 'Subtítulo', field: 'subtitle', value: portfolioPopup.subtitle },
                { label: 'Texto del botón principal', field: 'ctaText', value: portfolioPopup.ctaText },
              ].map(f => (
                <div key={f.field} style={f.field === 'ctaText' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                    value={f.value || ''}
                    onChange={e => update(`promos.portfolioPopup.${f.field}`, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Info sobre los precios */}
          <div style={{ display: 'flex', gap: 12, padding: '16px 20px', background: '#f0f8ff', border: '1px solid #b3d9ff', borderRadius: 10, alignItems: 'flex-start' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1565c0', flexShrink: 0 }}>info</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>Los precios se sincronizan automáticamente</p>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                El popup del portafolio muestra los paquetes y precios de la categoría que está viendo el visitante.
                Para editar los precios ve a <strong>Servicios → selecciona la categoría → ajusta los paquetes</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
