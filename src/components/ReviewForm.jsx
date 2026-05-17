import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './ReviewForm.css';

const EVENT_TYPES = [
  'Bodas', 'Quinceañeros', 'Fiestas Infantiles', 'Compromisos',
  'Bautizos', 'Eventos Corporativos', 'Sesiones Personales', 'Otro'
];

export default function ReviewForm({ onClose, embedded = false }) {
  const { submitReview, content } = useSiteContent();
  const photoRef = useRef(null);
  
  const [form, setForm] = useState({
    name: '',
    eventType: 'Bodas',
    event: '',
    text: '',
    rating: 0,
    photo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);

  // Leer categorías del portafolio dinámicamente
  const eventTypes = (content.portfolio?.categories || [])
    .filter(c => c !== 'Todos')
    .concat(['Otro']);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'La foto no debe superar 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setForm(prev => ({ ...prev, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Nombre requerido (mínimo 2 caracteres)';
    if (!form.text.trim() || form.text.trim().length < 20) errs.text = 'La reseña debe tener al menos 20 caracteres';
    if (!form.rating || form.rating < 1) errs.rating = 'Selecciona una puntuación antes de enviar';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simula envío
    
    submitReview({
      name: form.name.trim(),
      eventType: form.eventType,
      event: form.event.trim() || form.eventType,
      text: form.text.trim(),
      rating: form.rating,
      photo: form.photo,
    });
    
    setLoading(false);
    setSubmitted(true);
  };

  // PANTALLA DE ÉXITO
  if (submitted) {
    return (
      <motion.div
        className="review-success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="review-success__icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <span className="material-symbols-outlined">check_circle</span>
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          ¡Reseña enviada con éxito!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          Gracias por compartir tu experiencia, <strong>{form.name}</strong>. Tu reseña será revisada y publicada pronto. 🌟
        </motion.p>
        {!embedded && (
          <motion.button
            className="review-success__btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
          >
            Cerrar
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="review-form-wrap">
      {!embedded && (
        <div className="review-form__header">
          <h2>Comparte tu experiencia</h2>
          <button className="review-form__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {embedded && (
        <div className="review-form__intro">
          <h3>¿Trabajaste con nosotros?</h3>
          <p>Nos encantaría conocer tu experiencia. Tu opinión ayuda a otras familias a tomar la mejor decisión.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        {/* CALIFICACIÓN CON ESTRELLAS */}
        <div className="review-form__field">
          <label className="review-form__label">Tu calificación *</label>
          <div className="review-form__stars">
            {[1, 2, 3, 4, 5].map(star => (
              <motion.button
                key={star}
                type="button"
                className={`review-form__star ${star <= (hoveredStar || form.rating) ? 'review-form__star--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="material-symbols-outlined">
                  {star <= (hoveredStar || form.rating) ? 'star' : 'star_border'}
                </span>
              </motion.button>
            ))}
            <span className="review-form__rating-label">
              {form.rating === 0 ? 'Sin calificar' : form.rating === 5 ? '¡Excelente!' : form.rating === 4 ? 'Muy bueno' : form.rating === 3 ? 'Bueno' : form.rating === 2 ? 'Regular' : 'Malo'}
            </span>
          </div>
          {errors.rating && <span className="review-form__error">{errors.rating}</span>}
        </div>

        {/* NOMBRE Y FOTO */}
        <div className="review-form__row">
          <div className="review-form__field">
            <label className="review-form__label">Tu nombre completo *</label>
            <input
              className={`review-form__input ${errors.name ? 'review-form__input--error' : ''}`}
              placeholder="Ej: María García"
              value={form.name}
              onChange={e => { setForm(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: '' })); }}
            />
            {errors.name && <span className="review-form__error">{errors.name}</span>}
          </div>

          {/* FOTO DE PERFIL OPCIONAL */}
          <div className="review-form__field">
            <label className="review-form__label">Foto de perfil (opcional)</label>
            <label htmlFor="review-photo" className="review-form__photo-upload">
              {form.photo ? (
                <img src={form.photo} alt="Tu foto" className="review-form__photo-preview" />
              ) : (
                <>
                  <span className="material-symbols-outlined">add_a_photo</span>
                  <span>Subir foto</span>
                </>
              )}
            </label>
            <input
              id="review-photo"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            {errors.photo && <span className="review-form__error">{errors.photo}</span>}
          </div>
        </div>

        {/* TIPO DE EVENTO Y DESCRIPCIÓN */}
        <div className="review-form__row">
          <div className="review-form__field">
            <label className="review-form__label">Tipo de evento</label>
            <select
              className="review-form__input"
              value={form.eventType}
              onChange={e => setForm(prev => ({ ...prev, eventType: e.target.value }))}
            >
              {eventTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="review-form__field">
            <label className="review-form__label">Descripción del evento (opcional)</label>
            <input
              className="review-form__input"
              placeholder="Ej: Boda de verano 2024"
              value={form.event}
              onChange={e => setForm(prev => ({ ...prev, event: e.target.value }))}
            />
          </div>
        </div>

        {/* TEXTO DE LA RESEÑA */}
        <div className="review-form__field">
          <label className="review-form__label">Tu experiencia *</label>
          <textarea
            className={`review-form__input review-form__textarea ${errors.text ? 'review-form__input--error' : ''}`}
            placeholder="Cuéntanos cómo fue trabajar con nosotros, qué te gustó más, cómo fue el resultado final..."
            rows={5}
            maxLength={500}
            value={form.text}
            onChange={e => { setForm(prev => ({ ...prev, text: e.target.value })); setErrors(prev => ({ ...prev, text: '' })); }}
          />
          <div className="review-form__char-count">
            <span className={form.text.length > 450 ? 'review-form__char-count--warning' : ''}>
              {form.text.length}
            </span>/500
          </div>
          {errors.text && <span className="review-form__error">{errors.text}</span>}
        </div>

        <p className="review-form__disclaimer">
          <span className="material-symbols-outlined">info</span>
          Tu reseña será revisada antes de publicarse. Normalmente se aprueba en 24-48 horas.
        </p>

        <button
          type="submit"
          className="review-form__submit"
          disabled={loading}
        >
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <span className="material-symbols-outlined">progress_activity</span>
            </motion.span>
          ) : (
            <>
              <span className="material-symbols-outlined">send</span>
              Enviar Reseña
            </>
          )}
        </button>
      </form>
    </div>
  );
}
