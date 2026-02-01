import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface Translations {
  [key: string]: {
    'pt-BR': string;
    'en-US': string;
    'es-ES': string;
  };
}

// Core translations for the gym app
const translations: Translations = {
  // Settings Page
  settings: { 'pt-BR': 'Configurações', 'en-US': 'Settings', 'es-ES': 'Configuración' },
  customize_experience: { 'pt-BR': 'Personalize sua experiência', 'en-US': 'Customize your experience', 'es-ES': 'Personaliza tu experiencia' },
  install_app: { 'pt-BR': 'Instalar App', 'en-US': 'Install App', 'es-ES': 'Instalar App' },
  notifications: { 'pt-BR': 'Notificações', 'en-US': 'Notifications', 'es-ES': 'Notificaciones' },
  sounds: { 'pt-BR': 'Sons', 'en-US': 'Sounds', 'es-ES': 'Sonidos' },
  dark_mode: { 'pt-BR': 'Modo Escuro', 'en-US': 'Dark Mode', 'es-ES': 'Modo Oscuro' },
  language: { 'pt-BR': 'Idioma', 'en-US': 'Language', 'es-ES': 'Idioma' },
  privacy: { 'pt-BR': 'Privacidade', 'en-US': 'Privacy', 'es-ES': 'Privacidad' },
  help_support: { 'pt-BR': 'Ajuda e Suporte', 'en-US': 'Help & Support', 'es-ES': 'Ayuda y Soporte' },
  about_app: { 'pt-BR': 'Sobre o App', 'en-US': 'About App', 'es-ES': 'Sobre la App' },
  preferences: { 'pt-BR': 'Preferências', 'en-US': 'Preferences', 'es-ES': 'Preferencias' },
  general: { 'pt-BR': 'Geral', 'en-US': 'General', 'es-ES': 'General' },
  
  // Navigation
  home: { 'pt-BR': 'Início', 'en-US': 'Home', 'es-ES': 'Inicio' },
  workouts: { 'pt-BR': 'Treinos', 'en-US': 'Workouts', 'es-ES': 'Entrenamientos' },
  classes: { 'pt-BR': 'Aulas', 'en-US': 'Classes', 'es-ES': 'Clases' },
  evolution: { 'pt-BR': 'Evolução', 'en-US': 'Progress', 'es-ES': 'Progreso' },
  profile: { 'pt-BR': 'Perfil', 'en-US': 'Profile', 'es-ES': 'Perfil' },
  my_plan: { 'pt-BR': 'Meu Plano', 'en-US': 'My Plan', 'es-ES': 'Mi Plan' },
  
  // Common
  save: { 'pt-BR': 'Salvar', 'en-US': 'Save', 'es-ES': 'Guardar' },
  cancel: { 'pt-BR': 'Cancelar', 'en-US': 'Cancel', 'es-ES': 'Cancelar' },
  confirm: { 'pt-BR': 'Confirmar', 'en-US': 'Confirm', 'es-ES': 'Confirmar' },
  loading: { 'pt-BR': 'Carregando...', 'en-US': 'Loading...', 'es-ES': 'Cargando...' },
  error: { 'pt-BR': 'Erro', 'en-US': 'Error', 'es-ES': 'Error' },
  success: { 'pt-BR': 'Sucesso', 'en-US': 'Success', 'es-ES': 'Éxito' },
  
  // Check-in
  check_in: { 'pt-BR': 'Check-in', 'en-US': 'Check-in', 'es-ES': 'Check-in' },
  scan_qr: { 'pt-BR': 'Escanear QR Code', 'en-US': 'Scan QR Code', 'es-ES': 'Escanear QR Code' },
  check_in_success: { 'pt-BR': 'Check-in realizado!', 'en-US': 'Check-in successful!', 'es-ES': '¡Check-in exitoso!' },
  already_checked_in: { 'pt-BR': 'Você já fez check-in hoje!', 'en-US': 'You already checked in today!', 'es-ES': '¡Ya hiciste check-in hoy!' },
  
  // Workout
  start_workout: { 'pt-BR': 'Iniciar Treino', 'en-US': 'Start Workout', 'es-ES': 'Iniciar Entrenamiento' },
  finish_workout: { 'pt-BR': 'Finalizar Treino', 'en-US': 'Finish Workout', 'es-ES': 'Finalizar Entrenamiento' },
  rest_time: { 'pt-BR': 'Tempo de Descanso', 'en-US': 'Rest Time', 'es-ES': 'Tiempo de Descanso' },
  sets: { 'pt-BR': 'Séries', 'en-US': 'Sets', 'es-ES': 'Series' },
  reps: { 'pt-BR': 'Repetições', 'en-US': 'Reps', 'es-ES': 'Repeticiones' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    const saved = localStorage.getItem('gym_app_language') as Language;
    if (saved && ['pt-BR', 'en-US', 'es-ES'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gym_app_language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang.split('-')[0];
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation['pt-BR'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
