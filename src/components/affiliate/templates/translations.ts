// Sistema de Traduções Nativas para Templates

export interface TemplateTranslations {
  // Navigation
  nav: {
    about: string;
    services: string;
    gallery: string;
    location: string;
    testimonials: string;
    contact: string;
  };
  // Hero Section
  hero: {
    schedule: string;
    viewServices: string;
    welcome: string;
  };
  // About Section
  about: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    description: string;
    features: {
      expertise: { title: string; description: string };
      time: { title: string; description: string };
      experience: { title: string; description: string };
      quality: { title: string; description: string };
    };
  };
  // Services Section
  services: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    description: string;
    bookNow: string;
    duration: string;
  };
  // Testimonials Section
  testimonials: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    description: string;
  };
  // Location Section
  location: {
    title: string;
    subtitle: string;
    address: string;
    hours: string;
    contact: string;
    directions: string;
    weekdays: string;
    saturday: string;
    sunday: string;
    closed: string;
    easyAccess: string;
  };
  // CTA Section
  cta: {
    title: string;
    titleHighlight: string;
    description: string;
    scheduleNow: string;
    whatsappMessage: string;
  };
  // Footer
  footer: {
    quickLinks: string;
    contactUs: string;
    followUs: string;
    allRights: string;
    hours: string;
    premiumService: string;
  };
  // Common
  common: {
    learnMore: string;
    seeMore: string;
    back: string;
    next: string;
    close: string;
    loading: string;
    error: string;
    success: string;
  };
}

export const AVAILABLE_LANGUAGES_EXTENDED = [
  // Americas
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷', region: 'Americas' },
  { code: 'pt-PT', label: 'Português (Portugal)', flag: '🇵🇹', region: 'Europe' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸', region: 'Americas' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧', region: 'Europe' },
  { code: 'es-ES', label: 'Español (España)', flag: '🇪🇸', region: 'Europe' },
  { code: 'es-MX', label: 'Español (México)', flag: '🇲🇽', region: 'Americas' },
  { code: 'es-AR', label: 'Español (Argentina)', flag: '🇦🇷', region: 'Americas' },
  { code: 'es-CO', label: 'Español (Colombia)', flag: '🇨🇴', region: 'Americas' },
  { code: 'es-CL', label: 'Español (Chile)', flag: '🇨🇱', region: 'Americas' },
  { code: 'es-PE', label: 'Español (Perú)', flag: '🇵🇪', region: 'Americas' },
  { code: 'fr-FR', label: 'Français (France)', flag: '🇫🇷', region: 'Europe' },
  { code: 'fr-CA', label: 'Français (Canada)', flag: '🇨🇦', region: 'Americas' },
  
  // Europe
  { code: 'de-DE', label: 'Deutsch (Deutschland)', flag: '🇩🇪', region: 'Europe' },
  { code: 'de-AT', label: 'Deutsch (Österreich)', flag: '🇦🇹', region: 'Europe' },
  { code: 'de-CH', label: 'Deutsch (Schweiz)', flag: '🇨🇭', region: 'Europe' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱', region: 'Europe' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'uk-UA', label: 'Українська', flag: '🇺🇦', region: 'Europe' },
  { code: 'ro-RO', label: 'Română', flag: '🇷🇴', region: 'Europe' },
  { code: 'el-GR', label: 'Ελληνικά', flag: '🇬🇷', region: 'Europe' },
  { code: 'cs-CZ', label: 'Čeština', flag: '🇨🇿', region: 'Europe' },
  { code: 'hu-HU', label: 'Magyar', flag: '🇭🇺', region: 'Europe' },
  { code: 'sv-SE', label: 'Svenska', flag: '🇸🇪', region: 'Europe' },
  { code: 'da-DK', label: 'Dansk', flag: '🇩🇰', region: 'Europe' },
  { code: 'no-NO', label: 'Norsk', flag: '🇳🇴', region: 'Europe' },
  { code: 'fi-FI', label: 'Suomi', flag: '🇫🇮', region: 'Europe' },
  
  // Asia
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳', region: 'Asia' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼', region: 'Asia' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵', region: 'Asia' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷', region: 'Asia' },
  { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', region: 'Asia' },
  { code: 'th-TH', label: 'ไทย', flag: '🇹🇭', region: 'Asia' },
  { code: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳', region: 'Asia' },
  { code: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'ms-MY', label: 'Bahasa Melayu', flag: '🇲🇾', region: 'Asia' },
  { code: 'tl-PH', label: 'Filipino', flag: '🇵🇭', region: 'Asia' },
  
  // Middle East & Africa
  { code: 'ar-SA', label: 'العربية (السعودية)', flag: '🇸🇦', region: 'Middle East' },
  { code: 'ar-AE', label: 'العربية (الإمارات)', flag: '🇦🇪', region: 'Middle East' },
  { code: 'ar-EG', label: 'العربية (مصر)', flag: '🇪🇬', region: 'Middle East' },
  { code: 'he-IL', label: 'עברית', flag: '🇮🇱', region: 'Middle East' },
  { code: 'tr-TR', label: 'Türkçe', flag: '🇹🇷', region: 'Middle East' },
  { code: 'fa-IR', label: 'فارسی', flag: '🇮🇷', region: 'Middle East' },
  { code: 'sw-KE', label: 'Kiswahili', flag: '🇰🇪', region: 'Africa' },
  { code: 'af-ZA', label: 'Afrikaans', flag: '🇿🇦', region: 'Africa' },
];

// Traduções Nativas Completas
export const translations: Record<string, TemplateTranslations> = {
  'pt-BR': {
    nav: {
      about: 'Sobre',
      services: 'Serviços',
      gallery: 'Galeria',
      location: 'Localização',
      testimonials: 'Depoimentos',
      contact: 'Contato',
    },
    hero: {
      schedule: 'Agendar Horário',
      viewServices: 'Conhecer Serviços',
      welcome: 'Bem-vindo à',
    },
    about: {
      title: 'Sobre Nós',
      subtitle: 'Onde tradição encontra',
      subtitleHighlight: 'excelência moderna',
      description: 'Construímos nossa reputação cliente por cliente, corte por corte. Aqui você não é apenas mais um — você é nossa prioridade. Cada visita é uma oportunidade de superar suas expectativas.',
      features: {
        expertise: { title: 'Expertise Comprovada', description: 'Profissionais treinados com as técnicas mais atuais do mercado' },
        time: { title: 'Respeito ao seu Tempo', description: 'Agendamento inteligente para você ser atendido no horário marcado' },
        experience: { title: 'Experiência Única', description: 'Ambiente pensado para seu conforto e relaxamento' },
        quality: { title: 'Qualidade Garantida', description: 'Produtos selecionados e higiene rigorosa em cada atendimento' },
      },
    },
    services: {
      title: 'Nossos Serviços',
      subtitle: 'Cuidados que fazem',
      subtitleHighlight: 'a diferença',
      description: 'Oferecemos uma gama completa de serviços para cuidar da sua imagem com excelência.',
      bookNow: 'Agendar',
      duration: 'min',
    },
    testimonials: {
      title: 'Depoimentos',
      subtitle: 'Quem conhece,',
      subtitleHighlight: 'recomenda',
      description: 'A opinião de quem já viveu a experiência é a melhor forma de conhecer nosso trabalho.',
    },
    location: {
      title: 'Localização',
      subtitle: 'Onde estamos',
      address: 'Endereço',
      hours: 'Horário',
      contact: 'Contato',
      directions: 'Como chegar',
      weekdays: 'Seg - Sex',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Fechado',
      easyAccess: '📍 Fácil acesso pelo metrô',
    },
    cta: {
      title: 'Pronto para renovar',
      titleHighlight: 'seu estilo?',
      description: 'Reserve seu horário em poucos cliques e tenha a certeza de um atendimento pontual e personalizado. Sua experiência começa antes mesmo de chegar.',
      scheduleNow: 'Agendar Agora',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre os serviços.',
    },
    footer: {
      quickLinks: 'Links Rápidos',
      contactUs: 'Contato',
      followUs: 'Nossas Redes',
      allRights: 'Todos os direitos reservados.',
      hours: 'Horários',
      premiumService: 'Atendimento premium com agendamento online para sua comodidade.',
    },
    common: {
      learnMore: 'Saiba mais',
      seeMore: 'Ver mais',
      back: 'Voltar',
      next: 'Próximo',
      close: 'Fechar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
    },
  },

  'pt-PT': {
    nav: {
      about: 'Sobre',
      services: 'Serviços',
      gallery: 'Galeria',
      location: 'Localização',
      testimonials: 'Testemunhos',
      contact: 'Contacto',
    },
    hero: {
      schedule: 'Marcar Horário',
      viewServices: 'Ver Serviços',
      welcome: 'Bem-vindo à',
    },
    about: {
      title: 'Sobre Nós',
      subtitle: 'Onde a tradição encontra',
      subtitleHighlight: 'a excelência moderna',
      description: 'Construímos a nossa reputação cliente a cliente, corte a corte. Aqui não é apenas mais um — é a nossa prioridade. Cada visita é uma oportunidade de superar as suas expectativas.',
      features: {
        expertise: { title: 'Experiência Comprovada', description: 'Profissionais formados com as técnicas mais actuais do mercado' },
        time: { title: 'Respeito pelo seu Tempo', description: 'Marcação inteligente para ser atendido à hora marcada' },
        experience: { title: 'Experiência Única', description: 'Ambiente pensado para o seu conforto e relaxamento' },
        quality: { title: 'Qualidade Garantida', description: 'Produtos selecionados e higiene rigorosa em cada atendimento' },
      },
    },
    services: {
      title: 'Os Nossos Serviços',
      subtitle: 'Cuidados que fazem',
      subtitleHighlight: 'a diferença',
      description: 'Oferecemos uma gama completa de serviços para cuidar da sua imagem com excelência.',
      bookNow: 'Marcar',
      duration: 'min',
    },
    testimonials: {
      title: 'Testemunhos',
      subtitle: 'Quem conhece,',
      subtitleHighlight: 'recomenda',
      description: 'A opinião de quem já viveu a experiência é a melhor forma de conhecer o nosso trabalho.',
    },
    location: {
      title: 'Localização',
      subtitle: 'Onde estamos',
      address: 'Morada',
      hours: 'Horário',
      contact: 'Contacto',
      directions: 'Como chegar',
      weekdays: 'Seg - Sex',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Encerrado',
      easyAccess: '📍 Fácil acesso pelo metro',
    },
    cta: {
      title: 'Pronto para renovar',
      titleHighlight: 'o seu estilo?',
      description: 'Reserve o seu horário em poucos cliques e tenha a certeza de um atendimento pontual e personalizado. A sua experiência começa antes mesmo de chegar.',
      scheduleNow: 'Marcar Agora',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre os serviços.',
    },
    footer: {
      quickLinks: 'Links Rápidos',
      contactUs: 'Contacto',
      followUs: 'As Nossas Redes',
      allRights: 'Todos os direitos reservados.',
      hours: 'Horários',
      premiumService: 'Atendimento premium com marcação online para a sua comodidade.',
    },
    common: {
      learnMore: 'Saber mais',
      seeMore: 'Ver mais',
      back: 'Voltar',
      next: 'Seguinte',
      close: 'Fechar',
      loading: 'A carregar...',
      error: 'Erro',
      success: 'Sucesso',
    },
  },

  'en-US': {
    nav: {
      about: 'About',
      services: 'Services',
      gallery: 'Gallery',
      location: 'Location',
      testimonials: 'Testimonials',
      contact: 'Contact',
    },
    hero: {
      schedule: 'Book Now',
      viewServices: 'View Services',
      welcome: 'Welcome to',
    },
    about: {
      title: 'About Us',
      subtitle: 'Where tradition meets',
      subtitleHighlight: 'modern excellence',
      description: 'We build our reputation one client at a time, one cut at a time. Here, you\'re not just another customer — you\'re our priority. Every visit is an opportunity to exceed your expectations.',
      features: {
        expertise: { title: 'Proven Expertise', description: 'Professionals trained in the latest market techniques' },
        time: { title: 'Respect for Your Time', description: 'Smart scheduling so you\'re served right on time' },
        experience: { title: 'Unique Experience', description: 'Environment designed for your comfort and relaxation' },
        quality: { title: 'Guaranteed Quality', description: 'Selected products and rigorous hygiene in every service' },
      },
    },
    services: {
      title: 'Our Services',
      subtitle: 'Care that makes',
      subtitleHighlight: 'the difference',
      description: 'We offer a complete range of services to take care of your image with excellence.',
      bookNow: 'Book',
      duration: 'min',
    },
    testimonials: {
      title: 'Testimonials',
      subtitle: 'Those who know us,',
      subtitleHighlight: 'recommend us',
      description: 'The opinion of those who have experienced our service is the best way to know our work.',
    },
    location: {
      title: 'Location',
      subtitle: 'Where to find us',
      address: 'Address',
      hours: 'Hours',
      contact: 'Contact',
      directions: 'Get Directions',
      weekdays: 'Mon - Fri',
      saturday: 'Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      easyAccess: '📍 Easy access by subway',
    },
    cta: {
      title: 'Ready to refresh',
      titleHighlight: 'your style?',
      description: 'Book your appointment in just a few clicks and be assured of punctual, personalized service. Your experience begins before you even arrive.',
      scheduleNow: 'Book Now',
      whatsappMessage: 'Hello! I\'d like to know more about your services.',
    },
    footer: {
      quickLinks: 'Quick Links',
      contactUs: 'Contact',
      followUs: 'Follow Us',
      allRights: 'All rights reserved.',
      hours: 'Hours',
      premiumService: 'Premium service with online booking for your convenience.',
    },
    common: {
      learnMore: 'Learn more',
      seeMore: 'See more',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },

  'en-GB': {
    nav: {
      about: 'About',
      services: 'Services',
      gallery: 'Gallery',
      location: 'Location',
      testimonials: 'Testimonials',
      contact: 'Contact',
    },
    hero: {
      schedule: 'Book Appointment',
      viewServices: 'View Services',
      welcome: 'Welcome to',
    },
    about: {
      title: 'About Us',
      subtitle: 'Where tradition meets',
      subtitleHighlight: 'modern excellence',
      description: 'We build our reputation one client at a time, one cut at a time. Here, you\'re not just another customer — you\'re our priority. Every visit is an opportunity to exceed your expectations.',
      features: {
        expertise: { title: 'Proven Expertise', description: 'Professionals trained in the latest techniques' },
        time: { title: 'Respect for Your Time', description: 'Smart booking so you\'re seen right on schedule' },
        experience: { title: 'Unique Experience', description: 'Environment designed for your comfort and relaxation' },
        quality: { title: 'Guaranteed Quality', description: 'Selected products and rigorous hygiene in every service' },
      },
    },
    services: {
      title: 'Our Services',
      subtitle: 'Care that makes',
      subtitleHighlight: 'the difference',
      description: 'We offer a comprehensive range of services to take care of your image with excellence.',
      bookNow: 'Book',
      duration: 'min',
    },
    testimonials: {
      title: 'Testimonials',
      subtitle: 'Those who know us,',
      subtitleHighlight: 'recommend us',
      description: 'The opinion of those who have experienced our service is the best way to know our work.',
    },
    location: {
      title: 'Location',
      subtitle: 'Where to find us',
      address: 'Address',
      hours: 'Opening Hours',
      contact: 'Contact',
      directions: 'Get Directions',
      weekdays: 'Mon - Fri',
      saturday: 'Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      easyAccess: '📍 Easy access by tube',
    },
    cta: {
      title: 'Ready to refresh',
      titleHighlight: 'your style?',
      description: 'Book your appointment in just a few clicks and be assured of punctual, personalised service. Your experience begins before you even arrive.',
      scheduleNow: 'Book Now',
      whatsappMessage: 'Hello! I\'d like to know more about your services.',
    },
    footer: {
      quickLinks: 'Quick Links',
      contactUs: 'Contact',
      followUs: 'Follow Us',
      allRights: 'All rights reserved.',
      hours: 'Opening Hours',
      premiumService: 'Premium service with online booking for your convenience.',
    },
    common: {
      learnMore: 'Learn more',
      seeMore: 'See more',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
  },

  'es-ES': {
    nav: {
      about: 'Nosotros',
      services: 'Servicios',
      gallery: 'Galería',
      location: 'Ubicación',
      testimonials: 'Testimonios',
      contact: 'Contacto',
    },
    hero: {
      schedule: 'Reservar Cita',
      viewServices: 'Ver Servicios',
      welcome: 'Bienvenido a',
    },
    about: {
      title: 'Sobre Nosotros',
      subtitle: 'Donde la tradición encuentra',
      subtitleHighlight: 'la excelencia moderna',
      description: 'Construimos nuestra reputación cliente a cliente, corte a corte. Aquí no eres uno más — eres nuestra prioridad. Cada visita es una oportunidad para superar tus expectativas.',
      features: {
        expertise: { title: 'Experiencia Demostrada', description: 'Profesionales formados en las técnicas más actuales del mercado' },
        time: { title: 'Respeto por tu Tiempo', description: 'Citas inteligentes para que te atiendan a la hora programada' },
        experience: { title: 'Experiencia Única', description: 'Ambiente pensado para tu comodidad y relajación' },
        quality: { title: 'Calidad Garantizada', description: 'Productos seleccionados e higiene rigurosa en cada servicio' },
      },
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Cuidados que marcan',
      subtitleHighlight: 'la diferencia',
      description: 'Ofrecemos una gama completa de servicios para cuidar tu imagen con excelencia.',
      bookNow: 'Reservar',
      duration: 'min',
    },
    testimonials: {
      title: 'Testimonios',
      subtitle: 'Quien nos conoce,',
      subtitleHighlight: 'nos recomienda',
      description: 'La opinión de quienes ya han vivido la experiencia es la mejor forma de conocer nuestro trabajo.',
    },
    location: {
      title: 'Ubicación',
      subtitle: 'Dónde encontrarnos',
      address: 'Dirección',
      hours: 'Horario',
      contact: 'Contacto',
      directions: 'Cómo llegar',
      weekdays: 'Lun - Vie',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Cerrado',
      easyAccess: '📍 Fácil acceso en metro',
    },
    cta: {
      title: '¿Listo para renovar',
      titleHighlight: 'tu estilo?',
      description: 'Reserva tu cita en pocos clics y ten la seguridad de un servicio puntual y personalizado. Tu experiencia comienza antes de llegar.',
      scheduleNow: 'Reservar Ahora',
      whatsappMessage: '¡Hola! Me gustaría saber más sobre vuestros servicios.',
    },
    footer: {
      quickLinks: 'Enlaces Rápidos',
      contactUs: 'Contacto',
      followUs: 'Síguenos',
      allRights: 'Todos los derechos reservados.',
      hours: 'Horarios',
      premiumService: 'Servicio premium con reserva online para tu comodidad.',
    },
    common: {
      learnMore: 'Saber más',
      seeMore: 'Ver más',
      back: 'Volver',
      next: 'Siguiente',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
  },

  'es-MX': {
    nav: {
      about: 'Nosotros',
      services: 'Servicios',
      gallery: 'Galería',
      location: 'Ubicación',
      testimonials: 'Testimonios',
      contact: 'Contacto',
    },
    hero: {
      schedule: 'Agendar Cita',
      viewServices: 'Ver Servicios',
      welcome: 'Bienvenido a',
    },
    about: {
      title: 'Sobre Nosotros',
      subtitle: 'Donde la tradición encuentra',
      subtitleHighlight: 'la excelencia moderna',
      description: 'Construimos nuestra reputación cliente a cliente, corte a corte. Aquí no eres uno más — eres nuestra prioridad. Cada visita es una oportunidad para superar tus expectativas.',
      features: {
        expertise: { title: 'Experiencia Comprobada', description: 'Profesionales capacitados en las técnicas más actuales del mercado' },
        time: { title: 'Respeto por tu Tiempo', description: 'Agenda inteligente para que te atiendan a la hora programada' },
        experience: { title: 'Experiencia Única', description: 'Ambiente pensado para tu comodidad y relajación' },
        quality: { title: 'Calidad Garantizada', description: 'Productos seleccionados e higiene rigurosa en cada servicio' },
      },
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Cuidados que hacen',
      subtitleHighlight: 'la diferencia',
      description: 'Ofrecemos una gama completa de servicios para cuidar tu imagen con excelencia.',
      bookNow: 'Agendar',
      duration: 'min',
    },
    testimonials: {
      title: 'Testimonios',
      subtitle: 'Quien nos conoce,',
      subtitleHighlight: 'nos recomienda',
      description: 'La opinión de quienes ya han vivido la experiencia es la mejor forma de conocer nuestro trabajo.',
    },
    location: {
      title: 'Ubicación',
      subtitle: 'Dónde encontrarnos',
      address: 'Dirección',
      hours: 'Horario',
      contact: 'Contacto',
      directions: 'Cómo llegar',
      weekdays: 'Lun - Vie',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Cerrado',
      easyAccess: '📍 Fácil acceso en metro',
    },
    cta: {
      title: '¿Listo para renovar',
      titleHighlight: 'tu estilo?',
      description: 'Agenda tu cita en pocos clics y ten la seguridad de un servicio puntual y personalizado. Tu experiencia comienza antes de llegar.',
      scheduleNow: 'Agendar Ahora',
      whatsappMessage: '¡Hola! Me gustaría saber más sobre sus servicios.',
    },
    footer: {
      quickLinks: 'Enlaces Rápidos',
      contactUs: 'Contacto',
      followUs: 'Síguenos',
      allRights: 'Todos los derechos reservados.',
      hours: 'Horarios',
      premiumService: 'Servicio premium con agenda en línea para tu comodidad.',
    },
    common: {
      learnMore: 'Saber más',
      seeMore: 'Ver más',
      back: 'Regresar',
      next: 'Siguiente',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
  },

  'es-AR': {
    nav: {
      about: 'Nosotros',
      services: 'Servicios',
      gallery: 'Galería',
      location: 'Ubicación',
      testimonials: 'Testimonios',
      contact: 'Contacto',
    },
    hero: {
      schedule: 'Sacar Turno',
      viewServices: 'Ver Servicios',
      welcome: 'Bienvenido a',
    },
    about: {
      title: 'Sobre Nosotros',
      subtitle: 'Donde la tradición encuentra',
      subtitleHighlight: 'la excelencia moderna',
      description: 'Construimos nuestra reputación cliente a cliente, corte a corte. Acá no sos uno más — sos nuestra prioridad. Cada visita es una oportunidad para superar tus expectativas.',
      features: {
        expertise: { title: 'Experiencia Comprobada', description: 'Profesionales capacitados en las técnicas más actuales del mercado' },
        time: { title: 'Respeto por tu Tiempo', description: 'Turnos inteligentes para que te atiendan a la hora programada' },
        experience: { title: 'Experiencia Única', description: 'Ambiente pensado para tu comodidad y relax' },
        quality: { title: 'Calidad Garantizada', description: 'Productos seleccionados e higiene rigurosa en cada servicio' },
      },
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Cuidados que hacen',
      subtitleHighlight: 'la diferencia',
      description: 'Ofrecemos una gama completa de servicios para cuidar tu imagen con excelencia.',
      bookNow: 'Reservar',
      duration: 'min',
    },
    testimonials: {
      title: 'Testimonios',
      subtitle: 'Quien nos conoce,',
      subtitleHighlight: 'nos recomienda',
      description: 'La opinión de quienes ya vivieron la experiencia es la mejor forma de conocer nuestro laburo.',
    },
    location: {
      title: 'Ubicación',
      subtitle: 'Dónde encontrarnos',
      address: 'Dirección',
      hours: 'Horario',
      contact: 'Contacto',
      directions: 'Cómo llegar',
      weekdays: 'Lun - Vie',
      saturday: 'Sábado',
      sunday: 'Domingo',
      closed: 'Cerrado',
      easyAccess: '📍 Fácil acceso en subte',
    },
    cta: {
      title: '¿Listo para renovar',
      titleHighlight: 'tu estilo?',
      description: 'Sacá tu turno en pocos clics y tené la seguridad de un servicio puntual y personalizado. Tu experiencia empieza antes de llegar.',
      scheduleNow: 'Sacar Turno',
      whatsappMessage: '¡Hola! Me gustaría saber más sobre sus servicios.',
    },
    footer: {
      quickLinks: 'Links Rápidos',
      contactUs: 'Contacto',
      followUs: 'Seguinos',
      allRights: 'Todos los derechos reservados.',
      hours: 'Horarios',
      premiumService: 'Servicio premium con turnos online para tu comodidad.',
    },
    common: {
      learnMore: 'Saber más',
      seeMore: 'Ver más',
      back: 'Volver',
      next: 'Siguiente',
      close: 'Cerrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
  },

  'fr-FR': {
    nav: {
      about: 'À propos',
      services: 'Services',
      gallery: 'Galerie',
      location: 'Localisation',
      testimonials: 'Témoignages',
      contact: 'Contact',
    },
    hero: {
      schedule: 'Prendre Rendez-vous',
      viewServices: 'Voir les Services',
      welcome: 'Bienvenue chez',
    },
    about: {
      title: 'À Propos de Nous',
      subtitle: 'Là où la tradition rencontre',
      subtitleHighlight: "l'excellence moderne",
      description: "Nous construisons notre réputation client après client, coupe après coupe. Ici, vous n'êtes pas qu'un numéro — vous êtes notre priorité. Chaque visite est une occasion de dépasser vos attentes.",
      features: {
        expertise: { title: 'Expertise Prouvée', description: 'Professionnels formés aux techniques les plus actuelles du marché' },
        time: { title: 'Respect de Votre Temps', description: 'Prise de rendez-vous intelligente pour être servi à l\'heure' },
        experience: { title: 'Expérience Unique', description: 'Environnement conçu pour votre confort et détente' },
        quality: { title: 'Qualité Garantie', description: 'Produits sélectionnés et hygiène rigoureuse à chaque service' },
      },
    },
    services: {
      title: 'Nos Services',
      subtitle: 'Des soins qui font',
      subtitleHighlight: 'la différence',
      description: "Nous offrons une gamme complète de services pour prendre soin de votre image avec excellence.",
      bookNow: 'Réserver',
      duration: 'min',
    },
    testimonials: {
      title: 'Témoignages',
      subtitle: 'Ceux qui nous connaissent',
      subtitleHighlight: 'nous recommandent',
      description: "L'avis de ceux qui ont vécu l'expérience est la meilleure façon de découvrir notre travail.",
    },
    location: {
      title: 'Localisation',
      subtitle: 'Où nous trouver',
      address: 'Adresse',
      hours: 'Horaires',
      contact: 'Contact',
      directions: 'Itinéraire',
      weekdays: 'Lun - Ven',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      closed: 'Fermé',
      easyAccess: '📍 Accès facile en métro',
    },
    cta: {
      title: 'Prêt à renouveler',
      titleHighlight: 'votre style ?',
      description: "Réservez votre rendez-vous en quelques clics et soyez assuré d'un service ponctuel et personnalisé. Votre expérience commence avant même d'arriver.",
      scheduleNow: 'Réserver Maintenant',
      whatsappMessage: 'Bonjour ! Je souhaiterais en savoir plus sur vos services.',
    },
    footer: {
      quickLinks: 'Liens Rapides',
      contactUs: 'Contact',
      followUs: 'Suivez-nous',
      allRights: 'Tous droits réservés.',
      hours: 'Horaires',
      premiumService: 'Service premium avec réservation en ligne pour votre commodité.',
    },
    common: {
      learnMore: 'En savoir plus',
      seeMore: 'Voir plus',
      back: 'Retour',
      next: 'Suivant',
      close: 'Fermer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
  },

  'fr-CA': {
    nav: {
      about: 'À propos',
      services: 'Services',
      gallery: 'Galerie',
      location: 'Emplacement',
      testimonials: 'Témoignages',
      contact: 'Contact',
    },
    hero: {
      schedule: 'Prendre Rendez-vous',
      viewServices: 'Voir les Services',
      welcome: 'Bienvenue chez',
    },
    about: {
      title: 'À Propos de Nous',
      subtitle: 'Là où la tradition rencontre',
      subtitleHighlight: "l'excellence moderne",
      description: "On bâtit notre réputation client après client, coupe après coupe. Ici, t'es pas juste un numéro — t'es notre priorité. Chaque visite est une occasion de dépasser tes attentes.",
      features: {
        expertise: { title: 'Expertise Prouvée', description: 'Professionnels formés aux techniques les plus actuelles du marché' },
        time: { title: 'Respect de Ton Temps', description: 'Prise de rendez-vous intelligente pour être servi à l\'heure' },
        experience: { title: 'Expérience Unique', description: 'Environnement conçu pour ton confort et ta détente' },
        quality: { title: 'Qualité Garantie', description: 'Produits sélectionnés et hygiène rigoureuse à chaque service' },
      },
    },
    services: {
      title: 'Nos Services',
      subtitle: 'Des soins qui font',
      subtitleHighlight: 'la différence',
      description: "On offre une gamme complète de services pour prendre soin de ton image avec excellence.",
      bookNow: 'Réserver',
      duration: 'min',
    },
    testimonials: {
      title: 'Témoignages',
      subtitle: 'Ceux qui nous connaissent',
      subtitleHighlight: 'nous recommandent',
      description: "L'avis de ceux qui ont vécu l'expérience est la meilleure façon de découvrir notre travail.",
    },
    location: {
      title: 'Emplacement',
      subtitle: 'Où nous trouver',
      address: 'Adresse',
      hours: 'Heures',
      contact: 'Contact',
      directions: "S'y rendre",
      weekdays: 'Lun - Ven',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      closed: 'Fermé',
      easyAccess: '📍 Accès facile en métro',
    },
    cta: {
      title: 'Prêt à renouveler',
      titleHighlight: 'ton style ?',
      description: "Réserve ton rendez-vous en quelques clics pis sois assuré d'un service ponctuel et personnalisé. Ton expérience commence avant même d'arriver.",
      scheduleNow: 'Réserver Maintenant',
      whatsappMessage: 'Salut ! J\'aimerais en savoir plus sur vos services.',
    },
    footer: {
      quickLinks: 'Liens Rapides',
      contactUs: 'Contact',
      followUs: 'Suivez-nous',
      allRights: 'Tous droits réservés.',
      hours: 'Heures',
      premiumService: 'Service premium avec réservation en ligne pour ta commodité.',
    },
    common: {
      learnMore: 'En savoir plus',
      seeMore: 'Voir plus',
      back: 'Retour',
      next: 'Suivant',
      close: 'Fermer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
  },

  'de-DE': {
    nav: {
      about: 'Über uns',
      services: 'Leistungen',
      gallery: 'Galerie',
      location: 'Standort',
      testimonials: 'Bewertungen',
      contact: 'Kontakt',
    },
    hero: {
      schedule: 'Termin Buchen',
      viewServices: 'Leistungen Ansehen',
      welcome: 'Willkommen bei',
    },
    about: {
      title: 'Über Uns',
      subtitle: 'Wo Tradition auf',
      subtitleHighlight: 'moderne Exzellenz trifft',
      description: 'Wir bauen unseren Ruf Kunde für Kunde, Schnitt für Schnitt auf. Hier sind Sie nicht nur eine Nummer — Sie sind unsere Priorität. Jeder Besuch ist eine Gelegenheit, Ihre Erwartungen zu übertreffen.',
      features: {
        expertise: { title: 'Bewiesene Expertise', description: 'Fachleute, die in den aktuellsten Markttechniken geschult sind' },
        time: { title: 'Respekt für Ihre Zeit', description: 'Intelligente Terminplanung für pünktliche Bedienung' },
        experience: { title: 'Einzigartiges Erlebnis', description: 'Umgebung, die für Ihren Komfort und Ihre Entspannung konzipiert ist' },
        quality: { title: 'Garantierte Qualität', description: 'Ausgewählte Produkte und strenge Hygiene bei jedem Service' },
      },
    },
    services: {
      title: 'Unsere Leistungen',
      subtitle: 'Pflege, die den',
      subtitleHighlight: 'Unterschied macht',
      description: 'Wir bieten eine komplette Palette von Dienstleistungen, um Ihr Image mit Exzellenz zu pflegen.',
      bookNow: 'Buchen',
      duration: 'Min',
    },
    testimonials: {
      title: 'Bewertungen',
      subtitle: 'Wer uns kennt,',
      subtitleHighlight: 'empfiehlt uns',
      description: 'Die Meinung derer, die die Erfahrung gemacht haben, ist der beste Weg, unsere Arbeit kennenzulernen.',
    },
    location: {
      title: 'Standort',
      subtitle: 'Wo Sie uns finden',
      address: 'Adresse',
      hours: 'Öffnungszeiten',
      contact: 'Kontakt',
      directions: 'Anfahrt',
      weekdays: 'Mo - Fr',
      saturday: 'Samstag',
      sunday: 'Sonntag',
      closed: 'Geschlossen',
      easyAccess: '📍 Leicht erreichbar mit der U-Bahn',
    },
    cta: {
      title: 'Bereit, Ihren Stil',
      titleHighlight: 'zu erneuern?',
      description: 'Buchen Sie Ihren Termin mit nur wenigen Klicks und seien Sie sich eines pünktlichen und persönlichen Services sicher. Ihr Erlebnis beginnt, bevor Sie ankommen.',
      scheduleNow: 'Jetzt Buchen',
      whatsappMessage: 'Hallo! Ich würde gerne mehr über Ihre Dienstleistungen erfahren.',
    },
    footer: {
      quickLinks: 'Schnelllinks',
      contactUs: 'Kontakt',
      followUs: 'Folgen Sie uns',
      allRights: 'Alle Rechte vorbehalten.',
      hours: 'Öffnungszeiten',
      premiumService: 'Premium-Service mit Online-Buchung für Ihre Bequemlichkeit.',
    },
    common: {
      learnMore: 'Mehr erfahren',
      seeMore: 'Mehr sehen',
      back: 'Zurück',
      next: 'Weiter',
      close: 'Schließen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
    },
  },

  'it-IT': {
    nav: {
      about: 'Chi Siamo',
      services: 'Servizi',
      gallery: 'Galleria',
      location: 'Dove Siamo',
      testimonials: 'Recensioni',
      contact: 'Contatti',
    },
    hero: {
      schedule: 'Prenota Ora',
      viewServices: 'Scopri i Servizi',
      welcome: 'Benvenuto da',
    },
    about: {
      title: 'Chi Siamo',
      subtitle: 'Dove la tradizione incontra',
      subtitleHighlight: "l'eccellenza moderna",
      description: 'Costruiamo la nostra reputazione cliente dopo cliente, taglio dopo taglio. Qui non sei solo un numero — sei la nostra priorità. Ogni visita è un\'opportunità per superare le tue aspettative.',
      features: {
        expertise: { title: 'Esperienza Comprovata', description: 'Professionisti formati con le tecniche più attuali del mercato' },
        time: { title: 'Rispetto per il Tuo Tempo', description: 'Prenotazione intelligente per essere servito all\'orario stabilito' },
        experience: { title: 'Esperienza Unica', description: 'Ambiente pensato per il tuo comfort e relax' },
        quality: { title: 'Qualità Garantita', description: 'Prodotti selezionati e igiene rigorosa in ogni servizio' },
      },
    },
    services: {
      title: 'I Nostri Servizi',
      subtitle: 'Cure che fanno',
      subtitleHighlight: 'la differenza',
      description: 'Offriamo una gamma completa di servizi per curare la tua immagine con eccellenza.',
      bookNow: 'Prenota',
      duration: 'min',
    },
    testimonials: {
      title: 'Recensioni',
      subtitle: 'Chi ci conosce,',
      subtitleHighlight: 'ci raccomanda',
      description: "L'opinione di chi ha già vissuto l'esperienza è il modo migliore per conoscere il nostro lavoro.",
    },
    location: {
      title: 'Dove Siamo',
      subtitle: 'Come trovarci',
      address: 'Indirizzo',
      hours: 'Orari',
      contact: 'Contatti',
      directions: 'Come arrivare',
      weekdays: 'Lun - Ven',
      saturday: 'Sabato',
      sunday: 'Domenica',
      closed: 'Chiuso',
      easyAccess: '📍 Facile accesso in metro',
    },
    cta: {
      title: 'Pronto a rinnovare',
      titleHighlight: 'il tuo stile?',
      description: 'Prenota il tuo appuntamento in pochi clic e abbi la certezza di un servizio puntuale e personalizzato. La tua esperienza inizia prima ancora di arrivare.',
      scheduleNow: 'Prenota Ora',
      whatsappMessage: 'Ciao! Vorrei saperne di più sui vostri servizi.',
    },
    footer: {
      quickLinks: 'Link Rapidi',
      contactUs: 'Contatti',
      followUs: 'Seguici',
      allRights: 'Tutti i diritti riservati.',
      hours: 'Orari',
      premiumService: 'Servizio premium con prenotazione online per la tua comodità.',
    },
    common: {
      learnMore: 'Scopri di più',
      seeMore: 'Vedi altro',
      back: 'Indietro',
      next: 'Avanti',
      close: 'Chiudi',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
    },
  },

  'nl-NL': {
    nav: {
      about: 'Over ons',
      services: 'Diensten',
      gallery: 'Galerij',
      location: 'Locatie',
      testimonials: 'Recensies',
      contact: 'Contact',
    },
    hero: {
      schedule: 'Afspraak Maken',
      viewServices: 'Bekijk Diensten',
      welcome: 'Welkom bij',
    },
    about: {
      title: 'Over Ons',
      subtitle: 'Waar traditie',
      subtitleHighlight: 'moderne excellentie ontmoet',
      description: 'We bouwen onze reputatie klant na klant, knipbeurt na knipbeurt. Hier ben je niet zomaar een nummer — je bent onze prioriteit. Elk bezoek is een kans om je verwachtingen te overtreffen.',
      features: {
        expertise: { title: 'Bewezen Expertise', description: 'Professionals getraind in de nieuwste markttechnieken' },
        time: { title: 'Respect voor je Tijd', description: 'Slimme planning zodat je op tijd wordt geholpen' },
        experience: { title: 'Unieke Ervaring', description: 'Omgeving ontworpen voor je comfort en ontspanning' },
        quality: { title: 'Gegarandeerde Kwaliteit', description: 'Geselecteerde producten en strikte hygiëne bij elke service' },
      },
    },
    services: {
      title: 'Onze Diensten',
      subtitle: 'Verzorging die',
      subtitleHighlight: 'het verschil maakt',
      description: 'Wij bieden een compleet scala aan diensten om je imago met excellentie te verzorgen.',
      bookNow: 'Boeken',
      duration: 'min',
    },
    testimonials: {
      title: 'Recensies',
      subtitle: 'Wie ons kent,',
      subtitleHighlight: 'beveelt ons aan',
      description: 'De mening van wie de ervaring al heeft meegemaakt is de beste manier om ons werk te leren kennen.',
    },
    location: {
      title: 'Locatie',
      subtitle: 'Waar je ons vindt',
      address: 'Adres',
      hours: 'Openingstijden',
      contact: 'Contact',
      directions: 'Route',
      weekdays: 'Ma - Vr',
      saturday: 'Zaterdag',
      sunday: 'Zondag',
      closed: 'Gesloten',
      easyAccess: '📍 Makkelijk bereikbaar met de metro',
    },
    cta: {
      title: 'Klaar om je stijl',
      titleHighlight: 'te vernieuwen?',
      description: 'Boek je afspraak in een paar klikken en wees verzekerd van een stipte en persoonlijke service. Je ervaring begint al voordat je arriveert.',
      scheduleNow: 'Nu Boeken',
      whatsappMessage: 'Hallo! Ik zou graag meer willen weten over jullie diensten.',
    },
    footer: {
      quickLinks: 'Snelle Links',
      contactUs: 'Contact',
      followUs: 'Volg Ons',
      allRights: 'Alle rechten voorbehouden.',
      hours: 'Openingstijden',
      premiumService: 'Premium service met online boeken voor je gemak.',
    },
    common: {
      learnMore: 'Meer leren',
      seeMore: 'Meer zien',
      back: 'Terug',
      next: 'Volgende',
      close: 'Sluiten',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
    },
  },

  'ja-JP': {
    nav: {
      about: '私たちについて',
      services: 'サービス',
      gallery: 'ギャラリー',
      location: 'アクセス',
      testimonials: 'お客様の声',
      contact: 'お問い合わせ',
    },
    hero: {
      schedule: '予約する',
      viewServices: 'サービスを見る',
      welcome: 'ようこそ',
    },
    about: {
      title: '私たちについて',
      subtitle: '伝統と',
      subtitleHighlight: '現代の卓越性の融合',
      description: 'お客様一人ひとり、カット一つひとつで信頼を築いてきました。ここではあなたは単なる一人ではありません — あなたは私たちの最優先です。すべての訪問は、あなたの期待を超える機会です。',
      features: {
        expertise: { title: '実績ある専門性', description: '最新の技術でトレーニングされたプロフェッショナル' },
        time: { title: 'お時間を大切に', description: '予約時間通りにサービスを受けられるスマート予約' },
        experience: { title: 'ユニークな体験', description: '快適さとリラックスのために設計された空間' },
        quality: { title: '品質保証', description: '厳選された製品と各サービスでの徹底した衛生管理' },
      },
    },
    services: {
      title: 'サービス',
      subtitle: '違いを生む',
      subtitleHighlight: 'ケア',
      description: '卓越した技術であなたのイメージをケアする、幅広いサービスを提供しています。',
      bookNow: '予約',
      duration: '分',
    },
    testimonials: {
      title: 'お客様の声',
      subtitle: '私たちを知る人は',
      subtitleHighlight: '推薦してくれます',
      description: '経験した方の意見は、私たちの仕事を知る最良の方法です。',
    },
    location: {
      title: 'アクセス',
      subtitle: '所在地',
      address: '住所',
      hours: '営業時間',
      contact: 'お問い合わせ',
      directions: 'アクセス方法',
      weekdays: '月〜金',
      saturday: '土曜日',
      sunday: '日曜日',
      closed: '定休日',
      easyAccess: '📍 地下鉄からアクセス便利',
    },
    cta: {
      title: 'スタイルを',
      titleHighlight: '刷新する準備は？',
      description: '数クリックで予約完了。時間厳守でパーソナライズされたサービスをお約束します。体験は到着前から始まります。',
      scheduleNow: '今すぐ予約',
      whatsappMessage: 'こんにちは！サービスについて詳しく教えてください。',
    },
    footer: {
      quickLinks: 'クイックリンク',
      contactUs: 'お問い合わせ',
      followUs: 'フォローする',
      allRights: 'All rights reserved.',
      hours: '営業時間',
      premiumService: 'オンライン予約可能なプレミアムサービス。',
    },
    common: {
      learnMore: '詳しく見る',
      seeMore: 'もっと見る',
      back: '戻る',
      next: '次へ',
      close: '閉じる',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
    },
  },

  'ko-KR': {
    nav: {
      about: '소개',
      services: '서비스',
      gallery: '갤러리',
      location: '위치',
      testimonials: '후기',
      contact: '연락처',
    },
    hero: {
      schedule: '예약하기',
      viewServices: '서비스 보기',
      welcome: '환영합니다',
    },
    about: {
      title: '소개',
      subtitle: '전통과',
      subtitleHighlight: '현대적 우수함의 만남',
      description: '한 분 한 분의 고객, 하나하나의 커트로 우리의 명성을 쌓아왔습니다. 여기서 당신은 그저 한 명이 아닙니다 — 당신이 우리의 최우선입니다. 모든 방문은 기대를 뛰어넘을 기회입니다.',
      features: {
        expertise: { title: '검증된 전문성', description: '최신 시장 기술로 훈련받은 전문가' },
        time: { title: '시간 존중', description: '예약 시간에 맞춰 서비스 받을 수 있는 스마트 예약' },
        experience: { title: '특별한 경험', description: '편안함과 휴식을 위해 설계된 환경' },
        quality: { title: '품질 보장', description: '엄선된 제품과 철저한 위생 관리' },
      },
    },
    services: {
      title: '서비스',
      subtitle: '차이를 만드는',
      subtitleHighlight: '케어',
      description: '탁월한 기술로 이미지를 관리하는 다양한 서비스를 제공합니다.',
      bookNow: '예약',
      duration: '분',
    },
    testimonials: {
      title: '후기',
      subtitle: '우리를 아는 분들은',
      subtitleHighlight: '추천합니다',
      description: '경험하신 분들의 의견이 우리 작업을 아는 가장 좋은 방법입니다.',
    },
    location: {
      title: '위치',
      subtitle: '찾아오시는 길',
      address: '주소',
      hours: '영업시간',
      contact: '연락처',
      directions: '오시는 길',
      weekdays: '월 - 금',
      saturday: '토요일',
      sunday: '일요일',
      closed: '휴무',
      easyAccess: '📍 지하철로 쉽게 접근 가능',
    },
    cta: {
      title: '스타일을',
      titleHighlight: '새롭게 할 준비가 되셨나요?',
      description: '몇 번의 클릭으로 예약하고 시간 엄수와 맞춤 서비스를 보장받으세요. 도착 전부터 경험이 시작됩니다.',
      scheduleNow: '지금 예약',
      whatsappMessage: '안녕하세요! 서비스에 대해 더 알고 싶습니다.',
    },
    footer: {
      quickLinks: '빠른 링크',
      contactUs: '연락처',
      followUs: '팔로우',
      allRights: '모든 권리 보유.',
      hours: '영업시간',
      premiumService: '편의를 위한 온라인 예약이 가능한 프리미엄 서비스.',
    },
    common: {
      learnMore: '더 알아보기',
      seeMore: '더 보기',
      back: '뒤로',
      next: '다음',
      close: '닫기',
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
    },
  },

  'zh-CN': {
    nav: {
      about: '关于我们',
      services: '服务项目',
      gallery: '作品展示',
      location: '门店位置',
      testimonials: '客户评价',
      contact: '联系我们',
    },
    hero: {
      schedule: '立即预约',
      viewServices: '查看服务',
      welcome: '欢迎光临',
    },
    about: {
      title: '关于我们',
      subtitle: '传统与',
      subtitleHighlight: '现代卓越的融合',
      description: '我们一位一位客户、一个一个造型地建立我们的声誉。在这里，您不只是普通客户——您是我们的首要关注。每一次造访都是超越您期望的机会。',
      features: {
        expertise: { title: '专业实力', description: '掌握市场最新技术的专业团队' },
        time: { title: '尊重您的时间', description: '智能预约系统确保准时服务' },
        experience: { title: '独特体验', description: '为您的舒适和放松而设计的环境' },
        quality: { title: '品质保证', description: '精选产品和每次服务的严格卫生标准' },
      },
    },
    services: {
      title: '服务项目',
      subtitle: '与众不同的',
      subtitleHighlight: '护理体验',
      description: '我们提供全方位的服务，以卓越品质打造您的形象。',
      bookNow: '预约',
      duration: '分钟',
    },
    testimonials: {
      title: '客户评价',
      subtitle: '了解我们的人',
      subtitleHighlight: '都在推荐我们',
      description: '体验过的客户的意见是了解我们工作的最好方式。',
    },
    location: {
      title: '门店位置',
      subtitle: '如何找到我们',
      address: '地址',
      hours: '营业时间',
      contact: '联系方式',
      directions: '导航',
      weekdays: '周一至周五',
      saturday: '周六',
      sunday: '周日',
      closed: '休息',
      easyAccess: '📍 地铁可直达',
    },
    cta: {
      title: '准备好',
      titleHighlight: '焕新您的造型了吗？',
      description: '只需几步即可完成预约，享受准时且个性化的服务。您的体验从踏入门前就已开始。',
      scheduleNow: '立即预约',
      whatsappMessage: '您好！我想了解更多关于您的服务。',
    },
    footer: {
      quickLinks: '快速链接',
      contactUs: '联系我们',
      followUs: '关注我们',
      allRights: '版权所有。',
      hours: '营业时间',
      premiumService: '在线预约的高端服务，为您带来便利。',
    },
    common: {
      learnMore: '了解更多',
      seeMore: '查看更多',
      back: '返回',
      next: '下一步',
      close: '关闭',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
  },

  'ar-SA': {
    nav: {
      about: 'عنا',
      services: 'الخدمات',
      gallery: 'المعرض',
      location: 'الموقع',
      testimonials: 'آراء العملاء',
      contact: 'اتصل بنا',
    },
    hero: {
      schedule: 'احجز الآن',
      viewServices: 'عرض الخدمات',
      welcome: 'مرحباً بك في',
    },
    about: {
      title: 'من نحن',
      subtitle: 'حيث يلتقي التراث',
      subtitleHighlight: 'بالتميز الحديث',
      description: 'نبني سمعتنا عميلاً تلو الآخر، قصة شعر تلو الأخرى. هنا أنت لست مجرد رقم — أنت أولويتنا. كل زيارة هي فرصة لتجاوز توقعاتك.',
      features: {
        expertise: { title: 'خبرة مثبتة', description: 'محترفون مدربون على أحدث تقنيات السوق' },
        time: { title: 'احترام وقتك', description: 'حجز ذكي لخدمتك في الوقت المحدد' },
        experience: { title: 'تجربة فريدة', description: 'بيئة مصممة لراحتك واسترخائك' },
        quality: { title: 'جودة مضمونة', description: 'منتجات مختارة ونظافة صارمة في كل خدمة' },
      },
    },
    services: {
      title: 'خدماتنا',
      subtitle: 'عناية تصنع',
      subtitleHighlight: 'الفرق',
      description: 'نقدم مجموعة كاملة من الخدمات للعناية بمظهرك بامتياز.',
      bookNow: 'احجز',
      duration: 'دقيقة',
    },
    testimonials: {
      title: 'آراء العملاء',
      subtitle: 'من يعرفنا',
      subtitleHighlight: 'يوصي بنا',
      description: 'رأي من عاش التجربة هو أفضل طريقة لمعرفة عملنا.',
    },
    location: {
      title: 'الموقع',
      subtitle: 'أين تجدنا',
      address: 'العنوان',
      hours: 'ساعات العمل',
      contact: 'اتصل بنا',
      directions: 'كيفية الوصول',
      weekdays: 'الإثنين - الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
      closed: 'مغلق',
      easyAccess: '📍 سهولة الوصول بالمترو',
    },
    cta: {
      title: 'هل أنت مستعد',
      titleHighlight: 'لتجديد أسلوبك؟',
      description: 'احجز موعدك بنقرات قليلة واضمن خدمة دقيقة وشخصية. تجربتك تبدأ قبل وصولك.',
      scheduleNow: 'احجز الآن',
      whatsappMessage: 'مرحباً! أود معرفة المزيد عن خدماتكم.',
    },
    footer: {
      quickLinks: 'روابط سريعة',
      contactUs: 'اتصل بنا',
      followUs: 'تابعنا',
      allRights: 'جميع الحقوق محفوظة.',
      hours: 'ساعات العمل',
      premiumService: 'خدمة متميزة مع حجز عبر الإنترنت لراحتك.',
    },
    common: {
      learnMore: 'اعرف المزيد',
      seeMore: 'شاهد المزيد',
      back: 'رجوع',
      next: 'التالي',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
    },
  },

  'ru-RU': {
    nav: {
      about: 'О нас',
      services: 'Услуги',
      gallery: 'Галерея',
      location: 'Расположение',
      testimonials: 'Отзывы',
      contact: 'Контакты',
    },
    hero: {
      schedule: 'Записаться',
      viewServices: 'Смотреть услуги',
      welcome: 'Добро пожаловать в',
    },
    about: {
      title: 'О Нас',
      subtitle: 'Где традиции встречаются',
      subtitleHighlight: 'с современным совершенством',
      description: 'Мы строим нашу репутацию клиент за клиентом, стрижка за стрижкой. Здесь вы не просто очередной посетитель — вы наш приоритет. Каждый визит — это возможность превзойти ваши ожидания.',
      features: {
        expertise: { title: 'Проверенная экспертиза', description: 'Профессионалы, обученные новейшим рыночным техникам' },
        time: { title: 'Уважение к вашему времени', description: 'Умная запись для обслуживания точно в назначенное время' },
        experience: { title: 'Уникальный опыт', description: 'Атмосфера, созданная для вашего комфорта и расслабления' },
        quality: { title: 'Гарантированное качество', description: 'Отобранные продукты и строгая гигиена при каждом обслуживании' },
      },
    },
    services: {
      title: 'Наши Услуги',
      subtitle: 'Уход, который делает',
      subtitleHighlight: 'разницу',
      description: 'Мы предлагаем полный спектр услуг для ухода за вашим имиджем с превосходным качеством.',
      bookNow: 'Записаться',
      duration: 'мин',
    },
    testimonials: {
      title: 'Отзывы',
      subtitle: 'Кто нас знает —',
      subtitleHighlight: 'рекомендует',
      description: 'Мнение тех, кто уже испытал наш сервис — лучший способ узнать о нашей работе.',
    },
    location: {
      title: 'Расположение',
      subtitle: 'Где нас найти',
      address: 'Адрес',
      hours: 'Часы работы',
      contact: 'Контакты',
      directions: 'Как добраться',
      weekdays: 'Пн - Пт',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
      closed: 'Закрыто',
      easyAccess: '📍 Удобный доступ на метро',
    },
    cta: {
      title: 'Готовы обновить',
      titleHighlight: 'свой стиль?',
      description: 'Запишитесь за несколько кликов и будьте уверены в пунктуальном и персонализированном обслуживании. Ваш опыт начинается ещё до прихода.',
      scheduleNow: 'Записаться сейчас',
      whatsappMessage: 'Здравствуйте! Хотел бы узнать больше о ваших услугах.',
    },
    footer: {
      quickLinks: 'Быстрые ссылки',
      contactUs: 'Контакты',
      followUs: 'Подписывайтесь',
      allRights: 'Все права защищены.',
      hours: 'Часы работы',
      premiumService: 'Премиум-сервис с онлайн-записью для вашего удобства.',
    },
    common: {
      learnMore: 'Узнать больше',
      seeMore: 'Смотреть ещё',
      back: 'Назад',
      next: 'Далее',
      close: 'Закрыть',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
    },
  },

  'tr-TR': {
    nav: {
      about: 'Hakkımızda',
      services: 'Hizmetler',
      gallery: 'Galeri',
      location: 'Konum',
      testimonials: 'Yorumlar',
      contact: 'İletişim',
    },
    hero: {
      schedule: 'Randevu Al',
      viewServices: 'Hizmetleri Gör',
      welcome: 'Hoş geldiniz',
    },
    about: {
      title: 'Hakkımızda',
      subtitle: 'Geleneğin',
      subtitleHighlight: 'modern mükemmellikle buluştuğu yer',
      description: 'İtibarımızı müşteri müşteri, kesim kesim inşa ediyoruz. Burada sıradan biri değilsiniz — siz önceliğimizsiniz. Her ziyaret, beklentilerinizi aşmak için bir fırsat.',
      features: {
        expertise: { title: 'Kanıtlanmış Uzmanlık', description: 'En güncel pazar teknikleriyle eğitilmiş profesyoneller' },
        time: { title: 'Zamanınıza Saygı', description: 'Zamanında hizmet için akıllı randevu sistemi' },
        experience: { title: 'Eşsiz Deneyim', description: 'Konforunuz ve rahatlığınız için tasarlanmış ortam' },
        quality: { title: 'Garantili Kalite', description: 'Her hizmette seçilmiş ürünler ve titiz hijyen' },
      },
    },
    services: {
      title: 'Hizmetlerimiz',
      subtitle: 'Fark yaratan',
      subtitleHighlight: 'bakım',
      description: 'İmajınıza mükemmel bir şekilde bakmak için kapsamlı hizmetler sunuyoruz.',
      bookNow: 'Rezervasyon',
      duration: 'dk',
    },
    testimonials: {
      title: 'Yorumlar',
      subtitle: 'Bizi tanıyanlar',
      subtitleHighlight: 'tavsiye eder',
      description: 'Deneyimi yaşayanların görüşü, işimizi tanımanın en iyi yoludur.',
    },
    location: {
      title: 'Konum',
      subtitle: 'Bizi nerede bulabilirsiniz',
      address: 'Adres',
      hours: 'Çalışma Saatleri',
      contact: 'İletişim',
      directions: 'Yol Tarifi',
      weekdays: 'Pzt - Cum',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
      closed: 'Kapalı',
      easyAccess: '📍 Metroyla kolay erişim',
    },
    cta: {
      title: 'Tarzınızı',
      titleHighlight: 'yenilemeye hazır mısınız?',
      description: 'Birkaç tıklamayla randevunuzu alın ve dakik, kişiselleştirilmiş hizmetten emin olun. Deneyiminiz daha gelmeden başlar.',
      scheduleNow: 'Şimdi Randevu Al',
      whatsappMessage: 'Merhaba! Hizmetleriniz hakkında daha fazla bilgi almak istiyorum.',
    },
    footer: {
      quickLinks: 'Hızlı Bağlantılar',
      contactUs: 'İletişim',
      followUs: 'Bizi Takip Edin',
      allRights: 'Tüm hakları saklıdır.',
      hours: 'Çalışma Saatleri',
      premiumService: 'Kolaylığınız için online rezervasyonlu premium hizmet.',
    },
    common: {
      learnMore: 'Daha fazla bilgi',
      seeMore: 'Daha fazla gör',
      back: 'Geri',
      next: 'İleri',
      close: 'Kapat',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
    },
  },

  'hi-IN': {
    nav: {
      about: 'हमारे बारे में',
      services: 'सेवाएं',
      gallery: 'गैलरी',
      location: 'स्थान',
      testimonials: 'प्रशंसापत्र',
      contact: 'संपर्क करें',
    },
    hero: {
      schedule: 'अपॉइंटमेंट बुक करें',
      viewServices: 'सेवाएं देखें',
      welcome: 'स्वागत है',
    },
    about: {
      title: 'हमारे बारे में',
      subtitle: 'जहाँ परंपरा',
      subtitleHighlight: 'आधुनिक उत्कृष्टता से मिलती है',
      description: 'हम एक-एक ग्राहक, एक-एक कट से अपनी प्रतिष्ठा बनाते हैं। यहाँ आप सिर्फ एक नंबर नहीं हैं — आप हमारी प्राथमिकता हैं। हर विज़िट आपकी उम्मीदों से आगे जाने का मौका है।',
      features: {
        expertise: { title: 'प्रमाणित विशेषज्ञता', description: 'नवीनतम तकनीकों में प्रशिक्षित पेशेवर' },
        time: { title: 'आपके समय का सम्मान', description: 'समय पर सेवा के लिए स्मार्ट बुकिंग' },
        experience: { title: 'अनूठा अनुभव', description: 'आपके आराम और विश्राम के लिए डिज़ाइन किया गया माहौल' },
        quality: { title: 'गारंटीड गुणवत्ता', description: 'चुनिंदा उत्पाद और हर सेवा में कड़ी स्वच्छता' },
      },
    },
    services: {
      title: 'हमारी सेवाएं',
      subtitle: 'देखभाल जो',
      subtitleHighlight: 'फर्क करती है',
      description: 'हम आपकी छवि की उत्कृष्ट देखभाल के लिए पूर्ण सेवाएं प्रदान करते हैं।',
      bookNow: 'बुक करें',
      duration: 'मिनट',
    },
    testimonials: {
      title: 'प्रशंसापत्र',
      subtitle: 'जो हमें जानते हैं',
      subtitleHighlight: 'सिफारिश करते हैं',
      description: 'अनुभव करने वालों की राय हमारे काम को जानने का सबसे अच्छा तरीका है।',
    },
    location: {
      title: 'स्थान',
      subtitle: 'हमें कहाँ खोजें',
      address: 'पता',
      hours: 'समय',
      contact: 'संपर्क',
      directions: 'रास्ता',
      weekdays: 'सोम - शुक्र',
      saturday: 'शनिवार',
      sunday: 'रविवार',
      closed: 'बंद',
      easyAccess: '📍 मेट्रो से आसान पहुंच',
    },
    cta: {
      title: 'अपनी स्टाइल',
      titleHighlight: 'रिफ्रेश करने के लिए तैयार?',
      description: 'कुछ ही क्लिक में अपॉइंटमेंट बुक करें और समय पर, व्यक्तिगत सेवा का आश्वासन पाएं। आपका अनुभव आने से पहले ही शुरू हो जाता है।',
      scheduleNow: 'अभी बुक करें',
      whatsappMessage: 'नमस्ते! मुझे आपकी सेवाओं के बारे में और जानना है।',
    },
    footer: {
      quickLinks: 'त्वरित लिंक',
      contactUs: 'संपर्क करें',
      followUs: 'फॉलो करें',
      allRights: 'सर्वाधिकार सुरक्षित।',
      hours: 'समय',
      premiumService: 'आपकी सुविधा के लिए ऑनलाइन बुकिंग के साथ प्रीमियम सेवा।',
    },
    common: {
      learnMore: 'और जानें',
      seeMore: 'और देखें',
      back: 'वापस',
      next: 'आगे',
      close: 'बंद करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
    },
  },
};

// Helper function to get translations for a language
export function getTranslations(languageCode: string): TemplateTranslations {
  // Try exact match first
  if (translations[languageCode]) {
    return translations[languageCode];
  }
  
  // Try base language (e.g., 'es' from 'es-CO')
  const baseLanguage = languageCode.split('-')[0];
  const baseMatch = Object.keys(translations).find(key => key.startsWith(baseLanguage));
  if (baseMatch) {
    return translations[baseMatch];
  }
  
  // Default to Portuguese Brazil
  return translations['pt-BR'];
}

// Get language info by code
export function getLanguageInfo(code: string) {
  return AVAILABLE_LANGUAGES_EXTENDED.find(lang => lang.code === code);
}
