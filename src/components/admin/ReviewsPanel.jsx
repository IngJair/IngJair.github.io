import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContentContext';

export default function ReviewsPanel() {
  const { content, update, publishReview, rejectReview, deletePublishedReview, toggleFeaturedReview, getPendingReviews } = useSiteContent();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setPendingReviews(getPendingReviews());
  }, []);

  const handlePublish = (review) => {
    const dataToPublish = editingReview?.id === review.id
      ? { ...review, text: editText }
      : review;
    publishReview(review.id, dataToPublish);
    setPendingReviews(getPendingReviews());
    setEditingReview(null);
  };

  const handleReject = (id) => {
    if (!confirm('¿Rechazar esta reseña?')) return;
    rejectReview(id);
    setPendingReviews(getPendingReviews());
  };

  const published = content.reviews?.published || [];
  const pendingCount = pendingReviews.length;

  const StarDisplay = ({ rating }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} className="material-symbols-outlined"
          style={{ fontSize: 16, color: s <= rating ? '#bf953f' : '#e0e0e0' }}>
          {s <= rating ? 'star' : 'star_border'}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      {/* TABS */}
      <div className="admin-inner-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
        <button
          className={`admin-inner-tab ${activeTab === 'pending' ? 'admin-inner-tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', background: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', color: activeTab === 'pending' ? '#bf953f' : '#888',
            borderBottom: activeTab === 'pending' ? '2px solid #bf953f' : '2px solid transparent'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>pending</span>
          Pendientes
          {pendingCount > 0 && (
            <span style={{
              background: '#c62828', color: '#fff',
              fontSize: 11, fontWeight: 700,
              borderRadius: 10, padding: '1px 7px',
              marginLeft: 4,
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          className={`admin-inner-tab ${activeTab === 'published' ? 'admin-inner-tab--active' : ''}`}
          onClick={() => setActiveTab('published')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', background: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', color: activeTab === 'published' ? '#bf953f' : '#888',
            borderBottom: activeTab === 'published' ? '2px solid #bf953f' : '2px solid transparent'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          Publicadas ({published.length})
        </button>
        <button
          className={`admin-inner-tab ${activeTab === 'settings' ? 'admin-inner-tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', background: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', color: activeTab === 'settings' ? '#bf953f' : '#888',
            borderBottom: activeTab === 'settings' ? '2px solid #bf953f' : '2px solid transparent'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
          Configuración
        </button>
      </div>

      {/* TAB PENDIENTES */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>inbox</span>
              <p style={{ fontSize: 14 }}>No hay reseñas pendientes de revisión</p>
            </div>
          ) : (
            pendingReviews.map(review => (
              <motion.div
                key={review.id}
                className="admin-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ border: '2px solid #f0e8d0', borderRadius: 8, padding: 20, background: '#fff' }}
              >
                <div className="admin-section__body">
                  {/* Header de la reseña */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                      {review.photo
                        ? <img src={review.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: '#bbb', fontSize: 24 }}>person</span>
                          </div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{review.name}</p>
                      <p style={{ fontSize: 12, color: '#888', margin: '2px 0' }}>{review.event} · {review.date}</p>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <span style={{ fontSize: 11, padding: '4px 10px', background: '#fff3e0', color: '#e65100', borderRadius: 10, fontWeight: 700 }}>
                      Pendiente
                    </span>
                  </div>

                  {/* Texto — editable */}
                  {editingReview?.id === review.id ? (
                    <textarea
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #bf953f', borderRadius: 6, fontSize: 14, lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
                      rows={4}
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                    />
                  ) : (
                    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12, padding: '12px 16px', background: '#fafafa', borderRadius: 4, margin: '0 0 12px 0' }}>
                      "{review.text}"
                    </p>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePublish(review)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                      Publicar
                    </button>

                    {editingReview?.id === review.id ? (
                      <button
                        onClick={() => { setEditingReview(null); setEditText(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                      >
                        Cancelar edición
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingReview(review); setEditText(review.text); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#fef9ee', color: '#bf953f', border: '1px solid #e8d9b5', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        Editar texto
                      </button>
                    )}

                    <button
                      onClick={() => handleReject(review.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 'auto' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span>
                      Rechazar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* TAB PUBLICADAS */}
      {activeTab === 'published' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {published.length === 0 && (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 14 }}>Sin reseñas publicadas todavía.</p>
          )}
          {published.map(review => (
            <motion.div key={review.id} layout
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fff', border: `1px solid ${review.featured ? '#bf953f' : '#e0e0e0'}`, borderRadius: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                {review.photo
                  ? <img src={review.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ color: '#bbb', fontSize: 18 }}>person</span>
                    </div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{review.name}</p>
                  <StarDisplay rating={review.rating} />
                  {review.featured && (
                    <span style={{ fontSize: 10, padding: '2px 8px', background: '#fef9ee', color: '#bf953f', borderRadius: 10, fontWeight: 700 }}>⭐ Destacada</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {review.event} · "{review.text.substring(0, 80)}..."
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggleFeaturedReview(review.id)}
                  title={review.featured ? 'Quitar destacado' : 'Destacar'}
                  style={{ width: 32, height: 32, border: '1px solid #e0e0e0', background: review.featured ? '#fef9ee' : '#fff', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: review.featured ? '#bf953f' : '#ccc' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar esta reseña publicada?')) deletePublishedReview(review.id); }}
                  style={{ width: 32, height: 32, border: '1px solid #ffcdd2', background: '#ffebee', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c62828' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* TAB CONFIGURACIÓN */}
      {activeTab === 'settings' && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #eee' }}>
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f5f5f5' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Configuración de Reseñas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Mostrar reseñas en la página de Servicios</p>
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0' }}>Si está desactivado, la sección de testimonios no aparece</p>
              </div>
              <input type="checkbox"
                checked={content.reviews?.settings?.showOnServices !== false}
                onChange={e => update('reviews.settings.showOnServices', e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Requerir aprobación antes de publicar</p>
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0' }}>Recomendado: siempre activado</p>
              </div>
              <input type="checkbox"
                checked={content.reviews?.settings?.requireApproval !== false}
                onChange={e => update('reviews.settings.requireApproval', e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </label>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Máximo de reseñas mostradas
              </label>
              <input type="number" min={1} max={20}
                style={{ width: 80, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 14 }}
                value={content.reviews?.settings?.maxDisplayed || 8}
                onChange={e => update('reviews.settings.maxDisplayed', Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
