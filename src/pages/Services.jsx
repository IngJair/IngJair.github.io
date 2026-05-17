import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { FAQ_ITEMS, TESTIMONIALS } from '../data/servicesData';
import ReviewForm from '../components/ReviewForm';
import { buildWhatsappLink } from '../utils/whatsappMessage';
import './Services.css';

const DEFAULT_IMAGES = {
  basic: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2t4xcwuTL3c_3Y5uxW-rEXOHEKtIN9eNpPBcfXFFanxrl4qzT1YQgHfzUT8eo-kJfljZ1SZkWxcksfucR4rbm-cG5J5mlHJ-2T4qMQViLE8ycFw03_s1vCNczHGUKhy0zomH1-G0cvm8ggRsvt6z3zwlLtWnv9u4d3yJ6tOsoLulZXOmrmVtFVYpJ2HkaUqdsLs_oCBN4MQVmSvMM4iF2rBD3zOwm7Vqn_hZUbgO-IidzWSLFNMxq1LFmSQNU-jUKpXs6_2s5YFhC',
  premium: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLy4aIV8Le0gSUxfC0s3Tr-oDs5lbEeqmrick6fMQB7B9P3ziuHic5uNFZxMTtQwPMc2HFNDsZSBEv_U54s4mSsoDecOpduNKBKwpGWqd1RGxI8Mq_axaZv_r2FnEgmItqZhHxWs-y0TSp7xI6u0CeQVGO_O5nTKA-lyEYHzoDZnTf-4TDlYL1BeGXbfFTFAZf97bXG9QP_j13DEJEpxOI-AdZuvdfKDmsnzVSnGVf68lhrqv4y0iQorGhy_K3g2ybNdq-k3iTbSQ1',
  full: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnbYLliOfIjwQ0MEQfNnFphC9LU8pT4EaqceP6h92xvpymYD1b5DD6beRH5zH2JFS2ancOPIc0VJ7E0cHuvl-MWxRb4Rp3ZFH244-ZvT6ULXfP4Ttghct6ihTJJFtWWJ0PUDqgNlpY3RKbAmTTqe5D5ZYEHAk1czYaxh_O5iBvgkCFX4C2VhRxMw-42aap4-EtjJTtFlggYBzXEkuGuZLJzdXUaBecDM6ULqNzsquzHvSy-UCbwHXGo',
};

export default function Services() {
  const { content } = useSiteContent();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const servicesContent = content.services || {};
  const basePackages = servicesContent.basePackages || [];
  const categoryOverrides = servicesContent.categoryOverrides || {};

  const template = content.contact?.whatsappMessageTemplate || '';
  const whatsappNumber = content.contact?.whatsapp || '';
  const negocioName = content.brand?.name || '';

  // Categorías sincronizadas con portafolio (excluye "Todos")
  const portfolioCategories = (content.portfolio?.categories || []).filter(c => c !== 'Todos');

  // Tabs de categorías: "Todos" + las del portafolio activas en servicios
  const serviceTabs = [
    { id: 'all', label: 'Todos los Eventos', icon: 'photo_camera', multiplier: 1 },
    ...portfolioCategories.map(cat => ({
      id: cat,
      label: cat,
      icon: getCategoryIcon(cat),
      multiplier: categoryOverrides[cat]?.multiplier || 1,
      note: categoryOverrides[cat]?.note || '',
      active: categoryOverrides[cat]?.active !== false,
    })).filter(t => t.active),
  ];

  // Leer query param
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo && serviceTabs.find(t => t.id === tipo)) setActiveCategory(tipo);
  }, [searchParams, serviceTabs]);

  const currentTab = serviceTabs.find(t => t.id === activeCategory) || serviceTabs[0];
  const override = activeCategory !== 'all' ? categoryOverrides[activeCategory] : null;

  // Calcular paquetes a mostrar
  const displayPackages = useMemo(() => {
    // ── MODO "TODOS" — compilación de todas las categorías ──
    if (activeCategory === 'all') {
      const allPkgs = []

      portfolioCategories.forEach(cat => {
        const catOverride = categoryOverrides[cat]
        // Saltar categorías desactivadas
        if (catOverride?.active === false) return

        const multiplier = catOverride?.multiplier || 1
        const pkgOvrs = catOverride?.packageOverrides || {}

        // Paquetes base personalizados para esta categoría
        const catBasePkgs = basePackages
          .map(pkg => {
            const pkgOvr = pkgOvrs[pkg.id] || {}
            if (pkgOvr.deleted === true || pkgOvr.hidden === true) return null

            const title = pkgOvr.customTitle || pkg.title
            const subtitle = pkgOvr.customSubtitle || pkg.subtitle
            const baseFeatures = pkgOvr.customFeatures != null
              ? pkgOvr.customFeatures
              : pkg.features
            const allFeatures = [...baseFeatures, ...(pkgOvr.extraFeatures || [])]
            const finalPrice = pkgOvr.customPrice || Math.round(pkg.basePrice * multiplier)
            const currency = pkgOvr.currency || pkg.currency || 'S/'
            const image = pkgOvr.image || pkg.image || DEFAULT_IMAGES[pkg.id] || ''

            return {
              ...pkg,
              id: `${cat}-${pkg.id}`,  // id único para evitar colisión de keys
              title, subtitle, features: allFeatures,
              finalPrice, currency, image,
              isExtra: false,
              categoryLabel: cat,  // para mostrar la etiqueta de categoría
            }
          })
          .filter(Boolean)

        // Paquetes exclusivos de esta categoría
        const catExtraPkgs = (catOverride?.extraPackages || []).map(pkg => ({
          ...pkg,
          id: `${cat}-extra-${pkg.id}`,
          finalPrice: pkg.basePrice,
          isExtra: true,
          categoryLabel: cat,
        }))

        allPkgs.push(...catBasePkgs, ...catExtraPkgs)
      })

      // Si no hay ninguna categoría configurada, mostrar basePackages como fallback
      if (allPkgs.length === 0) {
        return basePackages.map(pkg => ({
          ...pkg,
          finalPrice: pkg.basePrice,
          currency: pkg.currency || 'S/',
          image: pkg.image || DEFAULT_IMAGES[pkg.id] || '',
          features: pkg.features,
          isExtra: false,
          categoryLabel: '',
        }))
      }

      return allPkgs
    }

    // ── MODO CATEGORÍA ESPECÍFICA — comportamiento actual ──
    const pkgOverrides = override?.packageOverrides || {}

    const basePkgs = basePackages
      .map(pkg => {
        const pkgOvr = pkgOverrides[pkg.id] || {}
        if (pkgOvr.deleted === true || pkgOvr.hidden === true) return null

        const title = pkgOvr.customTitle || pkg.title
        const subtitle = pkgOvr.customSubtitle || pkg.subtitle
        const baseFeatures = pkgOvr.customFeatures != null
          ? pkgOvr.customFeatures
          : pkg.features
        const allFeatures = [...baseFeatures, ...(pkgOvr.extraFeatures || [])]
        const finalPrice = pkgOvr.customPrice
          || Math.round(pkg.basePrice * (currentTab.multiplier || 1))
        const currency = pkgOvr.currency || pkg.currency || 'S/'
        const image = pkgOvr.image || pkg.image || DEFAULT_IMAGES[pkg.id] || ''

        return { ...pkg, title, subtitle, features: allFeatures,
          finalPrice, currency, image, isExtra: false, categoryLabel: '' }
      })
      .filter(Boolean)

    const extraPkgs = (override?.extraPackages || []).map(pkg => ({
      ...pkg,
      finalPrice: pkg.basePrice,
      isExtra: true,
      categoryLabel: '',
    }))

    return [...basePkgs, ...extraPkgs]
  }, [activeCategory, basePackages, categoryOverrides, currentTab, portfolioCategories]);

  return (
    <PageTransition>
      {/* HERO */}
      <section className="svc-hero">
        <ScrollReveal>
          <h1 className="text-display-lg">{servicesContent.hero?.title || 'Servicios y Paquetes'}</h1>
          {servicesContent.hero?.subtitle && servicesContent.hero.subtitle.trim() !== '' && (
            <p className="text-body-lg svc-hero__sub">{servicesContent.hero.subtitle}</p>
          )}
        </ScrollReveal>
      </section>

      {/* BANNER */}
      {(() => {
        const bannerActive = servicesContent.banner?.active !== false;
        if (!bannerActive) return null;
        return (
          <section className="svc-banner">
            <div className="container svc-banner__inner">
              <div>
                {servicesContent.banner?.tag && servicesContent.banner.tag.trim() !== '' && (
                  <span className="text-label-sm svc-banner__tag">
                    {servicesContent.banner.tag}
                  </span>
                )}
                {servicesContent.banner?.title && servicesContent.banner.title.trim() !== '' && (
                  <h3 className="text-headline-lg">
                    {servicesContent.banner.title}
                  </h3>
                )}
                {servicesContent.banner?.description && servicesContent.banner.description.trim() !== '' && (
                  <p className="text-body-md svc-banner__desc">
                    {servicesContent.banner.description}
                  </p>
                )}
              </div>
              <Link to="/contact" className="btn-primary svc-banner__btn">
                Consultar Disponibilidad
              </Link>
            </div>
          </section>
        );
      })()}

      {/* SELECTOR DE CATEGORÍA */}
      <section className="svc-categories section-padding">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-headline-xl svc-categories__title">¿Qué tipo de evento es el tuyo?</h2>
            <p className="text-body-lg svc-categories__sub">
              Los precios varían según el tipo de evento. Selecciona el tuyo para ver tu presupuesto exacto.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="svc-cat-tabs">
              {serviceTabs.map(tab => (
                <motion.button
                  key={tab.id}
                  className={`svc-cat-tab ${activeCategory === tab.id ? 'svc-cat-tab--active' : ''}`}
                  onClick={() => setActiveCategory(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined svc-cat-tab__icon">{tab.icon}</span>
                  <span className="svc-cat-tab__label">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </ScrollReveal>

          {(currentTab.note?.trim() || (activeCategory !== 'all' && currentTab.multiplier && currentTab.multiplier !== 1)) && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="svc-cat-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentTab.note?.trim() && (
                  <span className="svc-cat-info__note">
                    <span className="material-symbols-outlined">info</span>
                    {currentTab.note}
                  </span>
                )}
                {activeCategory !== 'all' && currentTab.multiplier && currentTab.multiplier !== 1 && (
                  <span className="svc-cat-info__multiplier">
                    {currentTab.multiplier > 1
                      ? `+${Math.round((currentTab.multiplier - 1) * 100)}% sobre precio base`
                      : `-${Math.round((1 - currentTab.multiplier) * 100)}% sobre precio base`}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* GRID DE PAQUETES */}
      <section className="svc-packages-section">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="svc-packages-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {displayPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  className={`svc-pkg ${pkg.isPrimary ? 'svc-pkg--primary' : ''} ${pkg.isExtra ? 'svc-pkg--extra' : ''}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                >
                  {pkg.isPrimary && <div className="svc-pkg__badge">Más Popular</div>}
                  {pkg.isExtra && <div className="svc-pkg__badge svc-pkg__badge--extra">Exclusivo</div>}

                  <div className="svc-pkg__img-wrap">
                    <img src={pkg.image || DEFAULT_IMAGES[pkg.id] || DEFAULT_IMAGES.basic}
                      alt={pkg.title} className="svc-pkg__img" />
                  </div>

                  <div className="svc-pkg__body">
                    <div className="svc-pkg__header">
                      <div>
                        {pkg.categoryLabel && (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            background: '#fef9ee',
                            border: '1px solid #e8d9b5',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#bf953f',
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            {pkg.categoryLabel}
                          </span>
                        )}
                        <h3 className="text-headline-md svc-pkg__title">{pkg.title}</h3>
                        <p className="text-label-sm svc-pkg__subtitle">{pkg.subtitle}</p>
                      </div>
                      <div className="svc-pkg__price">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={pkg.finalPrice}
                            className="svc-pkg__price-amount"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.25 }}
                          >
                            {pkg.currency}{pkg.finalPrice?.toLocaleString()}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-label-sm svc-pkg__price-label">desde</span>
                      </div>
                    </div>

                    <ul className="svc-pkg__features">
                      {pkg.features.map((feat, j) => (
                        <li key={j} className="svc-pkg__feat">
                          <span className="material-symbols-outlined svc-pkg__feat-icon">check_circle</span>
                          <span className="text-body-md">{typeof feat === 'string' ? feat : feat.text}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={buildWhatsappLink({
                        template,
                        paquete: pkg.title || pkg.name || '',
                        seccion: pkg.categoryLabel || activeCategory,
                        descripcion: pkg.features || [],
                        precio: pkg.finalPrice ? `${pkg.currency || 'S/'}${pkg.finalPrice.toLocaleString()}` : '',
                        negocio: negocioName,
                        whatsappNumber,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={pkg.isPrimary ? 'btn-primary svc-pkg__btn' : 'btn-outline svc-pkg__btn'}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.057 23.009a.75.75 0 00.916.938l5.306-1.453A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.71 9.71 0 01-4.953-1.355l-.355-.213-3.679 1.006 1.034-3.572-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                      </svg>
                      Consultar este Paquete
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {content.reviews?.settings?.showOnServices !== false && (
        <section className="svc-testimonials section-padding" style={{ background: 'var(--surface-container-low)' }}>
          <div className="container">
            <ScrollReveal>
              <span className="text-label-sm svc-testimonials__tag">Experiencias</span>
              <h2 className="text-headline-xl">Palabras de Nuestros Clientes</h2>
            </ScrollReveal>
            
            <div className="svc-testimonials-grid">
              {(content.reviews?.published || [])
                .slice(0, content.reviews?.settings?.maxDisplayed || 8)
                .map((t, i) => (
                <ScrollReveal key={t.id} delay={i * 0.1}>
                  <div className={`svc-testimonial ${t.featured ? 'svc-testimonial--featured' : ''}`}>
                    <div className="svc-testimonial__stars">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <span key={s} className="material-symbols-outlined svc-testimonial__star">star</span>
                      ))}
                    </div>
                    <p className="text-body-md svc-testimonial__text">"{t.text}"</p>
                    <div className="svc-testimonial__footer">
                      <img src={t.photo || 'https://via.placeholder.com/150'} alt={t.name} className="svc-testimonial__avatar" />
                      <div>
                        <p className="text-label-sm svc-testimonial__name">{t.name}</p>
                        <p className="svc-testimonial__event">{t.event}</p>
                        <p className="svc-testimonial__package">{t.package || t.eventType}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* SECCIÓN DEJAR RESEÑA */}
            <ScrollReveal delay={0.4}>
              <div className="svc-review-cta">
                <div className="svc-review-cta__text">
                  <span className="material-symbols-outlined">rate_review</span>
                  <div>
                    <p className="text-headline-sm" style={{ margin: 0 }}>¿Fuiste nuestro cliente?</p>
                    <p className="text-body-md" style={{ margin: 0, opacity: 0.7 }}>Comparte tu experiencia y ayuda a otras familias</p>
                  </div>
                </div>
                <motion.button
                  className="svc-review-cta__btn"
                  onClick={() => setShowReviewModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="material-symbols-outlined">edit</span>
                  Dejar mi reseña
                </motion.button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* MODAL DE RESEÑA */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            className="review-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              className="review-modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              onClick={e => e.stopPropagation()}
            >
              <ReviewForm onClose={() => setShowReviewModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <section className="svc-faq section-padding">
        <div className="container svc-faq__inner">
          <ScrollReveal>
            <h2 className="text-headline-xl">Preguntas Frecuentes</h2>
          </ScrollReveal>
          <div className="svc-faq__list">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} className={`svc-faq__item ${openFaq === i ? 'svc-faq__item--open' : ''}`}>
                <button className="svc-faq__question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-headline-sm">{item.q}</span>
                  <motion.span className="material-symbols-outlined svc-faq__icon"
                    animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    expand_more
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div className="svc-faq__answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}>
                      <p className="text-body-md">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="svc-cta section-padding" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
        <div className="container">
          <ScrollReveal>
            <h2 className="text-headline-xl">¿Tienes alguna pregunta?</h2>
            <p className="text-body-lg">Agenda una consulta gratuita de 30 minutos.</p>
            <div className="svc-cta__btns">
              <Link to="/contact" className="btn-primary">Agendar Consulta Gratuita</Link>
              <Link to="/portfolio" className="btn-ghost-white" style={{ color: '#fff', borderColor: '#fff' }}>Ver Nuestro Trabajo</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}

// Helper para iconos de categorías
function getCategoryIcon(cat) {
  const icons = {
    'Bodas': 'favorite', 'Quinceañeros': 'auto_awesome',
    'Fiestas Infantiles': 'celebration', 'Compromisos': 'diamond',
    'Bautizos': 'church', 'Eventos Corporativos': 'business_center',
    'Sesiones Personales': 'portrait', 'Cumpleaños': 'cake',
    'Graduaciones': 'school',
  };
  return icons[cat] || 'photo_camera';
}
