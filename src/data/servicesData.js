// Paquetes BASE (aplican para todos los eventos)
export const BASE_PACKAGES = [
  {
    id: 'basic',
    title: 'Paquete Básico',
    subtitle: 'Esenciales de Calidad',
    basePrice: 800,
    currency: 'S/',
    isPrimary: false,
    features: [
      { text: '6 Horas de cobertura', included: true },
      { text: 'Galería digital privada', included: true },
      { text: 'Edición profesional básica', included: true },
      { text: 'Video highlight', included: false },
      { text: 'Álbum físico', included: false },
      { text: 'Segundo fotógrafo', included: false },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2t4xcwuTL3c_3Y5uxW-rEXOHEKtIN9eNpPBcfXFFanxrl4qzT1YQgHfzUT8eo-kJfljZ1SZkWxcksfucR4rbm-cG5J5mlHJ-2T4qMQViLE8ycFw03_s1vCNczHGUKhy0zomH1-G0cvm8ggRsvt6z3zwlLtWnv9u4d3yJ6tOsoLulZXOmrmVtFVYpJ2HkaUqdsLs_oCBN4MQVmSvMM4iF2rBD3zOwm7Vqn_hZUbgO-IidzWSLFNMxq1LFmSQNU-jUKpXs6_2s5YFhC',
  },
  {
    id: 'premium',
    title: 'Paquete Premium',
    subtitle: 'Nuestra Recomendación',
    basePrice: 1500,
    currency: 'S/',
    isPrimary: true,
    features: [
      { text: '10 Horas de cobertura', included: true },
      { text: 'Galería digital privada', included: true },
      { text: 'Edición profesional avanzada', included: true },
      { text: 'Video highlight (5-7 min)', included: true },
      { text: 'Álbum físico de lujo', included: true },
      { text: 'Segundo fotógrafo', included: false },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLy4aIV8Le0gSUxfC0s3Tr-oDs5lbEeqmrick6fMQB7B9P3ziuHic5uNFZxMTtQwPMc2HFNDsZSBEv_U54s4mSsoDecOpduNKBKwpGWqd1RGxI8Mq_axaZv_r2FnEgmItqZhHxWs-y0TSp7xI6u0CeQVGO_O5nTKA-lyEYHzoDZnTf-4TDlYL1BeGXbfFTFAZf97bXG9QP_j13DEJEpxOI-AdZuvdfKDmsnzVSnGVf68lhrqv4y0iQorGhy_K3g2ybNdq-k3iTbSQ1',
  },
  {
    id: 'full',
    title: 'Paquete Full Evento',
    subtitle: 'Experiencia Completa',
    basePrice: 2800,
    currency: 'S/',
    isPrimary: false,
    features: [
      { text: 'Cobertura ilimitada', included: true },
      { text: 'Galería digital privada', included: true },
      { text: 'Edición cinematográfica premium', included: true },
      { text: 'Video documental completo', included: true },
      { text: 'Álbum físico de lujo', included: true },
      { text: 'Dos fotógrafos senior', included: true },
    ],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnbYLliOfIjwQ0MEQfNnFphC9LU8pT4EaqceP6h92xvpymYD1b5DD6beRH5zH2JFS2ancOPIc0VJ7E0cHuvl-MWxRb4Rp3ZFH244-ZvT6ULXfP4Ttghct6ihTJJFtWWJ0PUDqgNlpY3RKbAmTTqe5D5ZYEHAk1czYxh_O5iBvgkCFX4C2VhRxMw-42aap4-EtjJTtFlggYBzXEkuGuZLJzdXUaBecDM6ULqNzsquzHvSy-UCbwHXGo',
  },
];

// Modificadores de precio por categoría de evento
// El precio final = basePrice * multiplier
export const EVENT_CATEGORIES = [
  {
    id: 'all',
    label: 'Todos los Eventos',
    multiplier: 1,
    description: 'Precios base aplicables a cualquier tipo de evento',
    icon: 'photo_camera',
  },
  {
    id: 'bodas',
    label: 'Bodas',
    multiplier: 1.4,
    description: 'Cobertura completa del día más importante de tu vida',
    icon: 'favorite',
    note: 'Incluye sesión pre-boda de cortesía',
  },
  {
    id: 'quinces',
    label: 'Quinceañeros',
    multiplier: 1.1,
    description: 'Capturando la magia de este debut tan especial',
    icon: 'auto_awesome',
    note: 'Incluye sesión de preparativos',
  },
  {
    id: 'corporativo',
    label: 'Corporativos',
    multiplier: 1.3,
    description: 'Documentación profesional para eventos empresariales',
    icon: 'business_center',
    note: 'Entrega express disponible',
  },
  {
    id: 'social',
    label: 'Eventos Sociales',
    multiplier: 1.0,
    description: 'Bautizos, cumpleaños, graduaciones y más',
    icon: 'celebration',
  },
  {
    id: 'personal',
    label: 'Sesiones Personales',
    multiplier: 0.7,
    description: 'Retratos artísticos y sesiones íntimas',
    icon: 'portrait',
    note: 'Sesión de 2-3 horas en locación',
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Elena Martínez',
    event: 'Boda de Verano, 2023',
    package: 'Paquete Full Evento',
    text: 'La atención al detalle y la capacidad de capturar momentos espontáneos superó todas nuestras expectativas. Las fotos parecen sacadas de una revista.',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkLHRVNfMA_vUVhrrhF1ieWOSfsi4hDdKWhqgIwGxJ60ATZrpMGm4SLtCQTjwOfQDRh0Y-Rnxqnu9URRnOYp9sDtMA6C2pQW2EJe-Vtt1qHjrJStpSKmJvlrGyg-tORCPChR_rMfhy0pyo2UvPNNhqrVCLBfcDLOMivc7sSV6uahLuP_L0lnuseh_6nQpGDEAQU2wUpDXSyoc166Y1GOqrrn8rJAUlwBLWnxV7MQGynhu-q9WKYb_PCFbSWy9M__-nVSTml7fyGwiQ',
  },
  {
    id: 2,
    name: 'Ricardo Gómez',
    event: 'Aniversario, 2023',
    package: 'Paquete Premium',
    text: 'Contratar el Paquete Premium fue la mejor decisión. El video highlight nos hace llorar cada vez que lo vemos. Gracias ELKY STUDIOS por todo.',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDipHIEEvdstReZeF6PZqFw3GWgXyOPaF3aDfVsMu1qE1K2NGbpyieIdzDLuNUfrNOrGE8gSnlGaQkAei7qYKYZqqW-uqjAn81nJiyWGJOGJp_tRd5AWCpJ5p4PBVaz-Hzw3iGeQTigmAgOQjE_ztrKkdOoGxPmWDyLA7jEUttQqvq30KwlPBhuoluM7GlViF4EpkcqKhB0mwFlbYDhnRVinWaohtpUL1HXtbNMnVARB_d4TcWpNCmUHyVANXaz_BqMCaQdxxNjehos',
  },
  {
    id: 3,
    name: 'Sofía Valdés',
    event: 'Boda Destino, 2024',
    package: 'Paquete Full Evento',
    text: 'Profesionalismo puro. Durante todo el evento ni siquiera notamos su presencia, pero capturaron cada detalle importante.',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQvEO9VeKaOo-DXaUtu5gCic2FCTjGFeDlx-YCnkuNJ5I_S-oeaqs4RhX_Q-IelN59-V8GrZOMmf3ZJLS4KM2XfbrAC87v-TTrV-Yq359reUrMVYYktBGXAn9aZeueVmev7xYJyPl0HK51-LHpSTWlrqHgaTRYtABXJO9s7dZ28kkOOz0HPsCRpmX11ENB_CH8TSrrqCMbLV96W05sNZcr2LY8AMt_athUaj70NXfdSB_qn2vm_1GPfGtQQDxreW8ia3iNCd-a9Qp',
  },
  {
    id: 4,
    name: 'Javier Ruiz',
    event: 'Gala Benéfica, 2024',
    package: 'Paquete Premium',
    text: 'El álbum físico es una pieza de arte en sí misma. La calidad del papel y la impresión son insuperables. Totalmente recomendado.',
    rating: 5,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwO0CWyQx4J_5zKaNTNxFkgavOx2cvRKn0Z2g_I8j7kjOPF8M1quts-u8aZVxnLgwB-3acIPU47-oGU4W0Aeh3Af8Oww9CALBxQGndMfC9_uFsk5lBM87xOxTyUg80QmGK9SmUCXawQ5fOgfQBLJmpYyZEaZ9T1CiW6FkHHBPBHqP2Xoj9IrMul5685WXLxIStynZOQrIN2mlv4Q1d7QOcjXA946c4j7MzCdX1N3kiKdq7ZmrxH0De8v6GymX--OT-LSmy_QfNDLkD',
  },
];

export const FAQ_ITEMS = [
  {
    q: '¿Con cuánta anticipación debo reservar?',
    a: 'Recomendamos reservar con al menos 6 meses de anticipación para bodas, y 2-3 meses para otros eventos. Las fechas de temporada alta (mayo-octubre) se agotan rápido.',
  },
  {
    q: '¿Cómo funciona el proceso de reserva?',
    a: 'Primero agendamos una consulta gratuita para conocer tu visión. Luego enviamos una propuesta personalizada. Al confirmar, se firma el contrato y se realiza un depósito del 30% para asegurar la fecha.',
  },
  {
    q: '¿En cuánto tiempo recibo las fotos?',
    a: 'El Paquete Básico tiene entrega en 4-6 semanas. El Premium en 3-4 semanas. El Full Evento en 5-7 semanas por la edición cinematográfica avanzada.',
  },
  {
    q: '¿Viajan a otros países o ciudades?',
    a: 'Sí. Trabajamos en proyectos internacionales. Los gastos de viaje (vuelo, alojamiento) se añaden al presupuesto. Contáctanos para un presupuesto personalizado.',
  },
  {
    q: '¿Puedo personalizar un paquete?',
    a: 'Absolutamente. Los paquetes son una guía base. Podemos añadir o quitar servicios según tus necesidades. Cada evento es único y merece una propuesta a medida.',
  },
  {
    q: '¿Qué pasa si el evento se cancela o pospone?',
    a: 'Entendemos que los imprevistos ocurren. Si pospones con más de 60 días de aviso, transferimos el depósito a la nueva fecha sin costo. Consulta nuestros términos completos para cancelaciones.',
  },
];
