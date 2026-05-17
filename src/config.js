// DEPRECATED - usar SiteContentContext en su lugar
// export const CONTACT_INFO = { ... };
// export const BRAND_INFO = { ... };
// export const SOCIAL_LINKS = [ ... ];

export const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/portfolio', label: 'Portafolio' },
  { to: '/services', label: 'Servicios' },
  { to: '/contact', label: 'Contactar' }
];

export const SERVICES_LIST = [
  {
    id: 'weddings',
    title: 'Bodas & Elopements',
    desc: 'Documentación íntima y elegante de su unión más sagrada.',
    link: '/portfolio',
    category: 'wedding',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl_4ke40ZEWnCEra0kZhvqiPk6buWaVvyO48BNtNz7B2597gJlDGOls8CRQg8fsRYAxSzIT9hWRzK1G41NOhBAQs2gIsyoZP4KRbpaSLzr_k97oWR6rDs0tXQcVF6URVkWtqNFaitBvuwvTbjZiLqg912FMqdmPC1TZTpmnWzg7Ikhzlr11ym-P8fXhldZUD2iRrXWxB4HJg3tOI88edcKcpcWZym_d9mKdTPeZif3OVvkytpE_SM6Rd3zZ3kpJ33P0uUCt9oB4XNo'
  },
  {
    id: 'corporate',
    title: 'Eventos Corporativos',
    desc: 'Capturando la sofisticación y el éxito de sus momentos empresariales.',
    link: '/services',
    category: 'corporate',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfpHDiUGFox-xQ_atfdkRJnTRbaXSDCu2AMMv5itV6v3_ZPxDBsQLN7VtqC1-rb_qG27A3ivo2vFshbiaegK1xJPO1IzOZSXvkA14A8zWPDoh9Co--cbRZNc15neSSBkQ0RvCPGB0OByU4X9-DKBrVUDi7Worg8AVaq9NIIyFt8C5FMLL7OwOODUYlVYNj-RbRwCzNRlHixhEnGsKtWQJ3c9nHnFLEWZ2kl9niJlnG9-mV6wq42E3HIT9cKJl86ejwfZqD8PPoApHZ'
  },
  {
    id: 'portraits',
    title: 'Sesiones Personales',
    desc: 'Retratos artísticos que revelan su verdadera personalidad.',
    link: '/portfolio',
    category: 'portrait',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4COf441WkoJ7I4evOBKE6l_p8fOX9YpAV6r74fvtlOMp5TGFJwlpxdfQrpg6Az_fnixTQUPdGBOxYyQwknM42jm_pH8HkHxSfk9TecC6Pyl8rY8-J2K0GCKIANhUfMRyg9nOppHpE4ROBmGAvSoHIWr3iApoSQWXMiOyubSOCtm4lt3vP07BRGyqK4qcD6lctRCBHYlFNCEggjXfaLF6GezpSQ_ioSen1KiXRoiiabhpid0tdYvayWZ4bV69ivemtD8i1sxtuEdb'
  }
];

// DEPRECATED - usar SiteContentContext en su lugar
// export const PACKAGES = [ ... ];
// export const TESTIMONIALS = [ ... ];

export const EVENT_TYPES = [
  'Boda Editorial',
  'Evento Corporativo',
  'Producción Cinematográfica',
  'Retrato Artístico',
  'Bautizo',
  'Quinceaño',
  'Fiesta Infantil',
  'Sesión Personal'
];

const config = {
  NAV_LINKS,
  SERVICES_LIST,
  EVENT_TYPES
};

export default config;
