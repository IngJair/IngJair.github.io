import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { SiteContentContext } from './useSiteContent';

const CONTENT_LOAD_TIMEOUT_MS = 4000;
const LOCAL_HISTORY_KEY = 'elky_content_history';
const LOCAL_DRAFT_KEY = 'elky_content_draft';
const MAX_LOCAL_VERSIONS = 10;

function withTimeout(promise, timeoutMs = CONTENT_LOAD_TIMEOUT_MS) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeout])
    .finally(() => clearTimeout(timeoutId));
}

function readLocalVersions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalVersion(data, reason = 'Copia automática') {
  if (!data || typeof data !== 'object') return;
  try {
    const serializedData = JSON.stringify(data);
    const versions = readLocalVersions();
    if (versions[0]?.serializedData === serializedData) return;

    const nextVersion = {
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reason,
      source: 'local',
      serializedData,
    };
    localStorage.setItem(
      LOCAL_HISTORY_KEY,
      JSON.stringify([nextVersion, ...versions].slice(0, MAX_LOCAL_VERSIONS))
    );
  } catch (error) {
    console.warn('[Backup] No se pudo crear la copia local:', error.message);
  }
}

function readLocalDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_DRAFT_KEY) || 'null');
    if (!parsed?.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function cachePublishedContent(data) {
  try {
    localStorage.setItem('luxe_content', JSON.stringify(data));
  } catch (error) {
    console.warn('[Backup] No se pudo actualizar la copia local:', error.message);
  }
}

function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch (error) {
    console.warn('[Backup] No se pudo limpiar el borrador local:', error.message);
  }
}

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
    backgroundImage: '/imagenes/4457575698e39f2bc156fc256b379a32.jpg',
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
    image: '/imagenes/fotografia-retrato-estilos.jpg',
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
        currency: "S/",
        isPrimary: false,
        image: "",
        features: ["6 Horas de cobertura", "Galería digital privada", "Edición profesional básica"]
      },
      {
        id: "premium",
        title: "Paquete Premium",
        subtitle: "Nuestra Recomendación",
        basePrice: 1500,
        currency: "S/",
        isPrimary: true,
        image: "",
        features: ["10 Horas de cobertura", "Video highlight (5-7 min)", "Álbum físico de lujo", "Entrega en USB premium"]
      },
      {
        id: "full",
        title: "Paquete Full Evento",
        subtitle: "Experiencia Completa",
        basePrice: 2800,
        currency: "S/",
        isPrimary: false,
        image: "",
        features: ["Cobertura ilimitada", "Dos fotógrafos senior", "Sesión pre-boda incluida", "Video documental completo"]
      }
    ],
    items: [
      {
        title: "Bodas & Elopements",
        desc: "Documentación íntima y elegante de su unión más sagrada.",
        image: "/imagenes/4457575698e39f2bc156fc256b379a32.jpg",
        linkText: "Ver Portafolio",
        linkDestination: "/portfolio?tipo=Bodas"
      },
      {
        title: "Eventos Corporativos",
        desc: "Capturando la sofisticación y el éxito de sus momentos empresariales.",
        image: "/imagenes/472672677_1144480881015835_2883235338421335865_n.jpg",
        linkText: "Ver Servicios",
        linkDestination: "/services?tipo=Eventos Corporativos"
      },
      {
        title: "Sesiones Personales",
        desc: "Retratos artísticos que revelan su verdadera personalidad.",
        image: "/imagenes/fotografia-retrato-estilos.jpg",
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
    whatsapp: "+51 978 752 237",
    whatsappLink: "https://wa.me/51978752237",
    whatsappMessageTemplate: `Hola! Me interesa el siguiente paquete:

Paquete: {{paquete}}
Seccion: {{seccion}}
Incluye:
{{descripcion}}
Precio: {{precio}}

Podrias darme mas informacion?`,
    email: "elky.javier2@gmail.com",
    instagram: "",
    instagramLink: "",
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
    copyright: "ELKY STUDIOS. TODOS LOS DERECHOS RESERVADOS."
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
    published: [],
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
    contact: {
      ...defaultContent.contact,
      ...(parsed.contact || {}),
    },
    calendar: {
      ...defaultContent.calendar,
      ...(parsed.calendar || {}),
    },
    portfolio: {
      ...defaultContent.portfolio,
      ...(parsed.portfolio || {}),
      events: (parsed.portfolio?.events || defaultContent.portfolio.events).filter(item => {
        const hasTitle = Boolean(item?.title?.trim());
        const hasCategory = Boolean(item?.category?.trim());
        const hasImage = Boolean((item?.coverImage || item?.image)?.trim());
        // Eliminar automáticamente si está completamente vacía al cargar
        return hasTitle || hasCategory || hasImage;
      })
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
          image: c.image || '',
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
  const [syncStatus, setSyncStatus] = useState('loading');
  const [syncError, setSyncError] = useState('');
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState(null);
  const loadRequestRef = useRef(0);

  const loadContent = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setIsLoading(true);
    setSyncStatus('loading');
    setSyncError('');

    let result;
    try {
      result = await withTimeout(
        supabase
          .from('site_content')
          .select('data, updated_at')
          .eq('id', 'main')
          .maybeSingle()
      );
    } catch (error) {
      result = { data: null, error };
    }

    if (requestId !== loadRequestRef.current) return;

    if (!result.error && result.data?.data && result.data.updated_at) {
      const publishedData = result.data.data;
      let nextContent = mergeContent(publishedData);
      let recoveredDraft = false;

      saveLocalVersion(publishedData, 'Última copia sincronizada');
      cachePublishedContent(publishedData);

      if (window.location.pathname.startsWith('/admin')) {
        const draft = readLocalDraft();
        if (draft?.baseUpdatedAt === result.data.updated_at) {
          nextContent = mergeContent(draft.data);
          recoveredDraft = true;
        } else if (draft?.data) {
          saveLocalVersion(draft.data, 'Borrador recuperable de otra versión');
          clearLocalDraft();
        }
      }

      setContent(nextContent);
      setRemoteUpdatedAt(result.data.updated_at);
      setHasUnsaved(recoveredDraft);
      setSyncStatus('synced');
      setIsLoading(false);
      return;
    }

    let localContent = null;
    try {
      const saved = localStorage.getItem('luxe_content');
      if (saved) localContent = JSON.parse(saved);
    } catch (error) {
      console.error('[Sync] Error al leer la copia local:', error);
    }

    if (localContent) setContent(mergeContent(localContent));
    setRemoteUpdatedAt(null);
    setHasUnsaved(false);

    if (!result.error && !result.data) {
      setSyncStatus('missing');
      setSyncError('Supabase no contiene el registro principal. La publicación está bloqueada para evitar reemplazar datos por accidente.');
    } else {
      setSyncStatus('offline');
      setSyncError('No se pudo verificar el contenido publicado en Supabase. La publicación está bloqueada hasta recuperar la conexión.');
      console.info('[Sync] Copia local de solo lectura:', result.error?.message || 'Supabase no disponible');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(loadContent, 0);
    return () => {
      clearTimeout(timeoutId);
      loadRequestRef.current += 1;
    };
  }, [loadContent]);

  useEffect(() => {
    if (
      !hasUnsaved
      || syncStatus !== 'synced'
      || !remoteUpdatedAt
      || !window.location.pathname.startsWith('/admin')
    ) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({
          data: content,
          baseUpdatedAt: remoteUpdatedAt,
          savedAt: new Date().toISOString(),
        }));
      } catch (error) {
        console.warn('[Backup] No se pudo guardar el borrador local:', error.message);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, hasUnsaved, remoteUpdatedAt, syncStatus]);

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
      const { error } = await supabase.from('pending_reviews').insert([{
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
      if (error) throw error;
      return { success: true, review: newReview };
    } catch {
      try {
        const pending = JSON.parse(localStorage.getItem('luxe_pending_reviews') || '[]');
        pending.push(newReview);
        localStorage.setItem('luxe_pending_reviews', JSON.stringify(pending));
      } catch (storageError) {
        console.warn('[Reviews] No se pudo crear respaldo local:', storageError.message);
      }
      return {
        success: false,
        review: newReview,
        error: 'No se pudo enviar la reseña. Revisa tu conexión e intenta nuevamente.',
      };
    }
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
      const { error } = await supabase.from('pending_reviews').update({ status: 'rejected' }).eq('id', reviewId);
      if (error) throw error;
    } catch {
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

  const replaceContent = useCallback((nextContent) => {
    if (!nextContent || typeof nextContent !== 'object' || Array.isArray(nextContent)) {
      return { success: false, error: 'El respaldo no contiene una configuración válida.' };
    }
    setContent(mergeContent(nextContent));
    setHasUnsaved(true);
    return { success: true };
  }, []);

  const getContentVersions = useCallback(async () => {
    const localVersions = readLocalVersions().flatMap(version => {
      try {
        return [{
          ...version,
          data: version.data || JSON.parse(version.serializedData),
        }];
      } catch {
        return [];
      }
    });

    try {
      const { data, error } = await supabase
        .from('site_content_versions')
        .select('id, data, reason, created_at')
        .eq('content_id', 'main')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;

      const remoteVersions = (data || []).map(version => ({
        id: `remote-${version.id}`,
        remoteId: version.id,
        createdAt: version.created_at,
        reason: version.reason || 'Copia automática',
        source: 'Supabase',
        data: version.data,
      }));

      return [...remoteVersions, ...localVersions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);
    } catch (error) {
      console.warn('[Backup] Historial remoto no disponible:', error.message);
      return localVersions;
    }
  }, []);

  const restoreContentVersion = useCallback((version) => {
    const versionData = version?.data
      || (version?.serializedData ? JSON.parse(version.serializedData) : null);
    return replaceContent(versionData);
  }, [replaceContent]);

  const save = useCallback(async () => {
    if (syncStatus !== 'synced' || !remoteUpdatedAt) {
      setHasUnsaved(true);
      return {
        success: false,
        status: 'blocked',
        error: 'Publicación bloqueada: primero debemos verificar la versión actual de Supabase. Tu borrador permanece guardado en este dispositivo.',
      };
    }

    saveLocalVersion(content, 'Borrador antes de publicar');

    const { data: nextUpdatedAt, error } = await supabase.rpc('publish_site_content', {
      p_data: content,
      p_expected_updated_at: remoteUpdatedAt,
      p_reason: 'Antes de publicar desde el panel',
    });

    if (error) {
      const isConflict = error.message?.includes('CONTENT_CONFLICT');
      setHasUnsaved(true);
      if (isConflict) {
        setSyncStatus('conflict');
        setSyncError('Otra sesión publicó cambios después de que abriste el editor. Tu borrador está protegido y no se sobrescribió nada.');
        return {
          success: false,
          status: 'conflict',
          error: 'No se reemplazó el contenido: existe una versión más reciente en Supabase. Tu borrador quedó respaldado.',
        };
      }

      console.warn('[Supabase] Publicación protegida rechazada:', error.message);
      return {
        success: false,
        status: 'failed',
        error: 'No se publicó nada porque Supabase no confirmó el respaldo y la actualización atómica. Tu borrador permanece guardado.',
      };
    }

    setRemoteUpdatedAt(nextUpdatedAt);
    cachePublishedContent(content);
    clearLocalDraft();
    setHasUnsaved(false);
    setSyncStatus('synced');
    setSyncError('');
    return {
      success: true,
      status: 'published',
      message: 'Cambios publicados y respaldados correctamente.',
    };
  }, [content, remoteUpdatedAt, syncStatus]);

  return (
    <SiteContentContext.Provider value={{ 
      content, 
      update, 
      updateContent: update, // Aliased for compatibility
      replaceContent,
      save, 
      hasUnsaved,
      isLoading,
      loadingContent: isLoading,
      syncStatus,
      syncError,
      reloadContent: loadContent,
      getContentVersions,
      restoreContentVersion,
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
