import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSiteContent } from '../context/useSiteContent';

const SITE_URL = 'https://ingjair.github.io';
const SOCIAL_IMAGE = `${SITE_URL}/elky-social-preview.png`;

const PAGE_META = {
  '/': {
    title: 'Elky Studios | Fotografía y filmación en Lima',
    description: 'Fotografía y filmación profesional para bodas, quinceañeros, bautizos, cumpleaños y eventos en Lima.',
  },
  '/portfolio': {
    title: 'Portafolio | Elky Studios',
    description: 'Conoce las historias, celebraciones y sesiones fotografiadas por Elky Studios.',
  },
  '/services': {
    title: 'Servicios de fotografía y video | Elky Studios',
    description: 'Paquetes de fotografía y filmación para bodas, quinceañeros, bautizos, cumpleaños y eventos corporativos.',
  },
  '/contact': {
    title: 'Contacto y reservas | Elky Studios',
    description: 'Consulta fechas disponibles y solicita una cotización para tu próximo evento con Elky Studios.',
  },
  '/faq': {
    title: 'Preguntas frecuentes | Elky Studios',
    description: 'Respuestas sobre reservas, cobertura, entregas, viajes y servicios de Elky Studios.',
  },
  '/privacy': {
    title: 'Privacidad | Elky Studios',
    description: 'Información sobre el tratamiento de datos enviados a través del sitio de Elky Studios.',
  },
  '/admin': {
    title: 'Administración | Elky Studios',
    description: 'Acceso privado al panel de administración de Elky Studios.',
    noindex: true,
  },
  '*': {
    title: 'Página no encontrada | Elky Studios',
    description: 'La página que buscas no está disponible.',
    noindex: true,
  },
};

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function isPublicContact(value = '') {
  const normalized = String(value).toLowerCase();
  const compact = normalized.replace(/[\s()+-]/g, '');
  return normalized
    && !normalized.includes('luxemedia')
    && !compact.includes('600000000')
    && !compact.includes('999000000');
}

export default function Seo() {
  const { pathname } = useLocation();
  const { content } = useSiteContent();

  useEffect(() => {
    const isPortfolioDetail = pathname.startsWith('/portfolio/');
    const routeKey = isPortfolioDetail
      ? '/portfolio'
      : (PAGE_META[pathname] ? pathname : '*');
    const meta = PAGE_META[routeKey];
    const canonicalPath = isPortfolioDetail
      ? pathname
      : (routeKey === '*' ? pathname : (routeKey === '/' ? '/' : routeKey));
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;

    document.title = meta.title;

    ensureMeta('meta[name="description"]', { name: 'description', content: meta.description });
    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: meta.noindex ? 'noindex, nofollow' : 'index, follow',
    });
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: SOCIAL_IMAGE });
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: SOCIAL_IMAGE });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const contact = content.contact || {};
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: content.brand?.name || 'Elky Studios',
      description: content.brand?.description || PAGE_META['/'].description,
      url: SITE_URL,
      image: SOCIAL_IMAGE,
      areaServed: 'Lima, Perú',
      ...(isPublicContact(contact.whatsapp) ? { telephone: contact.whatsapp } : {}),
      ...(isPublicContact(contact.email) ? { email: contact.email } : {}),
      sameAs: [
        contact.instagramLink,
        contact.facebookLink,
        contact.tiktokLink,
        contact.youtubeLink,
      ].filter(isPublicContact),
    };

    let structuredData = document.head.querySelector('script[data-elky-schema]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.dataset.elkySchema = 'true';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(schema);
  }, [content.brand, content.contact, pathname]);

  return null;
}
