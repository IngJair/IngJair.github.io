import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useSiteContent } from '../context/SiteContentContext';
import { HomePromoPopup } from '../components/PromoPopup';
import './Home.css';

const applyStyle = (styleObj, baseStyle = {}) => ({
  ...baseStyle,
  fontSize: styleObj?.fontSize || baseStyle.fontSize,
  fontWeight: styleObj?.bold ? 900 : (baseStyle.fontWeight || 400),
  fontStyle: styleObj?.italic ? 'italic' : 'normal',
  textDecoration: styleObj?.underline ? 'underline' : (baseStyle.textDecoration || 'none'),
  color: styleObj?.color || baseStyle.color,
});

// Services are now fetched from context
const DEFAULT_SERVICE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl_4ke40ZEWnCEra0kZhvqiPk6buWaVvyO48BNtNz7B2597gJlDGOls8CRQg8fsRYAxSzIT9hWRzK1G41NOhBAQs2gIsyoZP4KRbpaSLzr_k97oWR6rDs0tXQcVF6URVkWtqNFaitBvuwvTbjZiLqg912FMqdmPC1TZTpmnWzg7Ikhzlr11ym-P8fXhldZUD2iRrXWxB4HJg3tOI88edcKcpcWZym_d9mKdTPeZif3OVvkytpE_SM6Rd3zZ3kpJ33P0uUCt9oB4XNo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfpHDiUGFox-xQ_atfdkRJnTRbaXSDCu2AMMv5itV6v3_ZPxDBsQLN7VtqC1-rb_qG27A3ivo2vFshbiaegK1xJPO1IzOZSXvkA14A8zWPDoh9Co--cbRZNc15neSSBkQ0RvCPGB0OByU4X9-DKBrVUDi7Worg8AVaq9NIIyFt8C5FMLL7OwOODUYlVYNj-RbRwCzNRlHixhEnGsKtWQJ3c9nHnFLEWZ2kl9niJlnG9-mV6wq42E3HIT9cKJl86ejwfZqD8PPoApHZ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4COf441WkoJ7I4evOBKE6l_p8fOX9YpAV6r74fvtlOMp5TGFJwlpxdfQrpg6Az_fnixTQUPdGBOxYyQwknM42jm_pH8HkHxSfk9TecC6Pyl8rY8-J2K0GCKIANhUfMRyg9nOppHpE4ROBmGAvSoHIWr3iApoSQWXMiOyubSOCtm4lt3vP07BRGyqK4qcD6lctRCBHYlFNCEggjXfaLF6GezpSQ_ioSen1KiXRoiiabhpid0tdYvayWZ4bV69ivemtD8i1sxtuEdb',
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer = (stagger = 0.1, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
});

const wordVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
};

const clipRevealVariants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }
};

const SplitWords = ({ text, className, variants }) => (
  <motion.span className={className} variants={staggerContainer(0.08)}>
    {text.split(' ').map((word, i) => (
      <motion.span
        key={i}
        variants={variants || wordVariants}
        style={{ display: 'inline-block', marginRight: '0.25em' }}
      >
        {word}
      </motion.span>
    ))}
  </motion.span>
);

const ShutterEffect = () => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
        {/* Panel superior */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: '#0a0a0a' }}
        />
        {/* Panel inferior */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: '100%' }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: '#0a0a0a' }}
        />
      </div>
    </AnimatePresence>
  );
};

export default function Home() {
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 500], [0, 150]);
  const introImageY = useTransform(scrollY, [200, 800], [0, -60]);
  const { content } = useSiteContent();

  return (
    <PageTransition>
      <ShutterEffect />
      
      {/* Hero */}
      <section 
        className="hero"
        style={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div className="hero__bg">
          <motion.img
            src={content.hero.backgroundImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe3pG-Sv4PNYhFAnOjHMHuoLJM2ficfHU6lZJJfaYVySmqq1K5kn8wQ66yVm7kVJMBW1QHFk5z6h73PMaYLW5wnXB9c5_W-jh8ue4g_fBIqG5JhQmGgTLqb43N3tCidq71fvG5g4g9o2lYRXzBhOvZAkTCKGV56S-1rW7jkZHxR40bgEU5B2ZgNlWt2l0DK8kuvPrOJWt0wR5QUSCnLdVtTKPHH_U9HO4o3oJx2_Cxlq0YuNH6gRVUMsVcBCnA4B4wBqm7fsBsZM'}
            alt="Cinematic Wedding Moment"
            className="hero__img"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            style={{ y: heroImageY }}
          />
        </div>
        <div 
          className="hero__content"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 clamp(20px, 6vw, 120px)',
            color: '#fff',
            maxWidth: '680px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <motion.h1
            className="text-display-lg hero__title"
            variants={staggerContainer(0.08, 1.0)}
            initial="hidden"
            animate="visible"
            style={applyStyle(content.hero.titleStyle)}
          >
            <SplitWords text={content.hero.title} />
          </motion.h1>
          <motion.p
            className="text-body-lg hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            style={applyStyle(content.hero.subtitleStyle)}
          >
            {content.hero.subtitle}
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <Link to={content.hero.ctaPrimaryDestination || '/portfolio'} className="btn-white" style={applyStyle(content.hero.ctaPrimaryStyle)}>{content.hero.ctaPrimary}</Link>
            <Link to={content.hero.ctaSecondaryDestination || '/contact'} className="btn-ghost-white" style={applyStyle(content.hero.ctaSecondaryStyle)}>{content.hero.ctaSecondary}</Link>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="intro section-padding" style={{ background: 'var(--surface)' }}>
        <div className="intro__grid container">
          <motion.div 
            className="intro__img-wrap"
            style={{ overflow: 'hidden' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.img
              src={content.intro.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVQ_1Kc8kXJhFSLMgXHAeXHFEI4dNBpW6mRe-2cFsTR6lDERH2a1kvJGGP2rF-b1k_AwJwbmLCkm7G7nNjFwx67_K1h7Z5V1jqFQZ_L_WE8VzWHqRBIqHrxbEQkVdVaIXLl3bNLhVzQ8EZZ9S1h2yiXzOaaxaXnw0w3xSrHnX0tlHVNnE5f5U2J-UvD7JWRuFpQBCG8uMRz5XbRv0J09ew8FqizfSLz9qhBr7jY1k0Dg0MR4dIZHNh9'}
              alt="Photographer Portrait"
              className="intro__img"
              variants={clipRevealVariants}
              style={{ y: introImageY }}
            />
            <div className="intro__accent"></div>
          </motion.div>

          <motion.div 
            className="intro__text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer(0.12)}
          >
            <motion.span variants={fadeUpVariants} className="text-label-sm intro__tag" style={applyStyle(content.intro.tagStyle)}>{content.intro.tag}</motion.span>
            <motion.h2 variants={fadeUpVariants} className="text-headline-xl intro__heading" style={applyStyle(content.intro.titleStyle)}>{content.intro.title}</motion.h2>
            <motion.p variants={fadeUpVariants} className="text-body-lg intro__body" style={applyStyle(content.intro.bodyStyle)}>
              {content.intro.body}
            </motion.p>
            <motion.div variants={fadeUpVariants}>
              <Link to="/contact" className="intro__more text-label-sm" style={applyStyle(content.intro.ctaTextStyle)}>
                {content.intro.ctaText}
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="home-services section-padding" style={{ background: 'var(--surface-container-low)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <div className="home-services__header">
              <h2 className="text-headline-xl" style={applyStyle(content.services.titleStyle)}>{content.services.title}</h2>
              <div className="home-services__divider"></div>
            </div>
          </motion.div>

          <motion.div 
            className="home-services__grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer(0.15)}
          >
            {content.services.items.map((s, i) => (
              <motion.div 
                key={i} 
                className={`home-services__card ${i % 2 !== 0 ? 'home-services__card--offset' : ''}`}
                variants={{
                  hidden: { opacity: 0, y: 60 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
                }}
                whileHover="hover"
              >
                <div className="home-services__img-wrap">
                  <motion.img 
                    src={s.image || DEFAULT_SERVICE_IMAGES[i]} 
                    alt={s.title} 
                    className="home-services__img" 
                    initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
                    whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
                    variants={{
                      hover: { scale: 1.04, transition: { duration: 0.5 } }
                    }}
                  />
                </div>
                <h3 className="text-headline-md home-services__title" style={applyStyle(s.titleStyle)}>{s.title}</h3>
                <p className="text-body-md home-services__desc" style={applyStyle(s.descStyle)}>{s.desc}</p>
                {s.linkDestination?.startsWith('http') ? (
                  <a href={s.linkDestination} target="_blank" rel="noopener noreferrer" className="text-label-sm home-services__link" style={applyStyle(s.linkStyle)}>
                    {s.linkText}
                  </a>
                ) : (
                  <Link to={s.linkDestination} className="text-label-sm home-services__link" style={applyStyle(s.linkStyle)}>
                    {s.linkText}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="home-cta section-padding">
        <div className="container home-cta__inner">
          <motion.h2 
            className="text-headline-xl home-cta__title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            style={applyStyle(content.cta.titleStyle)}
          >
              <SplitWords text={content.cta.title} variants={{
               hidden: { opacity: 0, y: 30 },
               visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
             }} className="home-cta__title-text" />
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer(0.1, 0.2)}
          >
            <motion.p variants={fadeUpVariants} className="text-body-lg home-cta__desc" style={applyStyle(content.cta.subtitleStyle)}>
              {content.cta.subtitle}
            </motion.p>
          </motion.div>
          <motion.div 
            className="home-cta__contacts"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer(0.1, 0.4)}
          >
            {(() => {
              const contactInfo = content.contact || {};
              const SOCIAL_ITEMS = [
                { key: 'whatsapp', label: 'WHATSAPP', linkKey: 'whatsappLink', icon: 'chat_bubble',
                  href: `https://wa.me/${(contactInfo.whatsapp || '').replace(/[^0-9]/g, '')}` },
                { key: 'instagram', label: 'INSTAGRAM', linkKey: 'instagramLink', icon: 'camera' },
                { key: 'facebook', label: 'FACEBOOK', linkKey: 'facebookLink', icon: 'groups' },
                { key: 'tiktok', label: 'TIKTOK', linkKey: 'tiktokLink', icon: 'play_circle' },
                { key: 'youtube', label: 'YOUTUBE', linkKey: 'youtubeLink', icon: 'smart_display' },
                { key: 'pinterest', label: 'PINTEREST', linkKey: 'pinterestLink', icon: 'push_pin' },
                { key: 'email', label: 'EMAIL', linkKey: null, icon: 'mail',
                  href: `mailto:${contactInfo.email || ''}` },
              ];

              const activeItems = SOCIAL_ITEMS.filter(item => {
                if (item.key === 'whatsapp') return !!contactInfo.whatsapp;
                if (item.key === 'email') return !!contactInfo.email;
                return !!contactInfo[item.linkKey];
              });

              return activeItems.map((item) => (
                <motion.a 
                  key={item.key}
                  href={item.href || contactInfo[item.linkKey]} 
                  target={item.key === 'email' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className="home-cta__contact"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ scale: 1.03 }}
                >
                  <span className="home-cta__icon"><span className="material-symbols-outlined">{item.icon}</span></span>
                  <div>
                    <p className="text-label-sm home-cta__contact-label">{item.label}</p>
                    <p className="text-body-md">
                      {item.key === 'whatsapp' && contactInfo.whatsapp}
                      {item.key === 'email' && contactInfo.email}
                      {item.key === 'instagram' && contactInfo.instagram}
                      {item.key === 'facebook' && contactInfo.facebook}
                      {item.key === 'tiktok' && contactInfo.tiktok}
                      {item.key === 'youtube' && contactInfo.youtube}
                      {item.key === 'pinterest' && contactInfo.pinterest}
                    </p>
                  </div>
                </motion.a>
              ));
            })()}
          </motion.div>
        </div>
      </section>

      <HomePromoPopup />
    </PageTransition>
  );
}
