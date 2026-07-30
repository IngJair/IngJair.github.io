import { NavLink, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../config';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>

      <nav className="navbar__inner">
        {/* LOGO COMPLETO */}
        <Link to="/" className="navbar__logo-wrapper">
          <img
            src="/logo-marca.png"
            alt="Elky Studio"
            className="navbar__logo-img"
          />
        </Link>

        {/* LINKS DE NAVEGACIÓN */}
        <div className="navbar__links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <NavLink to="/contact" className="btn-primary navbar__cta">
          Reservar
        </NavLink>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `navbar__mobile-link ${isActive ? 'navbar__link--active' : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/contact"
              className="btn-primary navbar__mobile-cta"
              style={{ marginTop: 16, width: '100%', textAlign: 'center', boxSizing: 'border-box' }}
              onClick={() => setMenuOpen(false)}
            >
              Reservar
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
