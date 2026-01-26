import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  city: string;
  countryCode: string;
  niche: string;
  maxResults?: number;
  affiliateName?: string;
}

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  generatedMessage?: string;
}

// Country configuration for search
const COUNTRY_CONFIG: Record<string, { gl: string; hl: string; phonePrefix: string; lang: string }> = {
  BR: { gl: 'br', hl: 'pt-br', phonePrefix: '55', lang: 'pt-BR' },
  US: { gl: 'us', hl: 'en', phonePrefix: '1', lang: 'en' },
  PT: { gl: 'pt', hl: 'pt-pt', phonePrefix: '351', lang: 'pt-PT' },
  ES: { gl: 'es', hl: 'es', phonePrefix: '34', lang: 'es' },
  MX: { gl: 'mx', hl: 'es', phonePrefix: '52', lang: 'es-MX' },
  AR: { gl: 'ar', hl: 'es', phonePrefix: '54', lang: 'es-AR' },
  CO: { gl: 'co', hl: 'es', phonePrefix: '57', lang: 'es' },
  CL: { gl: 'cl', hl: 'es', phonePrefix: '56', lang: 'es' },
  PE: { gl: 'pe', hl: 'es', phonePrefix: '51', lang: 'es' },
  UK: { gl: 'uk', hl: 'en', phonePrefix: '44', lang: 'en-UK' },
  DE: { gl: 'de', hl: 'de', phonePrefix: '49', lang: 'de' },
  FR: { gl: 'fr', hl: 'fr', phonePrefix: '33', lang: 'fr' },
  IT: { gl: 'it', hl: 'it', phonePrefix: '39', lang: 'it' },
  CA: { gl: 'ca', hl: 'en', phonePrefix: '1', lang: 'en' },
  AU: { gl: 'au', hl: 'en', phonePrefix: '61', lang: 'en' },
  JP: { gl: 'jp', hl: 'ja', phonePrefix: '81', lang: 'ja' },
};

// Search query templates per language
const SEARCH_TEMPLATES: Record<string, string> = {
  'pt-br': '{niche} em {city}',
  'pt-pt': '{niche} em {city}',
  'es': '{niche} en {city}',
  'en': '{niche} in {city}',
  'de': '{niche} in {city}',
  'fr': '{niche} à {city}',
  'it': '{niche} a {city}',
  'ja': '{city} {niche}',
};

// Links por nicho - CADA NICHO TEM SEU LINK ESPECÍFICO
const NICHE_LINKS: Record<string, string> = {
  'barbearia': 'https://genesishub.cloud/barbearia/ogim2u',
  'academia': 'https://genesishub.cloud/academia',
  'salao': 'https://genesishub.cloud/salao',
  'clinica': 'https://genesishub.cloud/clinica',
  'clinica-estetica': 'https://genesishub.cloud/clinica-estetica',
  'dentista': 'https://genesishub.cloud/dentista',
  'restaurante': 'https://genesishub.cloud/restaurante',
  'petshop': 'https://genesishub.cloud/petshop',
  'default': 'https://genesishub.cloud/barbearia/ogim2u',
};

// Message templates per language/region - ADAPTADAS automaticamente COM variações anti-ban
const MESSAGE_TEMPLATES: Record<string, { base: string; variations: string[] }> = {
  'pt-BR': {
    base: `Olá, tudo bem? 👋

Me chamo {NOME}.
Trabalho ajudando negócios locais a transformar visitas em contactos reais,
através de sites profissionais e automação de atendimento.

Atualmente implementamos soluções como:
✨ Site profissional focado em conversão
📅 Agendamento online automático
💬 Integração direta com WhatsApp

Essa estrutura organiza o atendimento, evita a perda de potenciais clientes
e aumenta a taxa de conversão sem necessidade de ampliar a equipa.

Posso lhe mostrar como funciona na prática.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Oi, tudo bem? 👋

Sou {NOME}, especialista em soluções digitais para negócios locais.

Atuo ajudando estabelecimentos a captar mais clientes através de:
✨ Sites otimizados para conversão
📅 Sistema de agendamento 24h
💬 Automação de WhatsApp

Tudo integrado para funcionar automaticamente enquanto você foca no seu negócio.

Veja na prática como funciona:
🔗 Link: {DEMO_LINK}`,
      `Olá! 👋

Aqui é {NOME}. Trabalho transformando a presença digital de negócios locais.

Nossas soluções incluem:
✨ Website profissional que converte
📅 Agendamento online integrado
💬 Atendimento automático no WhatsApp

Isso elimina perda de clientes e organiza seu atendimento.

Confira o sistema funcionando:
🔗 Link: {DEMO_LINK}`,
      `Oi, tudo certo? 👋

Me chamo {NOME} e ajudo empresas a ter presença digital profissional.

O que oferecemos:
✨ Site focado em trazer clientes
📅 Sistema de agendamento automático
💬 Integração com WhatsApp

Sem ampliar equipe, você atende mais e melhor.

Olha como funciona:
🔗 Link: {DEMO_LINK}`,
      `E aí, beleza? 👋

{NOME} aqui! Trabalho com automação comercial pra negócios locais.

Entrego:
✨ Site profissional moderno
📅 Agendamento online integrado
💬 WhatsApp automatizado

Sua empresa atendendo 24h sem você precisar estar lá.

Dá uma olhada:
🔗 Link: {DEMO_LINK}`,
      `Bom dia! 👋

Sou {NOME}, especialista em presença digital para negócios.

Meu trabalho é ajudar você a:
✨ Ter um site que realmente converte
📅 Automatizar seus agendamentos
💬 Integrar tudo ao WhatsApp

Menos trabalho manual, mais resultados.

Veja o demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'pt-PT': {
    base: `Olá, tudo bem? 👋

Me chamo {NOME}.
Trabalho ajudando negócios locais a transformar visitas em contactos reais,
através de sites profissionais e automação de atendimento.

Atualmente implementamos soluções como:
✨ Site profissional focado em conversão
📅 Agendamento online automático
💬 Integração direta com WhatsApp

Essa estrutura organiza o atendimento, evita a perda de potenciais clientes
e aumenta a taxa de conversão sem necessidade de ampliar a equipa.

Posso lhe mostrar como funciona na prática.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Oi, tudo bem? 👋

Sou {NOME}, especialista em soluções digitais para negócios locais.

Atuo ajudando estabelecimentos a captar mais clientes através de:
✨ Sites otimizados para conversão
📅 Sistema de agendamento 24h
💬 Automação de WhatsApp

Tudo integrado para funcionar automaticamente enquanto foca no seu negócio.

Veja na prática como funciona:
🔗 Link: {DEMO_LINK}`,
      `Olá! 👋

Aqui é {NOME}. Trabalho transformando a presença digital de negócios locais.

Nossas soluções incluem:
✨ Website profissional que converte
📅 Agendamento online integrado
💬 Atendimento automático no WhatsApp

Isso elimina perda de clientes e organiza o atendimento.

Confira o sistema funcionando:
🔗 Link: {DEMO_LINK}`,
      `Oi, tudo certo? 👋

Me chamo {NOME} e ajudo empresas a ter presença digital profissional.

O que oferecemos:
✨ Site focado em trazer clientes
📅 Sistema de agendamento automático
💬 Integração com WhatsApp

Sem ampliar equipe, atende mais e melhor.

Olha como funciona:
🔗 Link: {DEMO_LINK}`,
      `E aí, beleza? 👋

{NOME} aqui! Trabalho com automação comercial para negócios locais.

Entrego:
✨ Site profissional moderno
📅 Agendamento online integrado
💬 WhatsApp automatizado

A sua empresa a atender 24h sem precisar estar lá.

Dê uma olhada:
🔗 Link: {DEMO_LINK}`,
      `Bom dia! 👋

Sou {NOME}, especialista em presença digital para negócios.

O meu trabalho é ajudá-lo a:
✨ Ter um site que realmente converte
📅 Automatizar agendamentos
💬 Integrar tudo ao WhatsApp

Menos trabalho manual, mais resultados.

Veja a demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'es': {
    base: `¡Hola! 👋

Me llamo {NOME}.
Trabajo ayudando negocios locales a convertir visitas en contactos reales,
a través de sitios profesionales y automatización de atención.

Actualmente implementamos soluciones como:
✨ Sitio web profesional enfocado en conversión
📅 Citas online automáticas
💬 Integración directa con WhatsApp

Esta estructura organiza la atención, evita perder clientes potenciales
y aumenta la tasa de conversión sin necesidad de ampliar el equipo.

Puedo mostrarle cómo funciona en la práctica.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `¡Hola, qué tal! 👋

Soy {NOME}, especialista en soluciones digitales para negocios locales.

Ayudo a establecimientos a captar más clientes mediante:
✨ Sitios optimizados para conversión
📅 Sistema de citas 24h
💬 Automatización de WhatsApp

Todo integrado para funcionar automáticamente mientras te enfocas en tu negocio.

Mira cómo funciona en la práctica:
🔗 Link: {DEMO_LINK}`,
      `¡Hola! 👋

Aquí {NOME}. Trabajo transformando la presencia digital de negocios locales.

Nuestras soluciones incluyen:
✨ Website profesional que convierte
📅 Citas online integradas
💬 Atención automática en WhatsApp

Esto elimina la pérdida de clientes y organiza tu atención.

Mira el sistema funcionando:
🔗 Link: {DEMO_LINK}`,
      `¡Hola, cómo estás! 👋

Me llamo {NOME} y ayudo a empresas a tener presencia digital profesional.

Lo que ofrecemos:
✨ Sitio enfocado en atraer clientes
📅 Sistema de citas automático
💬 Integración con WhatsApp

Sin ampliar equipo, atiendes más y mejor.

Mira cómo funciona:
🔗 Link: {DEMO_LINK}`,
      `¡Buen día! 👋

Soy {NOME}, especialista en presencia digital para negocios.

Mi trabajo es ayudarte a:
✨ Tener un sitio que realmente convierte
📅 Automatizar tus citas
💬 Integrar todo a WhatsApp

Menos trabajo manual, más resultados.

Mira la demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'es-MX': {
    base: `¡Hola! 👋

Me llamo {NOME}.
Trabajo ayudando negocios locales a convertir visitas en contactos reales,
con sitios profesionales y automatización de atención.

Implementamos soluciones como:
✨ Sitio web profesional enfocado en conversión
📅 Citas online automáticas
💬 Integración directa con WhatsApp

Esta estructura organiza la atención, evita perder clientes potenciales
y aumenta tu conversión sin ampliar el equipo.

Te puedo mostrar cómo funciona.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `¡Qué onda! 👋

Soy {NOME}, especialista en soluciones digitales para negocios locales.

Ayudo a establecimientos a conseguir más clientes con:
✨ Sitios optimizados para conversión
📅 Sistema de citas 24h
💬 Automatización de WhatsApp

Todo integrado para que funcione solo mientras tú te concentras en tu negocio.

Checa cómo funciona:
🔗 Link: {DEMO_LINK}`,
      `¡Hola! 👋

Aquí {NOME}. Trabajo transformando la presencia digital de negocios locales.

Nuestras soluciones incluyen:
✨ Website profesional que convierte
📅 Citas en línea integradas
💬 Atención automática en WhatsApp

Esto elimina la pérdida de clientes y organiza tu atención.

Mira el sistema funcionando:
🔗 Link: {DEMO_LINK}`,
      `¡Hola, qué tal! 👋

Me llamo {NOME} y ayudo a empresas a tener presencia digital profesional.

Lo que ofrecemos:
✨ Sitio enfocado en atraer clientes
📅 Sistema de citas automático
💬 Integración con WhatsApp

Sin ampliar equipo, atiendes más y mejor.

Checa cómo funciona:
🔗 Link: {DEMO_LINK}`,
      `¡Buen día! 👋

Soy {NOME}, especialista en presencia digital para negocios.

Mi trabajo es ayudarte a:
✨ Tener un sitio que realmente convierte
📅 Automatizar tus citas
💬 Integrar todo a WhatsApp

Menos trabajo manual, más resultados.

Mira la demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'es-AR': {
    base: `¡Hola! 👋

Me llamo {NOME}.
Laburo ayudando negocios locales a convertir visitas en contactos reales,
con sitios profesionales y automatización de atención.

Actualmente implementamos soluciones como:
✨ Sitio web profesional enfocado en conversión
📅 Turnos online automáticos
💬 Integración directa con WhatsApp

Esta estructura organiza la atención, evita perder clientes potenciales
y aumenta tu conversión sin agrandar el equipo.

Te puedo mostrar cómo funciona en la práctica.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `¿Qué tal? 👋

Soy {NOME}, especialista en soluciones digitales para negocios locales.

Ayudo a locales a conseguir más clientes con:
✨ Sitios optimizados para conversión
📅 Sistema de turnos 24h
💬 Automatización de WhatsApp

Todo integrado para que funcione solo mientras vos te enfocás en tu negocio.

Mirá cómo funciona:
🔗 Link: {DEMO_LINK}`,
      `¡Hola! 👋

Acá {NOME}. Laburo transformando la presencia digital de negocios locales.

Nuestras soluciones incluyen:
✨ Website profesional que convierte
📅 Turnos online integrados
💬 Atención automática en WhatsApp

Esto elimina la pérdida de clientes y organiza tu atención.

Mirá el sistema funcionando:
🔗 Link: {DEMO_LINK}`,
      `¿Cómo andás? 👋

Me llamo {NOME} y ayudo a empresas a tener presencia digital profesional.

Lo que ofrecemos:
✨ Sitio enfocado en atraer clientes
📅 Sistema de turnos automático
💬 Integración con WhatsApp

Sin agrandar equipo, atendés más y mejor.

Mirá cómo funciona:
🔗 Link: {DEMO_LINK}`,
      `¡Buen día! 👋

Soy {NOME}, especialista en presencia digital para negocios.

Mi trabajo es ayudarte a:
✨ Tener un sitio que realmente convierte
📅 Automatizar tus turnos
💬 Integrar todo a WhatsApp

Menos laburo manual, más resultados.

Mirá la demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'en': {
    base: `Hello! 👋

My name is {NOME}.
I help local businesses turn visitors into real contacts
through professional websites and customer service automation.

We currently implement solutions like:
✨ Professional website focused on conversion
📅 Automatic online scheduling
💬 Direct WhatsApp integration

This structure organizes your customer service, prevents losing potential clients
and increases conversion rate without expanding your team.

I can show you how it works in practice.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Hi there! 👋

I'm {NOME}, specialist in digital solutions for local businesses.

I help establishments get more customers through:
✨ Conversion-optimized websites
📅 24/7 scheduling system
💬 WhatsApp automation

Everything integrated to work automatically while you focus on your business.

See how it works in practice:
🔗 Link: {DEMO_LINK}`,
      `Hello! 👋

This is {NOME}. I work transforming the digital presence of local businesses.

Our solutions include:
✨ Professional website that converts
📅 Integrated online scheduling
💬 Automatic WhatsApp support

This eliminates losing customers and organizes your service.

Check out the system working:
🔗 Link: {DEMO_LINK}`,
      `Hi! 👋

My name is {NOME} and I help businesses have a professional digital presence.

What we offer:
✨ Website focused on bringing customers
📅 Automatic scheduling system
💬 WhatsApp integration

Without expanding your team, you serve more and better.

See how it works:
🔗 Link: {DEMO_LINK}`,
      `Good day! 👋

I'm {NOME}, specialist in digital presence for businesses.

My job is to help you:
✨ Have a website that really converts
📅 Automate your scheduling
💬 Integrate everything with WhatsApp

Less manual work, more results.

Check out the demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'en-UK': {
    base: `Hello! 👋

My name is {NOME}.
I help local businesses turn visitors into real contacts
through professional websites and customer service automation.

We currently implement solutions like:
✨ Professional website focused on conversion
📅 Automatic online booking
💬 Direct WhatsApp integration

This structure organises your customer service, prevents losing potential clients
and increases conversion rate without expanding your team.

I can show you how it works in practice.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Hi there! 👋

I'm {NOME}, specialist in digital solutions for local businesses.

I help establishments get more customers through:
✨ Conversion-optimised websites
📅 24/7 booking system
💬 WhatsApp automation

Everything integrated to work automatically whilst you focus on your business.

See how it works in practice:
🔗 Link: {DEMO_LINK}`,
      `Hello! 👋

This is {NOME}. I work transforming the digital presence of local businesses.

Our solutions include:
✨ Professional website that converts
📅 Integrated online booking
💬 Automatic WhatsApp support

This eliminates losing customers and organises your service.

Check out the system working:
🔗 Link: {DEMO_LINK}`,
      `Hi! 👋

My name is {NOME} and I help businesses have a professional digital presence.

What we offer:
✨ Website focused on bringing customers
📅 Automatic booking system
💬 WhatsApp integration

Without expanding your team, you serve more and better.

See how it works:
🔗 Link: {DEMO_LINK}`,
      `Good day! 👋

I'm {NOME}, specialist in digital presence for businesses.

My job is to help you:
✨ Have a website that really converts
📅 Automate your bookings
💬 Integrate everything with WhatsApp

Less manual work, more results.

Have a look at the demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'de': {
    base: `Hallo! 👋

Mein Name ist {NOME}.
Ich helfe lokalen Unternehmen, Besucher in echte Kontakte umzuwandeln,
durch professionelle Websites und Automatisierung des Kundenservice.

Wir implementieren aktuell Lösungen wie:
✨ Professionelle Website mit Fokus auf Konversion
📅 Automatische Online-Terminbuchung
💬 Direkte WhatsApp-Integration

Diese Struktur organisiert Ihren Kundenservice, verhindert den Verlust potenzieller Kunden
und erhöht die Konversionsrate ohne Ihr Team zu erweitern.

Ich kann Ihnen zeigen, wie es in der Praxis funktioniert.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Guten Tag! 👋

Ich bin {NOME}, Spezialist für digitale Lösungen für lokale Unternehmen.

Ich helfe Geschäften, mehr Kunden zu gewinnen durch:
✨ Für Konversion optimierte Websites
📅 24/7 Buchungssystem
💬 WhatsApp-Automatisierung

Alles integriert, um automatisch zu funktionieren, während Sie sich auf Ihr Geschäft konzentrieren.

Sehen Sie, wie es in der Praxis funktioniert:
🔗 Link: {DEMO_LINK}`,
      `Hallo! 👋

Hier ist {NOME}. Ich arbeite an der digitalen Transformation lokaler Unternehmen.

Unsere Lösungen umfassen:
✨ Professionelle Website, die konvertiert
📅 Integrierte Online-Terminbuchung
💬 Automatischer WhatsApp-Support

Dies eliminiert Kundenverluste und organisiert Ihren Service.

Sehen Sie das System in Aktion:
🔗 Link: {DEMO_LINK}`,
      `Hi! 👋

Mein Name ist {NOME} und ich helfe Unternehmen, eine professionelle digitale Präsenz aufzubauen.

Was wir bieten:
✨ Website mit Fokus auf Kundengewinnung
📅 Automatisches Buchungssystem
💬 WhatsApp-Integration

Ohne Ihr Team zu erweitern, bedienen Sie mehr und besser.

Sehen Sie, wie es funktioniert:
🔗 Link: {DEMO_LINK}`,
      `Guten Tag! 👋

Ich bin {NOME}, Spezialist für digitale Präsenz für Unternehmen.

Meine Aufgabe ist es, Ihnen zu helfen:
✨ Eine Website zu haben, die wirklich konvertiert
📅 Ihre Termine zu automatisieren
💬 Alles mit WhatsApp zu integrieren

Weniger manuelle Arbeit, mehr Ergebnisse.

Schauen Sie sich die Demo an:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'fr': {
    base: `Bonjour ! 👋

Je m'appelle {NOME}.
J'aide les entreprises locales à transformer les visiteurs en contacts réels,
grâce à des sites professionnels et à l'automatisation du service client.

Nous mettons actuellement en œuvre des solutions telles que :
✨ Site web professionnel axé sur la conversion
📅 Prise de rendez-vous en ligne automatique
💬 Intégration directe WhatsApp

Cette structure organise votre service client, évite de perdre des clients potentiels
et augmente le taux de conversion sans agrandir votre équipe.

Je peux vous montrer comment ça fonctionne en pratique.
🔗 Lien : {DEMO_LINK}`,
    variations: [
      `Salut ! 👋

Je suis {NOME}, spécialiste en solutions digitales pour les entreprises locales.

J'aide les établissements à obtenir plus de clients grâce à :
✨ Sites optimisés pour la conversion
📅 Système de réservation 24h/24
💬 Automatisation WhatsApp

Tout est intégré pour fonctionner automatiquement pendant que vous vous concentrez sur votre activité.

Voyez comment ça fonctionne :
🔗 Lien : {DEMO_LINK}`,
      `Bonjour ! 👋

Ici {NOME}. Je travaille à transformer la présence digitale des entreprises locales.

Nos solutions incluent :
✨ Site web professionnel qui convertit
📅 Réservation en ligne intégrée
💬 Support WhatsApp automatique

Cela élimine la perte de clients et organise votre service.

Regardez le système en action :
🔗 Lien : {DEMO_LINK}`,
      `Coucou ! 👋

Je m'appelle {NOME} et j'aide les entreprises à avoir une présence digitale professionnelle.

Ce que nous offrons :
✨ Site axé sur l'acquisition de clients
📅 Système de rendez-vous automatique
💬 Intégration WhatsApp

Sans agrandir votre équipe, vous servez plus et mieux.

Voyez comment ça marche :
🔗 Lien : {DEMO_LINK}`,
      `Bonne journée ! 👋

Je suis {NOME}, spécialiste en présence digitale pour les entreprises.

Mon travail est de vous aider à :
✨ Avoir un site qui convertit vraiment
📅 Automatiser vos rendez-vous
💬 Tout intégrer à WhatsApp

Moins de travail manuel, plus de résultats.

Regardez la démo :
🔗 Lien : {DEMO_LINK}`,
    ]
  },

  'it': {
    base: `Ciao! 👋

Mi chiamo {NOME}.
Aiuto le attività locali a trasformare i visitatori in contatti reali,
attraverso siti professionali e automazione del servizio clienti.

Attualmente implementiamo soluzioni come:
✨ Sito web professionale focalizzato sulla conversione
📅 Prenotazioni online automatiche
💬 Integrazione diretta con WhatsApp

Questa struttura organizza il tuo servizio clienti, evita di perdere potenziali clienti
e aumenta il tasso di conversione senza espandere il team.

Posso mostrarti come funziona nella pratica.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Salve! 👋

Sono {NOME}, specialista in soluzioni digitali per attività locali.

Aiuto gli esercizi a ottenere più clienti attraverso:
✨ Siti ottimizzati per la conversione
📅 Sistema di prenotazione 24/7
💬 Automazione WhatsApp

Tutto integrato per funzionare automaticamente mentre ti concentri sulla tua attività.

Guarda come funziona nella pratica:
🔗 Link: {DEMO_LINK}`,
      `Ciao! 👋

Qui {NOME}. Lavoro trasformando la presenza digitale delle attività locali.

Le nostre soluzioni includono:
✨ Sito web professionale che converte
📅 Prenotazioni online integrate
💬 Supporto WhatsApp automatico

Questo elimina la perdita di clienti e organizza il tuo servizio.

Guarda il sistema in azione:
🔗 Link: {DEMO_LINK}`,
      `Ciao! 👋

Mi chiamo {NOME} e aiuto le aziende ad avere una presenza digitale professionale.

Cosa offriamo:
✨ Sito focalizzato sull'acquisizione clienti
📅 Sistema di prenotazione automatico
💬 Integrazione WhatsApp

Senza espandere il team, servi di più e meglio.

Guarda come funziona:
🔗 Link: {DEMO_LINK}`,
      `Buongiorno! 👋

Sono {NOME}, specialista in presenza digitale per le aziende.

Il mio lavoro è aiutarti a:
✨ Avere un sito che converte davvero
📅 Automatizzare le tue prenotazioni
💬 Integrare tutto con WhatsApp

Meno lavoro manuale, più risultati.

Guarda la demo:
🔗 Link: {DEMO_LINK}`,
    ]
  },

  'ja': {
    base: `こんにちは！👋

{NOME}と申します。
プロフェッショナルなウェブサイトと顧客サービスの自動化を通じて、
地元企業が訪問者を実際の連絡先に変えるお手伝いをしています。

現在、以下のようなソリューションを実装しています：
✨ コンバージョン重視のプロフェッショナルなウェブサイト
📅 自動オンライン予約
💬 WhatsAppとの直接連携

この仕組みにより、顧客サービスを整理し、潜在顧客の流出を防ぎ、
チームを拡大することなくコンバージョン率を向上させます。

実際にどのように機能するかお見せできます。
🔗 リンク: {DEMO_LINK}`,
    variations: [
      `はじめまして！👋

{NOME}です。地元ビジネス向けのデジタルソリューションを専門としています。

以下を通じてお客様獲得をサポートします：
✨ コンバージョン最適化サイト
📅 24時間予約システム
💬 WhatsApp自動化

すべてが統合されて自動で動くので、ビジネスに集中できます。

実際の動作をご覧ください：
🔗 リンク: {DEMO_LINK}`,
      `こんにちは！👋

{NOME}です。地元ビジネスのデジタルプレゼンスを変革しています。

ソリューション内容：
✨ コンバージョンするプロサイト
📅 統合オンライン予約
💬 WhatsApp自動サポート

顧客の流出を防ぎ、サービスを整理します。

システムの動作をご確認ください：
🔗 リンク: {DEMO_LINK}`,
      `こんにちは！👋

{NOME}と申します。企業のプロフェッショナルなデジタルプレゼンスをお手伝いします。

提供内容：
✨ 集客に特化したサイト
📅 自動予約システム
💬 WhatsApp連携

チーム拡大なしで、より多く、より良いサービスを。

動作をご確認ください：
🔗 リンク: {DEMO_LINK}`,
      `おはようございます！👋

{NOME}です。企業向けデジタルプレゼンスの専門家です。

お手伝いできること：
✨ 本当にコンバージョンするサイト
📅 予約の自動化
💬 すべてをWhatsAppと統合

手作業を減らし、結果を増やす。

デモをご覧ください：
🔗 リンク: {DEMO_LINK}`,
    ]
  },
};

const DEFAULT_DEMO_LINK = 'https://genesishub.cloud/barbearia/ogim2u';

function getNicheLinkFromCategory(category: string): string {
  // Tenta encontrar o link do nicho baseado na categoria
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('barb') || categoryLower.includes('cabelo') || categoryLower.includes('hair')) {
    return NICHE_LINKS['barbearia'];
  }
  if (categoryLower.includes('acad') || categoryLower.includes('gym') || categoryLower.includes('fitness') || categoryLower.includes('crossfit')) {
    return NICHE_LINKS['academia'];
  }
  if (categoryLower.includes('salão') || categoryLower.includes('salon') || categoryLower.includes('beleza') || categoryLower.includes('beauty')) {
    return NICHE_LINKS['salao'];
  }
  if (categoryLower.includes('clínic') || categoryLower.includes('clinic') || categoryLower.includes('médic') || categoryLower.includes('medic')) {
    return NICHE_LINKS['clinica'];
  }
  if (categoryLower.includes('dent') || categoryLower.includes('odont')) {
    return NICHE_LINKS['dentista'];
  }
  if (categoryLower.includes('restaur') || categoryLower.includes('food') || categoryLower.includes('comida')) {
    return NICHE_LINKS['restaurante'];
  }
  if (categoryLower.includes('pet') || categoryLower.includes('vet') || categoryLower.includes('animal')) {
    return NICHE_LINKS['petshop'];
  }
  
  return NICHE_LINKS['default'];
}

function adaptMessage(templateConfig: { base: string; variations: string[] }, affiliateName: string, businessName: string, category?: string): string {
  // Escolhe aleatoriamente entre base e variações para evitar ban do WhatsApp
  const allTemplates = [templateConfig.base, ...templateConfig.variations];
  const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  
  // Pega o link apropriado para o nicho
  const demoLink = getNicheLinkFromCategory(category || '');
  
  return randomTemplate
    .replace(/{NOME}/g, affiliateName)
    .replace(/{EMPRESA}/g, businessName)
    .replace(/{DEMO_LINK}/g, demoLink);
}

// Extended interface to include affiliateId
interface SearchRequestWithAffiliate extends SearchRequest {
  affiliateId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SearchRequestWithAffiliate = await req.json();
    const { city, countryCode, niche, maxResults: requestedMax, affiliateName, affiliateId } = body;

    if (!city || !countryCode || !niche) {
      return new Response(
        JSON.stringify({ success: false, error: 'City, country and niche are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('SERPER_API_KEY');
    if (!apiKey) {
      console.error('SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Search API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get country config, default to US
    const config = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG['US'];
    
    // Extract state abbreviation from city (e.g., "Senador Pompeu, CE" -> "CE")
    const cityParts = city.split(',').map((p: string) => p.trim());
    const cityName = cityParts[0];
    const stateAbbr = cityParts[1] || ''; // Estado (sigla)
    
    // Build search query based on language - include state for precision
    const template = SEARCH_TEMPLATES[config.hl] || SEARCH_TEMPLATES['en'];
    const searchLocation = stateAbbr ? `${cityName}, ${stateAbbr}` : cityName;
    const searchQuery = template
      .replace('{niche}', niche)
      .replace('{city}', searchLocation);

    console.log(`Global search: "${searchQuery}" in ${countryCode} (${config.gl}/${config.hl}), state filter: "${stateAbbr}"`);

    // Get message template for this country
    const messageTemplate = MESSAGE_TEMPLATES[config.lang] || MESSAGE_TEMPLATES['en'];
    const consultantName = affiliateName || 'Consultor Genesis';

    // FAST SEARCH: limit to 50 results to filter by state
    const maxResults = Math.min(50, Math.max(10, requestedMax || 50));

    const searchResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: config.gl,
        hl: config.hl,
        num: maxResults,
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Serper error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Search error: ${searchResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    const places = searchData.places || [];
    console.log(`Found ${places.length} raw results`);

    // State abbreviation mappings for Brazil (for validation)
    const BRAZILIAN_STATE_ABBRS: Record<string, string[]> = {
      'CE': ['ce', 'ceará', 'ceara', 'fortaleza'],
      'SP': ['sp', 'são paulo', 'sao paulo'],
      'RJ': ['rj', 'rio de janeiro'],
      'MG': ['mg', 'minas gerais', 'belo horizonte'],
      'BA': ['ba', 'bahia', 'salvador'],
      'RS': ['rs', 'rio grande do sul', 'porto alegre'],
      'PR': ['pr', 'paraná', 'parana', 'curitiba'],
      'SC': ['sc', 'santa catarina', 'florianópolis'],
      'PE': ['pe', 'pernambuco', 'recife'],
      'GO': ['go', 'goiás', 'goias', 'goiânia'],
      'PA': ['pa', 'pará', 'para', 'belém'],
      'MA': ['ma', 'maranhão', 'maranhao', 'são luís'],
      'AM': ['am', 'amazonas', 'manaus'],
      'ES': ['es', 'espírito santo', 'espirito santo', 'vitória'],
      'PB': ['pb', 'paraíba', 'paraiba', 'joão pessoa'],
      'RN': ['rn', 'rio grande do norte', 'natal'],
      'AL': ['al', 'alagoas', 'maceió'],
      'PI': ['pi', 'piauí', 'piaui', 'teresina'],
      'MT': ['mt', 'mato grosso', 'cuiabá'],
      'MS': ['ms', 'mato grosso do sul', 'campo grande'],
      'DF': ['df', 'distrito federal', 'brasília', 'brasilia'],
      'SE': ['se', 'sergipe', 'aracaju'],
      'RO': ['ro', 'rondônia', 'rondonia', 'porto velho'],
      'TO': ['to', 'tocantins', 'palmas'],
      'AC': ['ac', 'acre', 'rio branco'],
      'AP': ['ap', 'amapá', 'amapa', 'macapá'],
      'RR': ['rr', 'roraima', 'boa vista'],
    };

    // Function to check if address matches the requested state
    function addressMatchesState(address: string, requestedState: string): boolean {
      if (!requestedState || countryCode !== 'BR') return true; // Only filter for Brazil
      
      const addrLower = address.toLowerCase();
      const stateUpper = requestedState.toUpperCase();
      
      // Direct match with state abbreviation
      if (addrLower.includes(` - ${stateUpper.toLowerCase()}`) ||
          addrLower.includes(`, ${stateUpper.toLowerCase()}`) ||
          addrLower.includes(` ${stateUpper.toLowerCase()},`) ||
          addrLower.endsWith(` ${stateUpper.toLowerCase()}`) ||
          addrLower.endsWith(`, ${stateUpper.toLowerCase()}`)) {
        return true;
      }
      
      // Check using state keywords
      const stateKeywords = BRAZILIAN_STATE_ABBRS[stateUpper];
      if (stateKeywords) {
        for (const keyword of stateKeywords) {
          if (addrLower.includes(keyword)) {
            return true;
          }
        }
      }
      
      // Check if address contains a DIFFERENT state (reject if so)
      for (const [abbr, keywords] of Object.entries(BRAZILIAN_STATE_ABBRS)) {
        if (abbr === stateUpper) continue; // Skip the requested state
        
        // Check if address ends with or contains another state abbreviation clearly
        const abbrLower = abbr.toLowerCase();
        if (addrLower.includes(` - ${abbrLower}`) ||
            addrLower.endsWith(`, ${abbrLower}`) ||
            addrLower.endsWith(` ${abbrLower}`)) {
          console.log(`Rejected: "${address}" - matches different state ${abbr}`);
          return false;
        }
      }
      
      return true; // If uncertain, include it
    }

    // Deduplicate, FILTER BY STATE, and process results WITH messages adapted
    const seen = new Set<string>();
    const results: BusinessResult[] = places
      .map((place: any) => {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || city;
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) return null;
        if (seen.has(key)) return null;
        
        // CRITICAL: Filter by state to ensure precision
        if (!addressMatchesState(address, stateAbbr)) {
          return null;
        }
        
        seen.add(key);

        // Extract email from various sources
        const email = extractEmail(place);

        // ADAPT MESSAGE INSTANTLY (no AI call) - passa categoria para link correto
        const category = place.category || niche;
        const generatedMessage = adaptMessage(messageTemplate, consultantName, name, category);

        return {
          name,
          address,
          phone: extractPhone(place.phoneNumber || place.phone || '', config.phonePrefix),
          email,
          website: extractDomain(place.website || ''),
          rating: place.rating ? parseFloat(place.rating) : undefined,
          reviews_count: place.reviewsCount || place.reviews || undefined,
          category: place.category || niche,
          place_id: placeId || undefined,
          latitude: place.latitude ?? place.gps_coordinates?.latitude ?? undefined,
          longitude: place.longitude ?? place.gps_coordinates?.longitude ?? undefined,
          generatedMessage,
        } as BusinessResult;
      })
      .filter((r: BusinessResult | null): r is BusinessResult => !!r);

    console.log(`Final results with messages: ${results.length}`);

    // Salvar histórico de pesquisa COM try-catch robusto
    if (affiliateId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('genesis_users')
          .select('id, name, email')
          .eq('id', affiliateId)
          .single();

        if (userError) {
          console.log(`⚠️ User not found for affiliateId ${affiliateId}`);
        }

        const historyRecord = {
          user_id: affiliateId,
          user_name: userData?.name || consultantName,
          user_email: userData?.email || '',
          search_type: 'global_prospecting',
          search_query: searchQuery,
          city: cityName,
          state: stateAbbr || countryCode,
          niche: niche,
          results_count: results.length,
          credits_used: 1
        };

        console.log('📝 Salvando histórico global:', JSON.stringify(historyRecord));

        const { error: historyError } = await supabase
          .from('genesis_search_history')
          .insert(historyRecord);
        
        if (historyError) {
          console.error('❌ Erro ao salvar histórico global:', historyError.message, historyError.details);
        } else {
          console.log(`✅ Histórico global salvo: ${results.length} resultados para ${userData?.name || affiliateId}`);
        }
      } catch (historyException) {
        console.error('❌ Exceção ao salvar histórico:', historyException);
      }
    } else {
      console.log('⚠️ affiliateId não fornecido, histórico não será salvo');
    }

    return new Response(
      JSON.stringify({ success: true, results, countryCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractEmail(place: any): string | undefined {
  if (place.email) return place.email;
  
  const textToSearch = [
    place.description || '',
    place.additionalInfo || '',
    place.snippet || '',
  ].join(' ');
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = textToSearch.match(emailRegex);
  
  if (matches && matches.length > 0) {
    return matches[0].toLowerCase();
  }
  
  return undefined;
}

function extractPhone(phone: string, prefix: string): string | undefined {
  if (!phone) return undefined;
  
  const cleaned = phone.replace(/[^\d()+\s-]/g, '').trim();
  const digits = cleaned.replace(/\D/g, '');
  
  if (digits.length >= 8 && digits.length <= 15) {
    return cleaned;
  }
  
  return undefined;
}

function extractDomain(url: string): string | undefined {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
