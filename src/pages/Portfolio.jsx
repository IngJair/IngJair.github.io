import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { portfolioItems as staticEvents, CATEGORIES as staticCategories, YEARS as staticYears } from '../data/portfolioData';
import { useSiteContent } from '../context/SiteContentContext';
import { PortfolioPromoPopup } from '../components/PromoPopup';
import './Portfolio.css';

const applyStyle = (styleObj, baseStyle = {}) => ({
  ...baseStyle,
  fontSize: styleObj?.fontSize || baseStyle.fontSize,
  fontWeight: styleObj?.bold ? 900 : (baseStyle.fontWeight || 400),
  fontStyle: styleObj?.italic ? 'italic' : 'normal',
  textDecoration: styleObj?.underline ? 'underline' : (baseStyle.textDecoration || 'none'),
  color: styleObj?.color || baseStyle.color,
});

export default function Portfolio() {
  const { content } = useSiteContent();
  const portfolioContent = content.portfolio || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeYear, setActiveYear] = useState('Todos');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const tipo = searchParams.get('tipo');
    if (categoria) setActiveCategory(categoria);
    if (tipo) setActiveCategory(tipo);
  }, [searchParams]);

  // Fusionar eventos estáticos con los del contexto
  const allEvents = useMemo(() => {
    const dynamicEvents = portfolioContent.events || [];
    // Los eventos dinámicos tienen prioridad o se agregan al principio
    return [...dynamicEvents, ...staticEvents];
  }, [portfolioContent.events]);

  const categories = portfolioContent.categories || staticCategories;
  const years = portfolioContent.years || staticYears;

  const filteredItems = useMemo(() => {
    return allEvents.filter(item => {
      // 1. Limpieza automática de renderizado: No renderizar ninguna card si no cumple requisitos mínimos
      if (!item?.title?.trim() || !(item?.coverImage || item?.image)?.trim() || !item?.category?.trim()) {
        return false;
      }

      // Filtro categoría
      const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
      
      // Filtro año
      const matchesYear = activeYear === 'Todos' || item.year === activeYear;
      
      // Filtro búsqueda
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' || 
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.year.includes(q) ||
        (item.keywords || []).some(k => k.toLowerCase().includes(q));
      
      return matchesCategory && matchesYear && matchesSearch;
    });
  }, [searchQuery, activeCategory, activeYear, allEvents]);

  return (
    <PageTransition>
      {/* HERO */}
      <section className="port-hero">
        <ScrollReveal>
          <h1 className="text-display-lg" style={applyStyle(portfolioContent.hero?.titleStyle)}>
            {portfolioContent.hero?.title || 'Nuestro Portafolio'}
          </h1>
          <p className="text-body-lg port-hero__sub" style={applyStyle(portfolioContent.hero?.subtitleStyle)}>
            {portfolioContent.hero?.subtitle || 'Momentos capturados con maestría técnica y sensibilidad artística.'}
          </p>
        </ScrollReveal>
      </section>

      {/* BUSCADOR + FILTROS */}
      <section className="port-search-section">
        <div className="container">
          
          {/* Search bar */}
          <motion.div
            className={`port-search-bar ${searchFocused ? 'port-search-bar--focused' : ''}`}
            animate={{ scale: searchFocused ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="material-symbols-outlined port-search-bar__icon">search</span>
            <input
              type="text"
              className="port-search-bar__input"
              placeholder="Busca por nombre, tipo de evento, año, ubicación..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <motion.button
                className="port-search-bar__clear"
                onClick={() => setSearchQuery('')}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined">close</span>
              </motion.button>
            )}
          </motion.div>

          {/* Filtros */}
          <div className="port-filters">
            <div className="port-filter-group">
              <span className="text-label-sm port-filter-group__label">Categoría</span>
              <div className="port-filter-chips">
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    className={`port-chip ${activeCategory === cat ? 'port-chip--active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="port-filter-group">
              <span className="text-label-sm port-filter-group__label">Año</span>
              <div className="port-filter-chips">
                {years.map(year => (
                  <motion.button
                    key={year}
                    className={`port-chip ${activeYear === year ? 'port-chip--active' : ''}`}
                    onClick={() => setActiveYear(year)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {year}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.p
            className="text-label-sm port-results-count"
            key={filteredItems.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredItems.length === 0
              ? 'No se encontraron resultados'
              : `${filteredItems.length} ${filteredItems.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
          </motion.p>
        </div>
      </section>

      {/* GRID DE EVENTOS */}
      <section className="port-gallery section-padding">
        <div className="container">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                className="port-empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="material-symbols-outlined port-empty__icon">search_off</span>
                <h3 className="text-headline-md">Sin resultados</h3>
                <p className="text-body-md">Intenta con otras palabras o limpia los filtros.</p>
                <button
                  className="btn-outline"
                  onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); setActiveYear('Todos'); }}
                >
                  Limpiar filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="port-grid"
                layout
              >
                {filteredItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
                    className={`port-card ${i === 0 ? 'port-card--featured' : ''}`}
                  >
                    <Link to={`/portfolio/${item.slug}`} className="port-card__link">
                      <div className="port-card__img-wrap">
                        <motion.img
                          src={item.coverImage}
                          alt={item.title}
                          className="port-card__img"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                          loading="lazy"
                        />
                        {item.hasVideo && (
                          <div className="port-card__video-badge">
                            <span className="material-symbols-outlined">play_circle</span>
                            <span className="text-label-sm">Incluye video</span>
                          </div>
                        )}
                        <div className="port-card__overlay">
                          <span className="port-card__overlay-text text-label-sm">
                            <span className="material-symbols-outlined">photo_library</span>
                            Ver galería
                          </span>
                        </div>
                      </div>
                      <div className="port-card__info">
                        <span className="text-label-sm port-card__category">{item.category}</span>
                        <h3 className="text-headline-md port-card__title">{item.title}</h3>
                        <div className="port-card__meta">
                          <span className="text-body-sm port-card__location">
                            <span className="material-symbols-outlined">location_on</span>
                            {item.location}
                          </span>
                          <span className="text-body-sm port-card__year">{item.year}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="port-cta section-padding" style={{ background: '#0a0a0a', color: '#fff' }}>
        <ScrollReveal>
          <h2 className="text-headline-xl" style={{ color: '#ffffff' }}>
            {portfolioContent.cta?.title || '¿Listo para contar tu historia?'}
          </h2>
          <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {portfolioContent.cta?.subtitle || 'Permítenos capturar la esencia de tus momentos más valiosos con el arte y la dedicación que mereces.'}
          </p>
          <div className="port-cta__btns">
            <Link to="/contact" className="btn-primary" style={{ background: '#ffffff', color: '#0a0a0a' }}>
              {portfolioContent.cta?.btnPrimary || 'Escríbenos Hoy'}
            </Link>
            <Link to="/services" className="btn-outline" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
              {portfolioContent.cta?.btnSecondary || 'Ver Servicios'}
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <PortfolioPromoPopup activeCategory={activeCategory} />
    </PageTransition>
  );
}
