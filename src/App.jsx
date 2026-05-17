import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useSiteContent } from './context/SiteContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import EventDetail from './pages/EventDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

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
      {!isAdmin && <Navbar />}
      <main style={{ height: isAdmin ? '100vh' : 'auto' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<EventDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
