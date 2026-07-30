import { NavLink, Link } from 'react-router';
import { useSiteContent } from '../context/useSiteContent';
import './Footer.css';

export default function Footer() {
  const { content } = useSiteContent();
  const contactInfo = content.contact || {};
  const brandInfo = content.brand || {};

  const SOCIAL_NETWORK_ICONS = [
    { key: 'whatsappLink', label: 'WhatsApp', icon: 'forum' },
    { key: 'instagramLink', label: 'Instagram', icon: 'camera' },
    { key: 'facebookLink', label: 'Facebook', icon: 'groups' },
    { key: 'tiktokLink', label: 'TikTok', icon: 'play_circle' },
    { key: 'youtubeLink', label: 'YouTube', icon: 'smart_display' },
    { key: 'pinterestLink', label: 'Pinterest', icon: 'push_pin' },
  ];
  const activeSocials = SOCIAL_NETWORK_ICONS.filter(s => contactInfo[s.key]);

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-wrapper">
            <img src="/logo-marca.png" alt={brandInfo.name || "Elky Studio"} className="footer__logo-img" />
          </Link>
          <p className="text-body-md footer__desc">
            {brandInfo.description || "Elevando la narrativa visual a través del arte de la fotografía y el video."}
          </p>
          <div className="footer__social">
            {activeSocials.map((social) => (
              <a 
                key={social.label} 
                href={contactInfo[social.key]} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={social.label}
              >
                <span className="material-symbols-outlined">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="footer__col">
          <h4 className="text-label-sm footer__col-title">Navegación</h4>
          <NavLink to="/portfolio" className="text-label-sm footer__link">Portafolio</NavLink>
          <NavLink to="/services" className="text-label-sm footer__link">Servicios</NavLink>
          <NavLink to="/contact" className="text-label-sm footer__link">Contacto</NavLink>
        </div>

        <div className="footer__col">
          <h4 className="text-label-sm footer__col-title">Soporte</h4>
          <Link to="/faq" className="text-label-sm footer__link">Preguntas Frecuentes</Link>
          <Link to="/privacy" className="text-label-sm footer__link">Privacidad</Link>
          <Link to="/admin" className="text-label-sm footer__link" style={{ opacity: 0.5 }}>Administración</Link>
        </div>

        <div className="footer__col">
          <h4 className="text-label-sm footer__col-title">Contacto</h4>
          <p className="text-body-sm footer__link" style={{ cursor: 'default' }}>
            Zona de cobertura disponible
          </p>
          <a href={`mailto:${contactInfo.email}`} className="text-body-sm footer__link">{contactInfo.email}</a>
          <a href={contactInfo.whatsappLink} className="text-body-sm footer__link">{contactInfo.whatsapp}</a>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="text-label-sm" style={{ color: 'var(--on-surface)', opacity: 0.8, letterSpacing: '0.15em' }}>
          © {new Date().getFullYear()} <span style={{ color: '#C8A96A' }}>ELKY STUDIOS</span>. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
}
