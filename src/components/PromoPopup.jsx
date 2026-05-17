import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';
import { buildWhatsappLink } from '../utils/whatsappMessage';
import './PromoPopup.css';

// Helper para verificar si debe mostrarse según frecuencia
const shouldShowPopup = (popupKey, frequency) => {
  try {
    const stored = localStorage.getItem(`promo_${popupKey}`);
    if (!stored) return true;
    
    const { lastShown } = JSON.parse(stored);
    const now = Date.now();
    const lastDate = new Date(lastShown);
    const nowDate = new Date(now);
    
    if (frequency === 'daily') {
      // Mostrar si es un día diferente
      return lastDate.toDateString() !== nowDate.toDateString();
    } else if (frequency === 'session') {
      return false; // Ya se mostró esta sesión
    } else if (frequency === 'always') {
      return true;
    }
    return true;
  } catch { return true; }
};

const markPopupShown = (popupKey) => {
  localStorage.setItem(`promo_${popupKey}`, JSON.stringify({ lastShown: Date.now() }));
};

// ===== POPUP DE HOME — 4 cards de precios =====
export function HomePromoPopup() {
  const { content } = useSiteContent();
  const [visible, setVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const navigate = useNavigate();
  
  const promos = content.promos?.homePopup;
  if (!promos) return null;
  
  const activeCards = (promos.cards || []).filter(c => c.active && c.showOnHomePopup !== false);

  useEffect(() => {
    if (!promos?.enabled || activeCards.length === 0) {
      return;
    }
    
    const show = shouldShowPopup('home', promos.frequency || 'daily');
    if (!show) {
      return;
    }
    
    const delay = (promos.delaySeconds || 2) * 1000;
    
    const timer = setTimeout(() => {
      setVisible(true);
      markPopupShown('home');
    }, delay);
    
    return () => clearTimeout(timer);
  }, [promos?.enabled, promos?.delaySeconds, promos?.frequency]);

  // Mezclar cards aleatoriamente al montar y limitar a maxDisplayed
  const [shuffledCards] = useState(() => {
    const cards = [...activeCards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    const max = promos.maxDisplayed || 4;
    return cards.slice(0, max);
  });

  const handleClose = () => setVisible(false);

  const handleCta = (card) => {
    setVisible(false);
    navigate(card.ctaLink || '/services');
  };

  const handleWhatsApp = (card) => {
    const whatsappNumber = (content.contact?.whatsapp || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(card.whatsappText || 'Hola, me interesa un paquete');
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="promo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleClose}
        >
          <motion.div
            className="promo-modal"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="promo-modal__header">
              <div>
                <span className="promo-modal__tag">✨ {promos.title || 'Ofertas Especiales'}</span>
                <h2 className="promo-modal__title">{promos.subtitle || 'Captura tus momentos'}</h2>
              </div>
              <button className="promo-modal__close" onClick={handleClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Grid de cards dinámico */}
            <div 
              className="promo-cards-grid"
              style={{
                '--card-count': shuffledCards.length,
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100% / ${Math.max(1, shuffledCards.length)}, 240px), 1fr))`
              }}
            >
              {shuffledCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  className={`promo-card ${activeCard === i ? 'promo-card--active' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => setActiveCard(i)}
                >
                  {/* Imagen */}
                  <div className="promo-card__img-wrap">
                    {card.image ? (
                      <img src={card.image} alt={card.title} className="promo-card__img" />
                    ) : (
                      <div className="promo-card__img-placeholder">
                        <span className="material-symbols-outlined">photo_camera</span>
                        <span>{card.category}</span>
                      </div>
                    )}
                    {/* Badge de categoría */}
                    <span className="promo-card__category-badge">{card.category}</span>
                  </div>

                  {/* Contenido */}
                  <div className="promo-card__body">
                    <div className="promo-card__header-row">
                      <h3 className="promo-card__title">{card.title}</h3>
                      <div className="promo-card__price">
                        <span className="promo-card__price-amount">{card.price}</span>
                        <span className="promo-card__price-label">desde</span>
                      </div>
                    </div>

                    <p className="promo-card__description">{card.description}</p>

                    {/* Features */}
                    <ul className="promo-card__features">
                      {(card.features || []).map((feat, j) => (
                        <li key={j} className="promo-card__feat">
                          <span className="material-symbols-outlined">check_circle</span>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* Botones */}
                    <div className="promo-card__btns">
                      <button
                        className="promo-card__btn-primary"
                        onClick={() => handleCta(card)}
                      >
                        <span className="material-symbols-outlined">arrow_forward</span>
                        {card.ctaText || 'Conocer más'}
                      </button>
                      <button
                        className="promo-card__btn-whatsapp"
                        onClick={() => handleWhatsApp(card)}
                      >
                        <span className="material-symbols-outlined">chat_bubble</span>
                        Reservar ahora
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="promo-modal__footer">
              <button className="promo-modal__skip" onClick={handleClose}>
                Cerrar y seguir explorando
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== POPUP DE PORTFOLIO — contextual por categoría =====
export function PortfolioPromoPopup({ activeCategory }) {
  const { content } = useSiteContent();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const navigate = useNavigate();

  const promos = content.promos?.portfolioPopup;
  const homePromos = content.promos?.homePopup;

  // Obtener la card de promo para la categoría activa
  const getCategoryPromo = () => {
    if (!homePromos?.cards) return null;
    return homePromos.cards.find(c => c.active && c.category === activeCategory);
  };

  const getCategoryPackages = () => {
    const basePackages = content.services?.basePackages || []
    const override = content.services?.categoryOverrides?.[activeCategory]
    const multiplier = override?.multiplier || 1
    const pkgOverrides = override?.packageOverrides || {}

    return basePackages
      .map(pkg => {
        const pkgOvr = pkgOverrides[pkg.id] || {}

        // Ocultar si está deleted u hidden para esta categoría
        if (pkgOvr.deleted === true || pkgOvr.hidden === true) return null

        // Título y subtítulo personalizados
        const title = pkgOvr.customTitle || pkg.title
        const subtitle = pkgOvr.customSubtitle || pkg.subtitle

        // Features: customFeatures reemplaza, extraFeatures se suma
        const baseFeatures = pkgOvr.customFeatures != null
          ? pkgOvr.customFeatures
          : pkg.features
        const allFeatures = [...baseFeatures, ...(pkgOvr.extraFeatures || [])]

        // Precio y moneda
        const finalPrice = pkgOvr.customPrice
          || Math.round(pkg.basePrice * multiplier)
        const currency = pkgOvr.currency || pkg.currency || 'S/'

        // Imagen
        const image = pkgOvr.image || pkg.image

        return { ...pkg, title, subtitle, features: allFeatures,
          finalPrice, currency, image }
      })
      .filter(Boolean)
      .slice(0, 3)
  }

  const handlePackageWhatsApp = (pkg) => {
    const template = content.contact?.whatsappMessageTemplate ||
      `Hola! Me interesa el siguiente paquete:

Paquete: {{paquete}}
Seccion: {{seccion}}
Incluye:
{{descripcion}}
Precio: {{precio}}

Podrias darme mas informacion?`

    const link = buildWhatsappLink({
      template,
      paquete: pkg.title,
      seccion: activeCategory,
      descripcion: pkg.features || [],
      precio: `${pkg.currency || 'S/'}${(pkg.finalPrice || pkg.basePrice)?.toLocaleString()}`,
      negocio: content.brand?.name || '',
      whatsappNumber: content.contact?.whatsapp || ''
    })
    window.open(link, '_blank')
  }

  useEffect(() => {
    if (!promos?.enabled || !activeCategory || activeCategory === 'Todos') {
      return;
    }
    
    const popupKey = `portfolio_${activeCategory}`;
    if (!shouldShowPopup(popupKey, 'daily')) {
      return;
    }

    // Limpiar timers anteriores
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
    setVisible(false);
    setCountdown(null);

    const totalDelay = (promos.delaySeconds || 60) * 1000;
    const countdownStart = promos.countdownSeconds || 10;

    // Iniciar countdown antes de mostrar
    const countdownDelay = totalDelay - (countdownStart * 1000);

    timerRef.current = setTimeout(() => {
      // Iniciar countdown
      setCountdown(countdownStart);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setVisible(true);
            markPopupShown(popupKey);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }, Math.max(0, countdownDelay));

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [activeCategory, promos?.enabled, promos?.delaySeconds, promos?.countdownSeconds]);

  const handleClose = () => {
    setVisible(false);
    setCountdown(null);
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
  };

  const packages = getCategoryPackages();
  const promoCard = getCategoryPromo();

  return (
    <>
      {/* Countdown indicator — aparece antes del popup */}
      <AnimatePresence>
        {countdown !== null && !visible && (
          <motion.div
            className="promo-countdown-badge"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
          >
            <span className="material-symbols-outlined">local_offer</span>
            <span>Oferta especial en {countdown}s</span>
            <button onClick={handleClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="promo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="promo-modal promo-modal--portfolio"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="promo-modal__header">
                <div>
                  <span className="promo-modal__tag">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {activeCategory === 'Bodas' ? 'favorite' :
                       activeCategory === 'Quinceañeros' ? 'auto_awesome' :
                       activeCategory === 'Bautizos' ? 'church' :
                       activeCategory === 'Fiestas Infantiles' ? 'celebration' :
                       'photo_camera'}
                    </span>
                    Paquetes para {activeCategory}
                  </span>
                  <h2 className="promo-modal__title">{promos?.title || '¿Te gusta lo que ves?'}</h2>
                  <p className="promo-modal__subtitle">{promos?.subtitle || 'Tenemos el paquete perfecto para ti'}</p>
                </div>
                <button className="promo-modal__close" onClick={handleClose}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Imagen destacada de la categoría */}
              {promoCard?.image && (
                <div className="promo-portfolio__hero">
                  <img src={promoCard.image} alt={activeCategory} className="promo-portfolio__hero-img" />
                  <div className="promo-portfolio__hero-overlay">
                    <p className="promo-portfolio__hero-text">{promoCard.description}</p>
                  </div>
                </div>
              )}

              {/* Paquetes en lista compacta */}
              <div className="promo-portfolio__packages">
                {packages.map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    className={`promo-pkg-row ${pkg.isPrimary ? 'promo-pkg-row--primary' : ''}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    {pkg.image && (
                      <div className="promo-pkg-row__thumb">
                        <img src={pkg.image} alt={pkg.title} />
                      </div>
                    )}
                    <div className="promo-pkg-row__info">
                      <h4 className="promo-pkg-row__title">{pkg.title}</h4>
                      <p className="promo-pkg-row__subtitle">{pkg.subtitle}</p>
                      <div className="promo-pkg-row__features">
                        {(pkg.features || []).slice(0, 2).map((f, j) => (
                          <span key={j} className="promo-pkg-row__feat">
                            <span className="material-symbols-outlined">check</span>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="promo-pkg-row__price">
                      <span className="promo-pkg-row__price-amount">
                        {pkg.currency || 'S/'}{(pkg.finalPrice || pkg.basePrice)?.toLocaleString()}
                      </span>
                      <span className="promo-pkg-row__price-label">desde</span>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); handlePackageWhatsApp(pkg) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 12px',
                        background: '#25D366', color: '#fff',
                        border: 'none', borderRadius: 8,
                        cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        whiteSpace: 'nowrap', flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(37,211,102,0.3)'
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.057 23.009a.75.75 0 00.916.938l5.306-1.453A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.953-1.355l-.355-.213-3.679 1.006 1.034-3.572-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                      </svg>
                      Consultar
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="promo-modal__ctas">
                <button
                  className="promo-cta-primary"
                  onClick={() => {
                    handleClose();
                    navigate(`/services?tipo=${encodeURIComponent(activeCategory)}`);
                  }}
                >
                  <span className="material-symbols-outlined">work</span>
                  {promos?.ctaText || 'Ver todos los paquetes'}
                </button>
                <button
                  className="promo-cta-whatsapp"
                  onClick={() => {
                    const template = content.contact?.whatsappMessageTemplate ||
                      `Hola! Me interesa conocer los paquetes de {{seccion}}.
Podrias darme mas informacion?`

                    const link = buildWhatsappLink({
                      template,
                      paquete: '',
                      seccion: activeCategory,
                      descripcion: [],
                      precio: '',
                      negocio: content.brand?.name || '',
                      whatsappNumber: content.contact?.whatsapp || ''
                    })
                    window.open(link, '_blank')
                  }}
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  Consultar por WhatsApp
                </button>
              </div>

              <button className="promo-modal__skip" onClick={handleClose}>
                Seguir explorando el portafolio
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
