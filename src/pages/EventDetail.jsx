import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useSiteContent } from '../context/useSiteContent';
import { portfolioItems as staticEvents } from '../data/portfolioData';
import './EventDetail.css';

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content } = useSiteContent();

  const allEvents = useMemo(() => {
    const dynamicEvents = content.portfolio?.events || [];
    return [...dynamicEvents, ...staticEvents];
  }, [content.portfolio?.events]);

  const event = allEvents.find(i => i.slug === slug);

  // Estado del lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Si no existe el evento
  if (!event) {
    return (
      <div className="event-not-found">
        <h2>Evento no encontrado</h2>
        <Link to="/portfolio" className="btn-primary">Volver al Portfolio</Link>
      </div>
    );
  }

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevMedia = () => setLightboxIndex(i => (i === 0 ? event.media.length - 1 : i - 1));
  const nextMedia = () => setLightboxIndex(i => (i === event.media.length - 1 ? 0 : i + 1));

  return (
    <PageTransition>
      {/* BACK BUTTON */}
      <div className="event-back">
        <button className="event-back__btn" onClick={() => navigate('/portfolio')}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-label-sm">Volver al Portfolio</span>
        </button>
      </div>

      {/* HERO DEL EVENTO */}
      <section className="event-hero">
        <div className="event-hero__img-wrap">
          <motion.img
            src={event.coverImage}
            alt={event.title}
            className="event-hero__img"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          <div className="event-hero__overlay" />
        </div>
        <div className="event-hero__content">
          <motion.span
            className="text-label-sm event-hero__category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {event.category}
          </motion.span>
          <motion.h1
            className="text-display-lg event-hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {event.title}
          </motion.h1>
          <motion.div
            className="event-hero__meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>
              <span className="material-symbols-outlined">location_on</span>
              {event.location}
            </span>
            <span>
              <span className="material-symbols-outlined">calendar_today</span>
              {event.year}
            </span>
            {event.hasVideo && (
              <span>
                <span className="material-symbols-outlined">videocam</span>
                Incluye video
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* DESCRIPCIÓN */}
      <section className="event-desc container">
        <p className="text-body-lg">{event.description}</p>
        <div className="event-desc__stats">
          <div className="event-desc__stat">
            <span className="text-display-sm">{event.media.filter(m => m.type === 'image').length}</span>
            <span className="text-label-sm">Fotografías</span>
          </div>
          {event.hasVideo && (
            <div className="event-desc__stat">
              <span className="text-display-sm">{event.media.filter(m => m.type === 'video').length}</span>
              <span className="text-label-sm">Videos</span>
            </div>
          )}
        </div>
      </section>

      {/* GALERÍA DE MEDIOS */}
      <section className="event-gallery container">
        <motion.div
          className="event-gallery__grid"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {event.media.map((media, i) => (
            <motion.div
              key={i}
              className={`event-gallery__item ${media.type === 'video' ? 'event-gallery__item--video' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
              }}
              onClick={() => openLightbox(i)}
              style={{ cursor: 'pointer' }}
            >
              {media.type === 'image' ? (
                <div className="event-gallery__img-wrap">
                  <motion.img
                    src={media.src}
                    alt={media.alt}
                    className="event-gallery__img"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.5 }}
                    loading="lazy"
                  />
                  <div className="event-gallery__hover">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </div>
                </div>
              ) : (
                <div className="event-gallery__video-wrap">
                  <video
                    src={media.src}
                    poster={media.poster}
                    className="event-gallery__video"
                    muted
                    playsInline
                    onMouseEnter={e => e.target.play()}
                    onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                  />
                  <div className="event-gallery__video-overlay">
                    <span className="material-symbols-outlined event-gallery__play-icon">play_circle</span>
                    <span className="text-label-sm">Video Highlight</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="event-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="event-lightbox__close" onClick={closeLightbox}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <button className="event-lightbox__prev" onClick={e => { e.stopPropagation(); prevMedia(); }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="event-lightbox__next" onClick={e => { e.stopPropagation(); nextMedia(); }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <motion.div
              className="event-lightbox__content"
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              {event.media[lightboxIndex].type === 'image' ? (
                <img
                  src={event.media[lightboxIndex].src}
                  alt={event.media[lightboxIndex].alt}
                  className="event-lightbox__img"
                />
              ) : (
                <video
                  src={event.media[lightboxIndex].src}
                  poster={event.media[lightboxIndex].poster}
                  className="event-lightbox__video"
                  controls
                  autoPlay
                />
              )}
              <p className="text-label-sm event-lightbox__counter">
                {lightboxIndex + 1} / {event.media.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EVENTOS RELACIONADOS */}
      <section className="event-related section-padding">
        <div className="container">
          <h3 className="text-headline-lg event-related__title">Otros eventos</h3>
          <div className="event-related__grid">
            {allEvents
              .filter(i => i.slug !== slug)
              .slice(0, 3)
              .map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/portfolio/${related.slug}`} className="event-related__card">
                    <div className="event-related__img-wrap">
                      <motion.img
                        src={related.coverImage}
                        alt={related.title}
                        className="event-related__img"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-label-sm event-related__cat">{related.category}</span>
                    <h4 className="text-headline-sm event-related__name">{related.title}</h4>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
