import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SiteContentContext = createContext(null);

export const ADMIN_PASSWORD = btoa("admin123");

const defaultContent = {
  brand: {
    name: "Elky Studios",
    tagline: "Inmortalizando tus momentos más preciosos",
    description: "Elevando la narrativa visual a través de la excelencia cinematográfica y fotográfica para eventos exclusivos.",
    logo: {
      elky: "Elky",
      studio: "Studio"
    }
  },
  theme: {
    primaryColor: "#0a0a0a",
    secondaryColor: "#bf953f",
    backgroundColor: "#fafafa",
    fontDisplay: "Playfair Display",
    fontBody: "Montserrat",
    fontCursive: "Great Vibes"
  },
  hero: {
    title: 'Inmortalizando tus momentos más preciosos',
    titleStyle: { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', bold: false, italic: false, underline: false, color: '#ffffff' },
    subtitle: 'Capturando la esencia de cada emoción con una visión artística y cinematográfica que trasciende el tiempo.',
    subtitleStyle: { fontSize: '18px', bold: false, italic: false, underline: false, color: 'rgba(255,255,255,0.9)' },
    ctaPrimary: 'Ver Portafolio',
    ctaPrimaryStyle: { fontSize: '13px', bold: true, italic: false, underline: false, color: '#0a0a0a' },
    ctaPrimaryDestination: '/portfolio',
    ctaSecondary: 'Reservar Cita',
    ctaSecondaryStyle: { fontSize: '13px', bold: true, italic: false, underline: false, color: '#ffffff' },
    ctaSecondaryDestination: '/contact',
    backgroundImage: '/hero.png',
    mobileBackgroundImage: '',
  },
  intro: {
    tag: 'Nuestra Historia',
    tagStyle: { fontSize: '11px', bold: true, italic: false, underline: false, color: '#bf953f' },
    title: 'El Arte detrás de la Lente',
    titleStyle: { fontSize: '48px', bold: false, italic: false, underline: false, color: '#0a0a0a' },
    body: 'Con más de una década documentando las historias de amor más exclusivas y los eventos corporativos más prestigiosos, Elky Studios nace de la pasión por lo auténtico.',
    bodyStyle: { fontSize: '16px', bold: false, italic: false, underline: false, color: '#555555' },
    ctaText: 'Conoce más sobre nosotros →',
    ctaTextStyle: { fontSize: '13px', bold: true, italic: false, underline: true, color: '#0a0a0a' },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVQ_1Kc8kXJhFSLMgXHAeXHFEI4dNBpW6mRe-2cFsTR6lDERH2a1kvJGGP2rF-b1k_AwJwbmLCkm7G7nNjFwx67_K1h7Z5V1jqFQZ_L_WE8VzWHqRBIqHrxbEQkVdVaIXLl3bNLhVzQ8EZZ9S1h2yiXzOaaxaXnw0w3xSrHnX0tlHVNnE5f5U2J-UvD7JWRuFpQBCG8uMRz5XbRv0J09ew8FqizfSLz9qhBr7jY1k0Dg0MR4dIZHNh9',
  },
  services: {
    hero: {
      title: "Servicios y Paquetes",
      subtitle: "Cada evento es una obra de arte en movimiento."
    },
    banner: {
      tag: "Oferta de Temporada",
      title: "Reserva tu Boda de Invierno",
      description: "Obtén un 15% de descuento en el Paquete Full Evento y una sesión de pre-boda de cortesía.",
      active: true
    },
    basePackages: [
      {
        id: "basic",
        title: "Paquete Básico",
        subtitle: "Esenciales de Calidad",
        basePrice: 800,
        currency: "€",
        isPrimary: false,
        image: "",
        features: ["6 Horas de cobertura", "Galería digital privada", "Edición profesional básica"]
      },
      {
        id: "premium",
        title: "Paquete Premium",
        subtitle: "Nuestra Recomendación",
        basePrice: 1500,
        currency: "€",
        isPrimary: true,
        image: "",
        features: ["10 Horas de cobertura", "Video highlight (5-7 min)", "Álbum físico de lujo", "Entrega en USB premium"]
      },
      {
        id: "full",
        title: "Paquete Full Evento",
        subtitle: "Experiencia Completa",
        basePrice: 2800,
        currency: "€",
        isPrimary: false,
        image: "",
        features: ["Cobertura ilimitada", "Dos fotógrafos senior", "Sesión pre-boda incluida", "Video documental completo"]
      }
    ],
    items: [
      {
        title: "Bodas & Elopements",
        desc: "Documentación íntima y elegante de su unión más sagrada.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl_4ke40ZEWnCEra0kZhvqiPk6buWaVvyO48BNtNz7B2597gJlDGOls8CRQg8fsRYAxSzIT9hWRzK1G41NOhBAQs2gIsyoZP4KRbpaSLzr_k97oWR6rDs0tXQcVF6URVkWtqNFaitBvuwvTbjZiLqg912FMqdmPC1TZTpmnWzg7Ikhzlr11ym-P8fXhldZUD2iRrXWxB4HJg3tOI88edcKcpcWZym_d9mKdTPeZif3OVvkytpE_SM6Rd3zZ3kpJ33P0uUCt9oB4XNo",
        linkText: "Ver Portafolio",
        linkDestination: "/portfolio?tipo=Bodas"
      },
      {
        title: "Eventos Corporativos",
        desc: "Capturando la sofisticación y el éxito de sus momentos empresariales.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfpHDiUGFox-xQ_atfdkRJnTRbaXSDCu2AMMv5itV6v3_ZPxDBsQLN7VtqC1-rb_qG27A3ivo2vFshbiaegK1xJPO1IzOZSXvkA14A8zWPDoh9Co--cbRZNc15neSSBkQ0RvCPGB0OByU4X9-DKBrVUDi7Worg8AVaq9NIIyFt8C5FMLL7OwOODUYlVYNj-RbRwCzNRlHixhEnGsKtWQJ3c9nHnFLEWZ2kl9niJlnG9-mV6wq42E3HIT9cKJl86ejwfZqD8PPoApHZ",
        linkText: "Ver Servicios",
        linkDestination: "/services?tipo=Eventos Corporativos"
      },
      {
        title: "Sesiones Personales",
        desc: "Retratos artísticos que revelan su verdadera personalidad.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm4COf441WkoJ7I4evOBKE6l_p8fOX9YpAV6r74fvtlOMp5TGFJwlpxdfQrpg6Az_fnixTQUPdGBOxYyQwknM42jm_pH8HkHxSfk9TecC6Pyl8rY8-J2K0GCKIANhUfMRyg9nOppHpE4ROBmGAvSoHIWr3iApoSQWXMiOyubSOCtm4lt3vP07BRGyqK4qcD6lctRCBHYlFNCEggjXfaLF6GezpSQ_ioSen1KiXRoiiabhpid0tdYvayWZ4bV69ivemtD8i1sxtuEdb",
        linkText: "Ver Portafolio",
        linkDestination: "/portfolio?tipo=Sesiones Personales"
      }
    ],
    categoryOverrides: {
      "Bodas": {
        multiplier: 1.4,
        note: "Incluye sesión pre-boda de cortesía",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: ["Drone coverage"] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Quinceañeros": {
        multiplier: 1.1,
        note: "Incluye sesión de preparativos",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Fiestas Infantiles": {
        multiplier: 0.9,
        note: "",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Compromisos": {
        multiplier: 1.0,
        note: "",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Bautizos": {
        multiplier: 0.95,
        note: "",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Eventos Corporativos": {
        multiplier: 1.3,
        note: "Entrega express disponible",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      },
      "Sesiones Personales": {
        multiplier: 0.7,
        note: "Sesión de 2-3 horas en locación",
        active: true,
        packageOverrides: {
          basic: { customPrice: null, image: "", extraFeatures: [] },
          premium: { customPrice: null, image: "", extraFeatures: [] },
          full: { customPrice: null, image: "", extraFeatures: [] }
        },
        extraPackages: []
      }
    }
  },
  cta: {
    title: '¿Listo para capturar tu próxima gran historia?',
    titleStyle: { fontSize: '48px', bold: false, italic: false, underline: false, color: '#ffffff' },
    subtitle: 'Estamos disponibles para proyectos locales e internacionales. Contáctanos para una consulta personalizada.',
    subtitleStyle: { fontSize: '16px', bold: false, italic: false, underline: false, color: 'rgba(255,255,255,0.7)' },
  },
  contact: {
    whatsapp: "+34 600 000 000",
    whatsappLink: "https://wa.me/34600000000",
    whatsappMessageTemplate: `Hola! Me interesa el siguiente paquete:

Paquete: {{paquete}}
Seccion: {{seccion}}
Incluye:
{{descripcion}}
Precio: {{precio}}

Podrias darme mas informacion?`,
    email: "hello@luxemedia.art",
    instagram: "@luxemedia_artistry",
    instagramLink: "https://instagram.com/luxemedia_artistry",
    facebook: "",
    facebookLink: "",
    tiktok: "",
    tiktokLink: "",
    youtube: "",
    youtubeLink: "",
    pinterest: "",
    pinterestLink: "",
    workZones: [
      {
        id: "zone-default-1",
        name: "Collique - Comas",
        description: "Cobertura principal en Collique y alrededores",
        lat: -11.9175,
        lng: -77.0543,
        radiusKm: 4,
        color: "#bf953f"
      }
    ],
    defaultRadiusKm: 4
  },
  calendar: {
    bookedDates: [],
    consultDates: [],
    reservationRequests: [],
    settings: {
      autoAccept: false,
      advanceBookingDays: 365,
      minNoticeDays: 7
    }
  },
  footer: {
    tagline: "Elevando la cinematografía de eventos a un estándar de alta costura.",
    copyright: "2024 ELKY STUDIOS. ALL RIGHTS RESERVED."
  },
  portfolio: {
    hero: {
      title: 'Nuestro Portafolio',
      subtitle: 'Momentos capturados con maestría técnica y sensibilidad artística. Una curaduría de historias que perduran a través del tiempo.',
      titleStyle: { fontSize: '64px', bold: false, italic: false, underline: false, color: '#0a0a0a' },
      subtitleStyle: { fontSize: '16px', bold: false, italic: false, underline: false, color: '#666666' }
    },
    cta: {
      title: '¿Listo para contar tu historia?',
      subtitle: 'Permítenos capturar la esencia de tus momentos más valiosos con el arte y la dedicación que mereces.',
      btnPrimary: 'Escríbenos Hoy',
      btnSecondary: 'Ver Servicios'
    },
    categories: [
      'Todos', 'Bodas', 'Cumpleaños', 'Fiestas Infantiles',
      'Quinceañeros', 'Compromisos', 'Bautizos',
      'Eventos Corporativos', 'Sesiones Personales'
    ],
    years: ['Todos', '2024', '2023', '2022'],
    events: []
  },
  reviews: {
    published: [
      {
        id: 1,
        name: 'Elena Martínez',
        event: 'Boda de Verano, 2023',
        eventType: 'Bodas',
        package: 'Paquete Full Evento',
        text: 'La atención al detalle y la capacidad de capturar momentos espontáneos superó todas nuestras expectativas. Las fotos parecen sacadas de una revista.',
        rating: 5,
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkLHRVNfMA_vUVhrrhF1ieWOSfsi4hDdKWhqgIwGxJ60ATZrpMGm4SLtCQTjwOfQDRh0Y-Rnxqnu9URRnOYp9sDtMA6C2pQW2EJe-Vtt1qHjrJStpSKmJvlrGyg-tORCPChR_rMfhy0pyo2UvPNNhqrVCLBfcDLOMivc7sSV6uahLuP_L0lnuseh_6nQpGDEAQU2wUpDXSyoc166Y1GOqrrn8rJAUlwBLWnxV7MQGynhu-q9WKYb_PCFbSWy9M__-nVSTml7fyGwiQ',
        date: '2023-08-15',
        featured: false,
      },
      {
        id: 2,
        name: 'Ricardo Gómez',
        event: 'Aniversario, 2023',
        eventType: 'Sesiones Personales',
        package: 'Paquete Premium',
        text: 'Contratar el Paquete Premium fue la mejor decisión. El video highlight nos hace llorar cada vez que lo vemos. Gracias ELKY STUDIOS por todo.',
        rating: 5,
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDipHIEEvdstReZeF6PZqFw3GWgXyOPaF3aDfVsMu1qE1K2NGbpyieIdzDLuNUfrNOrGE8gSnlGaQkAei7qYKYZqqW-uqjAn81nJiyWGJOGJp_tRd5AWCpJ5p4PBVaz-Hzw3iGeQTigmAgOQjE_ztrKkdOoGxPmWDyLA7jEUttQqvq30KwlPBhuoluM7GlViF4EpkcqKhB0mwFlbYDhnRVinWaohtpUL1HXtbNMnVARB_d4TcWpNCmUHyVANXaz_BqMCaQdxxNjehos',
        date: '2023-11-20',
        featured: false,
      },
      {
        id: 3,
        name: 'Sofía Valdés',
        event: 'Boda Destino, 2024',
        eventType: 'Bodas',
        package: 'Paquete Full Evento',
        text: 'Profesionalismo puro. Durante todo el evento ni siquiera notamos su presencia, pero capturaron cada detalle importante.',
        rating: 5,
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQvEO9VeKaOo-DXaUtu5gCic2FCTjGFeDlx-YCnkuNJ5I_S-oeaqs4RhX_Q-IelN59-V8GrZOMmf3ZJLS4KM2XfbrAC87v-TTrV-Yq359reUrMVYYktBGXAn9aZeueVmev7xYJyPl0HK51-LHpSTWlrqHgaTRYtABXJO9s7dZ28kkOOz0HPsCRpmX11ENB_CH8TSrrqCMbLV96W05sNZcr2LY8AMt_athUaj70NXfdSB_qn2vm_1GPfGtQQDxreW8ia3iNCd-a9Qp',
        date: '2024-03-10',
        featured: false,
      },
      {
        id: 4,
        name: 'Javier Ruiz',
        event: 'Gala Benéfica, 2024',
        eventType: 'Eventos Corporativos',
        package: 'Paquete Premium',
        text: 'El álbum físico es una pieza de arte en sí misma. La calidad del papel y la impresión son insuperables. Totalmente recomendado.',
        rating: 5,
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwO0CWyQx4J_5zKaNTNxFkgavOx2cvRKn0Z2g_I8j7kjOPF8M1quts-u8aZVxnLgwB-3acIPU47-oGU4W0Aeh3Af8Oww9CALBxQGndMfC9_uFsk5lBM87xOxTyUg80QmGK9SmUCXawQ5fOgfQBLJmpYyZEaZ9T1CiW6FkHHBPBHqP2Xoj9IrMul5685WXLxIStynZOQrIN2mlv4Q1d7QOcjXA946c4j7MzCdX1N3kiKdq7ZmrxH0De8v6GymX--OT-LSmy_QfNDLkD',
        date: '2024-06-05',
        featured: false,
      }
    ],
    pending: [],
    settings: {
      showOnServices: true,
      maxDisplayed: 8,
      requireApproval: true,
    },
  },
  promos: {
    homePopup: {
      enabled: true,
      title: "Ofertas Especiales",
      subtitle: "Captura tus momentos más importantes",
      frequency: "daily",
      delaySeconds: 2,
      maxDisplayed: 4,
      cards: [
        {
          id: "promo-1",
          category: "Bodas",
          title: "Paquete Boda Completa",
          description: "Cobertura total de tu día especial con el mejor equipo",
          price: "S/1400",
          currency: "S/",
          features: ["10 horas de cobertura", "Video highlight", "Álbum físico de lujo"],
          image: "",
          ctaText: "Conocer más",
          ctaLink: "/services?tipo=Bodas",
          whatsappText: "Hola! Me interesa el paquete de Bodas",
          active: true,
          showOnHomePopup: true
        },
        {
          id: "promo-2",
          category: "Quinceañeros",
          title: "Quinceañera Premium",
          description: "Inmortaliza el debut más especial con elegancia y arte",
          price: "S/800",
          currency: "S/",
          features: ["8 horas de cobertura", "Sesión previa incluida", "Galería digital privada"],
          image: "",
          ctaText: "Conocer más",
          ctaLink: "/services?tipo=Quinceañeros",
          whatsappText: "Hola! Me interesa el paquete de Quinceañera",
          active: true,
          showOnHomePopup: true
        },
        {
          id: "promo-3",
          category: "Bautizos",
          title: "Bautizo Especial",
          description: "Un momento sagrado capturado con delicadeza y profesionalismo",
          price: "S/500",
          currency: "S/",
          features: ["4 horas de cobertura", "Galería digital", "Edición profesional"],
          image: "",
          ctaText: "Conocer más",
          ctaLink: "/services?tipo=Bautizos",
          whatsappText: "Hola! Me interesa el paquete de Bautizo",
          active: true,
          showOnHomePopup: true
        },
        {
          id: "promo-4",
          category: "Fiestas Infantiles",
          title: "Fiesta Mágica",
          description: "Captura la alegría y magia de los pequeños momentos grandes",
          price: "S/400",
          currency: "S/",
          features: ["3 horas de cobertura", "50+ fotos editadas", "Entrega en 48h"],
          image: "",
          ctaText: "Conocer más",
          ctaLink: "/services?tipo=Fiestas Infantiles",
          whatsappText: "Hola! Me interesa el paquete de Fiesta Infantil",
          active: true,
          showOnHomePopup: true
        }
      ]
    },
    portfolioPopup: {
      enabled: true,
      delaySeconds: 60,
      title: "¿Te gusta lo que ves?",
      subtitle: "Tenemos el paquete perfecto para ti",
      ctaText: "Ver paquetes",
      showCountdown: true,
      countdownSeconds: 10
    }
  }
};

// Merge defensivo para asegurar que campos nuevos siempre existan
function mergeContent(parsed) {
  return {
    ...defaultContent,
    ...parsed,
    services: {
      ...defaultContent.services,
      ...(parsed.services || {}),
      banner: {
        ...defaultContent.services.banner,
        ...(parsed.services?.banner || {}),
      },
      basePackages: parsed.services?.basePackages || defaultContent.services.basePackages,
      categoryOverrides: parsed.services?.categoryOverrides || defaultContent.services.categoryOverrides,
    },
    calendar: {
      ...defaultContent.calendar,
      ...(parsed.calendar || {}),
    },
    portfolio: {
      ...defaultContent.portfolio,
      ...(parsed.portfolio || {}),
    },
    reviews: {
      ...defaultContent.reviews,
      ...(parsed.reviews || {}),
    },
    promos: {
      ...defaultContent.promos,
      ...(parsed.promos || {}),
      homePopup: {
        ...defaultContent.promos.homePopup,
        ...(parsed.promos?.homePopup || {}),
        maxDisplayed: parsed.promos?.homePopup?.maxDisplayed ?? defaultContent.promos.homePopup.maxDisplayed,
        cards: (parsed.promos?.homePopup?.cards || defaultContent.promos.homePopup.cards).map(c => ({
          ...c,
          showOnHomePopup: c.showOnHomePopup ?? true
        }))
      }
    },
  };
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial: Supabase SIEMPRE primero
  useEffect(() => {
    async function loadContent() {
      // ─── INTENTO 1: Leer desde Supabase ─────────────────────────────────
      let supabaseOk = false;
      let supabaseData = null;
      let supabaseError = null;

      try {
        console.log('[Sync] Loading from Supabase...');
        const result = await supabase
          .from('site_content')
          .select('data')
          .eq('id', 'main')
          .maybeSingle(); // maybeSingle() devuelve null (sin error) si no hay fila

        supabaseOk = true; // Supabase respondió (aunque no haya datos)
        supabaseData = result.data;
        supabaseError = result.error;
      } catch (e) {
        console.warn('[Sync] Using local fallback — Supabase unreachable:', e.message);
      }

      // ─── CASO A: Supabase tiene datos → usarlos directamente ────────────
      if (supabaseOk && supabaseData?.data) {
        console.log('[Sync] ✅ Loaded from Supabase');
        setContent(mergeContent(supabaseData.data));
        setIsLoading(false);
        return;
      }

      // ─── CASO B: Supabase OK pero vacío → intentar migrar localStorage ──
      if (supabaseOk && !supabaseData) {
        const localRaw = localStorage.getItem('luxe_content');
        if (localRaw) {
          try {
            const localParsed = JSON.parse(localRaw);
            console.log('[Sync] Migrating local content to Supabase...');
            const { error: upsertError } = await supabase
              .from('site_content')
              .upsert({ id: 'main', data: localParsed, updated_at: new Date().toISOString() });

            if (!upsertError) {
              console.log('[Sync] ✅ Migration successful — now using Supabase');
              setContent(mergeContent(localParsed));
              // Marcar como migrado para no volver a depender de localStorage
              localStorage.setItem('luxe_migrated_to_supabase', 'true');
            } else {
              console.warn('[Sync] Migration upsert error:', upsertError.message);
              setContent(mergeContent(localParsed));
            }
          } catch (e) {
            console.warn('[Sync] Migration parse error:', e.message);
          }
        } else {
          // Supabase vacío y localStorage vacío → usar defaultContent (primer arranque)
          console.log('[Sync] Fresh start — no saved content anywhere');
        }
        setIsLoading(false);
        return;
      }

      // ─── CASO C: Supabase offline o error de red → fallback localStorage ─
      console.warn('[Sync] Using local fallback — Supabase error:', supabaseError?.message);
      try {
        const saved = localStorage.getItem('luxe_content');
        if (saved) {
          setContent(mergeContent(JSON.parse(saved)));
          console.log('[Sync] ⚠️ Loaded from localStorage (offline mode)');
        }
      } catch (e) {
        console.error('[Sync] localStorage fallback error:', e);
      }
      setIsLoading(false);
    }
    loadContent();
  }, []);

  // Guardar reseña pendiente (desde el formulario público)
  const submitReview = useCallback(async (reviewData) => {
    const newReview = {
      ...reviewData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    // Intentar Supabase primero
    try {
      await supabase.from('pending_reviews').insert([{
        name: newReview.name,
        event: newReview.event,
        event_type: newReview.eventType,
        package: newReview.package,
        text: newReview.text,
        rating: newReview.rating,
        photo: newReview.photo || '',
        date: newReview.date,
        status: 'pending',
      }]);
    } catch (e) {
      // Fallback: localStorage
      const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
      pending.push(newReview);
      localStorage.setItem('luxe_pending_reviews', JSON.stringify(pending));
    }
    return newReview;
  }, []);

  // Cargar reseñas pendientes (para el editor)
  const getPendingReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pending_reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (!error && data) {
        // Normalizar campo de Supabase al formato del contexto
        return data.map(r => ({
          id: r.id,
          name: r.name,
          event: r.event,
          eventType: r.event_type,
          package: r.package,
          text: r.text,
          rating: r.rating,
          photo: r.photo,
          date: r.date,
          status: r.status,
        }));
      }
    } catch (e) {
      console.warn('[Supabase] getPendingReviews fallback:', e.message);
    }
    // Fallback: localStorage
    return JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
  }, []);

  // Publicar una reseña pendiente
  const publishReview = useCallback(async (reviewId, editedData = null) => {
    let review = null;

    // Buscar en Supabase
    try {
      const { data } = await supabase
        .from('pending_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();
      if (data) {
        review = {
          id: data.id, name: data.name, event: data.event,
          eventType: data.event_type, package: data.package,
          text: data.text, rating: data.rating, photo: data.photo,
          date: data.date, status: 'published',
        };
        // Marcar como publicada en Supabase
        await supabase.from('pending_reviews').update({ status: 'published' }).eq('id', reviewId);
      }
    } catch (e) {
      console.warn('[Supabase] publishReview fallback:', e.message);
    }

    // Fallback: buscar en localStorage
    if (!review) {
      const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
      review = pending.find(r => r.id === reviewId);
      if (!review) return;
      const newPending = pending.filter(r => r.id !== reviewId);
      localStorage.setItem('luxe_pending_reviews', JSON.stringify(newPending));
    }

    const toPublish = editedData ? { ...review, ...editedData } : review;
    toPublish.status = 'published';

    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        published: [...(prev.reviews?.published || []), toPublish],
      }
    }));
    setHasUnsaved(true);
  }, []);

  // Rechazar reseña pendiente
  const rejectReview = useCallback(async (reviewId) => {
    try {
      await supabase.from('pending_reviews').update({ status: 'rejected' }).eq('id', reviewId);
    } catch (e) {
      // Fallback: localStorage
      const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
      localStorage.setItem('luxe_pending_reviews', JSON.stringify(pending.filter(r => r.id !== reviewId)));
    }
  }, []);

  // Eliminar reseña publicada
  const deletePublishedReview = useCallback((reviewId) => {
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        published: prev.reviews.published.filter(r => r.id !== reviewId),
      }
    }));
    setHasUnsaved(true);
  }, []);

  // Marcar como destacada
  const toggleFeaturedReview = useCallback((reviewId) => {
    setContent(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        published: prev.reviews.published.map(r =>
          r.id === reviewId ? { ...r, featured: !r.featured } : r
        ),
      }
    }));
    setHasUnsaved(true);
  }, []);

  const syncCategoryOverrides = useCallback((newCategories, currentOverrides) => {
    const overrides = { ...currentOverrides };
    const categories = newCategories.filter(c => c !== 'Todos');
    categories.forEach(cat => {
      if (!overrides[cat]) {
        overrides[cat] = {
          multiplier: 1, note: '', active: true,
          packageOverrides: {}, extraPackages: []
        };
      }
    });
    return overrides;
  }, []);

  const update = useCallback((path, value) => {
    setContent(prev => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}; // Ensure path exists
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;

      // Sincronizar categorías con servicios
      if (path === 'portfolio.categories') {
        if (!next.services) next.services = {};
        next.services.categoryOverrides = syncCategoryOverrides(value, next.services.categoryOverrides || {});
      }

      return next;
    });
    setHasUnsaved(true);
  }, [syncCategoryOverrides]);

  const save = useCallback(async () => {
    // 1. Intentar guardar en Supabase
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ id: 'main', data: content, updated_at: new Date().toISOString() });

      if (!error) {
        console.log("Save content success");
        // Espejo en localStorage por si Supabase no está disponible la próxima carga
        try { localStorage.setItem('luxe_content', JSON.stringify(content)); } catch (_) {}
        setHasUnsaved(false);
        return { success: true };
      }
      console.warn('[Supabase] Error al guardar:', error.message);
    } catch (e) {
      console.warn('[Supabase] Error de red al guardar:', e.message);
    }

    // 2. Fallback: localStorage
    try {
      console.log("Save content success");
      localStorage.setItem('luxe_content', JSON.stringify(content));
      setHasUnsaved(false);
      return { success: true };
    } catch (e) {
      console.error('[localStorage] Error al guardar:', e);
      return { success: false, error: 'Almacenamiento lleno. Reduce el contenido del portafolio.' };
    }
  }, [content]);

  const reset = useCallback(async () => {
    if (confirm('¿Restaurar todo el contenido original?')) {
      setContent(defaultContent);
      localStorage.removeItem('luxe_content');
      setHasUnsaved(false);
      // También borrar en Supabase (upsert con default)
      try {
        await supabase
          .from('site_content')
          .upsert({ id: 'main', data: defaultContent, updated_at: new Date().toISOString() });
      } catch (e) {
        console.warn('[Supabase] reset fallback silencioso:', e.message);
      }
    }
  }, []);

  return (
    <SiteContentContext.Provider value={{ 
      content, 
      update, 
      updateContent: update, // Aliased for compatibility
      save, 
      hasUnsaved,
      isLoading,
      loadingContent: isLoading,
      reset,
      submitReview,
      getPendingReviews,
      publishReview,
      rejectReview,
      deletePublishedReview,
      toggleFeaturedReview
    }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export const useSiteContent = () => useContext(SiteContentContext);
