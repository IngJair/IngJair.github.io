import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { useSiteContent } from './context/useSiteContent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Seo from './components/Seo';

const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const Faq = lazy(() => import('./pages/Faq'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return <div className="app-loading-screen" aria-label="Cargando página" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const { loadingContent } = useSiteContent();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    return () => window.removeEventListener('resize', setVh)
  }, [])

  if (loadingContent) {
    return (
      <div className="app-loading-screen">
        <motion.div 
          className="app-loading-screen__inner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="app-loading-screen__logo">
            <span className="brand-text-gold" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 700, letterSpacing: '0.05em' }}>Elky</span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 300, letterSpacing: '0.25em', color: '#fff', marginLeft: '12px', textTransform: 'uppercase' }}>Studios</span>
          </div>
          <div className="app-loading-screen__spinner"></div>
          <p className="app-loading-screen__text">Cargando experiencia...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Seo />
      {!isAdmin && <Navbar />}
      <main style={{ height: isAdmin ? '100vh' : 'auto' }}>
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<EventDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
