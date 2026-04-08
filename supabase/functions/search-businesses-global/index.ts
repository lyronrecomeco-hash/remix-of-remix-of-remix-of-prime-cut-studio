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
const COUNTRY_CONFIG: Record<string, { gl: string; hl: string; phonePrefix: string; lang: string; countryName: string }> = {
  BR: { gl: 'br', hl: 'pt-br', phonePrefix: '55', lang: 'pt-BR', countryName: 'Brasil' },
  US: { gl: 'us', hl: 'en', phonePrefix: '1', lang: 'en', countryName: 'United States' },
  PT: { gl: 'pt', hl: 'pt-pt', phonePrefix: '351', lang: 'pt-PT', countryName: 'Portugal' },
  ES: { gl: 'es', hl: 'es', phonePrefix: '34', lang: 'es', countryName: 'España' },
  MX: { gl: 'mx', hl: 'es', phonePrefix: '52', lang: 'es-MX', countryName: 'México' },
  AR: { gl: 'ar', hl: 'es', phonePrefix: '54', lang: 'es-AR', countryName: 'Argentina' },
  CO: { gl: 'co', hl: 'es', phonePrefix: '57', lang: 'es', countryName: 'Colombia' },
  CL: { gl: 'cl', hl: 'es', phonePrefix: '56', lang: 'es', countryName: 'Chile' },
  PE: { gl: 'pe', hl: 'es', phonePrefix: '51', lang: 'es', countryName: 'Perú' },
  UK: { gl: 'uk', hl: 'en', phonePrefix: '44', lang: 'en-UK', countryName: 'United Kingdom' },
  DE: { gl: 'de', hl: 'de', phonePrefix: '49', lang: 'de', countryName: 'Deutschland' },
  FR: { gl: 'fr', hl: 'fr', phonePrefix: '33', lang: 'fr', countryName: 'France' },
  IT: { gl: 'it', hl: 'it', phonePrefix: '39', lang: 'it', countryName: 'Italia' },
  CA: { gl: 'ca', hl: 'en', phonePrefix: '1', lang: 'en', countryName: 'Canada' },
  AU: { gl: 'au', hl: 'en', phonePrefix: '61', lang: 'en', countryName: 'Australia' },
  JP: { gl: 'jp', hl: 'ja', phonePrefix: '81', lang: 'ja', countryName: '日本' },
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

interface SearchCandidate {
  query: string;
  hl: string;
  useLocation: boolean;
}

interface NicheLocalization {
  canonicalKey: string | null;
  localizedTerms: string[];
  exactTerms: string[];
  keywordTerms: string[];
}

interface LocalizedNicheDefinition {
  aliases: string[];
  english: string[];
  localized: Partial<Record<string, string[]>>;
}

const LOCALIZED_NICHE_TERMS: Record<string, LocalizedNicheDefinition> = {
  barbearia: {
    aliases: ['barbearia', 'barbeiro', 'barber shop', 'barbershop', 'barberia', 'barbería', 'barbier', 'barbiere', 'herrenfriseur', '理髪店'],
    english: ['barbershop', 'barber shop'],
    localized: {
      BR: ['barbearia', 'barbeiro'],
      PT: ['barbearia', 'barbeiro'],
      ES: ['barbería', 'peluquería de caballero'],
      MX: ['barbería', 'estética masculina'],
      AR: ['barbería', 'peluquería masculina'],
      CO: ['barbería', 'peluquería masculina'],
      CL: ['barbería', 'peluquería masculina'],
      PE: ['barbería', 'peluquería masculina'],
      US: ['barbershop', 'barber shop'],
      UK: ['barbershop', 'barber shop'],
      CA: ['barbershop', 'barber shop'],
      AU: ['barbershop', 'barber shop'],
      DE: ['barbershop', 'herrenfriseur'],
      FR: ['barbier', 'barbershop'],
      IT: ['barbiere', 'barbershop'],
      JP: ['理髪店', 'バーバー'],
    },
  },
  salao: {
    aliases: ['salão de beleza', 'salao de beleza', 'salão', 'salao', 'cabeleireiro', 'hair salon', 'beauty salon', 'hairdresser', 'peluqueria', 'peluquería', 'salon de coiffure', 'parrucchiere', '美容院'],
    english: ['hair salon', 'beauty salon'],
    localized: {
      BR: ['salão de beleza', 'cabeleireiro'],
      PT: ['cabeleireiro', 'salão de beleza'],
      ES: ['peluquería', 'salón de belleza'],
      MX: ['estética', 'salón de belleza'],
      AR: ['peluquería', 'salón de belleza'],
      CO: ['peluquería', 'salón de belleza'],
      CL: ['peluquería', 'salón de belleza'],
      PE: ['peluquería', 'salón de belleza'],
      US: ['hair salon', 'beauty salon'],
      UK: ['hair salon', 'beauty salon'],
      CA: ['hair salon', 'beauty salon'],
      AU: ['hair salon', 'beauty salon'],
      DE: ['friseursalon', 'beauty salon'],
      FR: ['salon de coiffure', 'institut de beauté'],
      IT: ['parrucchiere', 'salone di bellezza'],
      JP: ['美容院', 'ヘアサロン'],
    },
  },
  clinica: {
    aliases: ['clínica', 'clinica', 'medical clinic', 'medical centre', 'cabinet médical', 'studio medico', 'arztpraxis', 'consultorio', 'consultório', 'クリニック'],
    english: ['medical clinic', 'medical centre'],
    localized: {
      BR: ['clínica médica', 'consultório médico'],
      PT: ['clínica médica', 'consultório médico'],
      ES: ['clínica médica', 'centro médico'],
      MX: ['clínica médica', 'consultorio médico'],
      AR: ['clínica médica', 'consultorio médico'],
      CO: ['clínica médica', 'consultorio médico'],
      CL: ['clínica médica', 'centro médico'],
      PE: ['clínica médica', 'consultorio médico'],
      US: ['medical clinic', 'medical centre'],
      UK: ['medical clinic', 'medical centre'],
      CA: ['medical clinic', 'medical centre'],
      AU: ['medical centre', 'medical clinic'],
      DE: ['arztpraxis', 'medizinisches zentrum'],
      FR: ['cabinet médical', 'centre médical'],
      IT: ['studio medico', 'centro medico'],
      JP: ['クリニック', '医院'],
    },
  },
  dentista: {
    aliases: ['dentista', 'clínica odontológica', 'clinica odontologica', 'dental clinic', 'dental practice', 'consultorio dental', 'clinica dental', 'zahnarzt', 'cabinet dentaire', 'studio dentistico', '歯科医院'],
    english: ['dental clinic', 'dentist'],
    localized: {
      BR: ['dentista', 'clínica odontológica'],
      PT: ['clínica dentária', 'dentista'],
      ES: ['clínica dental', 'dentista'],
      MX: ['consultorio dental', 'dentista'],
      AR: ['consultorio odontológico', 'dentista'],
      CO: ['consultorio odontológico', 'dentista'],
      CL: ['clínica dental', 'dentista'],
      PE: ['consultorio dental', 'dentista'],
      US: ['dental clinic', 'dentist'],
      UK: ['dental practice', 'dentist'],
      CA: ['dental clinic', 'dentist'],
      AU: ['dental clinic', 'dentist'],
      DE: ['zahnarzt', 'zahnklinik'],
      FR: ['cabinet dentaire', 'dentiste'],
      IT: ['studio dentistico', 'dentista'],
      JP: ['歯科医院', '歯医者'],
    },
  },
  academia: {
    aliases: ['academia', 'gym', 'fitness', 'ginásio', 'ginasio', 'gimnasio', 'fitnessstudio', 'salle de sport', 'palestra', 'ジム'],
    english: ['gym', 'fitness gym'],
    localized: {
      BR: ['academia', 'academia de musculação'],
      PT: ['ginásio', 'academia'],
      ES: ['gimnasio', 'centro fitness'],
      MX: ['gimnasio', 'fitness'],
      AR: ['gimnasio', 'fitness'],
      CO: ['gimnasio', 'fitness'],
      CL: ['gimnasio', 'fitness'],
      PE: ['gimnasio', 'fitness'],
      US: ['gym', 'fitness gym'],
      UK: ['gym', 'fitness centre'],
      CA: ['gym', 'fitness gym'],
      AU: ['gym', 'fitness centre'],
      DE: ['fitnessstudio', 'gym'],
      FR: ['salle de sport', 'fitness'],
      IT: ['palestra', 'fitness'],
      JP: ['ジム', 'フィットネスジム'],
    },
  },
  restaurante: {
    aliases: ['restaurante', 'restaurant', 'ristorante', 'restaurateur', 'レストラン'],
    english: ['restaurant'],
    localized: {
      BR: ['restaurante'],
      PT: ['restaurante'],
      ES: ['restaurante'],
      MX: ['restaurante'],
      AR: ['restaurante'],
      CO: ['restaurante'],
      CL: ['restaurante'],
      PE: ['restaurante'],
      US: ['restaurant'],
      UK: ['restaurant'],
      CA: ['restaurant'],
      AU: ['restaurant'],
      DE: ['restaurant'],
      FR: ['restaurant'],
      IT: ['ristorante'],
      JP: ['レストラン'],
    },
  },
  petshop: {
    aliases: ['pet shop', 'petshop', 'pet store', 'animalerie', 'tienda de mascotas', 'pet store grooming', '動物病院'],
    english: ['pet shop', 'pet store'],
    localized: {
      BR: ['pet shop', 'clínica veterinária'],
      PT: ['pet shop', 'clínica veterinária'],
      ES: ['tienda de mascotas', 'veterinaria'],
      MX: ['veterinaria', 'tienda de mascotas'],
      AR: ['pet shop', 'veterinaria'],
      CO: ['veterinaria', 'tienda de mascotas'],
      CL: ['veterinaria', 'tienda de mascotas'],
      PE: ['veterinaria', 'tienda de mascotas'],
      US: ['pet shop', 'pet store'],
      UK: ['pet shop', 'veterinary clinic'],
      CA: ['pet store', 'veterinary clinic'],
      AU: ['pet shop', 'vet clinic'],
      DE: ['tierhandlung', 'tierarzt'],
      FR: ['animalerie', 'vétérinaire'],
      IT: ['negozio di animali', 'veterinario'],
      JP: ['ペットショップ', '動物病院'],
    },
  },
  mecanica: {
    aliases: ['oficina mecânica', 'oficina mecanica', 'oficina automóvel', 'oficina automovel', 'taller mecánico', 'taller mecanico', 'auto repair', 'mechanic', 'autowerkstatt', 'garage automobile', 'officina meccanica', '自動車修理'],
    english: ['auto repair shop', 'mechanic'],
    localized: {
      BR: ['oficina mecânica', 'auto center'],
      PT: ['oficina automóvel', 'mecânico'],
      ES: ['taller mecánico', 'taller'],
      MX: ['taller mecánico', 'taller'],
      AR: ['taller mecánico', 'taller'],
      CO: ['taller mecánico', 'taller'],
      CL: ['taller mecánico', 'taller'],
      PE: ['taller mecánico', 'taller'],
      US: ['auto repair shop', 'mechanic'],
      UK: ['car garage', 'mechanic'],
      CA: ['auto repair', 'mechanic'],
      AU: ['mechanic', 'auto repair'],
      DE: ['autowerkstatt', 'kfz werkstatt'],
      FR: ['garage automobile', 'mécanicien'],
      IT: ['officina meccanica', 'meccanico'],
      JP: ['自動車修理', '整備工場'],
    },
  },
  contabilidade: {
    aliases: ['contabilidade', 'contador', 'accounting', 'accountant', 'accounting firm', 'asesoría contable', 'estudio contable', 'steuerberater', 'cabinet comptable', 'commercialista', '会計事務所'],
    english: ['accounting firm', 'accountant'],
    localized: {
      BR: ['contabilidade', 'escritório contábil'],
      PT: ['contabilidade', 'gabinete de contabilidade'],
      ES: ['asesoría contable', 'contabilidad'],
      MX: ['despacho contable', 'contabilidad'],
      AR: ['estudio contable', 'contabilidad'],
      CO: ['contabilidad', 'asesoría contable'],
      CL: ['contabilidad', 'asesoría contable'],
      PE: ['contabilidad', 'asesoría contable'],
      US: ['accounting firm', 'accountant'],
      UK: ['accountancy firm', 'accountant'],
      CA: ['accounting firm', 'accountant'],
      AU: ['accountant', 'accounting firm'],
      DE: ['steuerberater', 'buchhaltung'],
      FR: ['cabinet comptable', 'expert comptable'],
      IT: ['commercialista', 'studio contabile'],
      JP: ['会計事務所', '税理士'],
    },
  },
  advocacia: {
    aliases: ['advocacia', 'advogado', 'law firm', 'attorney', 'despacho de abogados', 'estudio jurídico', 'rechtsanwalt', 'cabinet d avocats', 'studio legale', '法律事務所'],
    english: ['law firm', 'attorney'],
    localized: {
      BR: ['escritório de advocacia', 'advogado'],
      PT: ['escritório de advogados', 'advogado'],
      ES: ['despacho de abogados', 'abogado'],
      MX: ['despacho de abogados', 'abogado'],
      AR: ['estudio jurídico', 'abogado'],
      CO: ['oficina de abogados', 'abogado'],
      CL: ['estudio de abogados', 'abogado'],
      PE: ['estudio de abogados', 'abogado'],
      US: ['law firm', 'attorney'],
      UK: ['law firm', 'solicitor'],
      CA: ['law firm', 'attorney'],
      AU: ['law firm', 'solicitor'],
      DE: ['rechtsanwalt', 'anwaltskanzlei'],
      FR: ['cabinet d avocats', 'avocat'],
      IT: ['studio legale', 'avvocato'],
      JP: ['法律事務所', '弁護士'],
    },
  },
  imobiliaria: {
    aliases: ['imobiliária', 'imobiliaria', 'real estate', 'estate agent', 'inmobiliaria', 'agence immobilière', 'agenzia immobiliare', 'immobilienbüro', '不動産会社'],
    english: ['real estate agency', 'estate agent'],
    localized: {
      BR: ['imobiliária', 'corretor de imóveis'],
      PT: ['imobiliária', 'mediação imobiliária'],
      ES: ['inmobiliaria', 'agencia inmobiliaria'],
      MX: ['inmobiliaria', 'bienes raíces'],
      AR: ['inmobiliaria', 'bienes raíces'],
      CO: ['inmobiliaria', 'bienes raíces'],
      CL: ['inmobiliaria', 'bienes raíces'],
      PE: ['inmobiliaria', 'bienes raíces'],
      US: ['real estate agency', 'estate agent'],
      UK: ['estate agent', 'real estate agency'],
      CA: ['real estate agency', 'estate agent'],
      AU: ['real estate agent', 'estate agent'],
      DE: ['immobilienbüro', 'immobilienmakler'],
      FR: ['agence immobilière', 'immobilier'],
      IT: ['agenzia immobiliare', 'immobiliare'],
      JP: ['不動産会社', '不動産'],
    },
  },
  padaria: {
    aliases: ['padaria', 'bakery', 'panadería', 'panaderia', 'boulangerie', 'panetteria', 'パン屋'],
    english: ['bakery'],
    localized: {
      BR: ['padaria'],
      PT: ['padaria', 'pastelaria'],
      ES: ['panadería'],
      MX: ['panadería'],
      AR: ['panadería'],
      CO: ['panadería'],
      CL: ['panadería'],
      PE: ['panadería'],
      US: ['bakery'],
      UK: ['bakery'],
      CA: ['bakery'],
      AU: ['bakery'],
      DE: ['bäckerei'],
      FR: ['boulangerie'],
      IT: ['panetteria'],
      JP: ['パン屋'],
    },
  },
};

const NICHE_TOKEN_STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'at', 'de', 'del', 'do', 'dos', 'da', 'das', 'e', 'el', 'em', 'en', 'for',
  'in', 'la', 'las', 'local', 'los', 'me', 'near', 'o', 'os', 'para', 'por', 'the', 'uma', 'um', 'y',
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeStrings(values: (string | undefined)[]): string[] {
  const seen = new Set<string>();

  return values
    .map((value) => value?.trim())
    .filter((value): value is string => !!value)
    .filter((value) => {
      const normalized = normalizeText(value);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function resolveCanonicalNicheKey(niche: string): string | null {
  const normalizedNiche = normalizeText(niche);
  const nicheTokens = extractMeaningfulTokens(niche);
  let bestMatch: { key: string; score: number } | null = null;

  for (const [canonicalKey, definition] of Object.entries(LOCALIZED_NICHE_TERMS)) {
    const terms = dedupeStrings([
      canonicalKey,
      ...definition.aliases,
      ...definition.english,
      ...Object.values(definition.localized).flatMap((localizedTerms) => localizedTerms ?? []),
    ]);

    for (const term of terms) {
      const normalizedTerm = normalizeText(term);
      if (!normalizedTerm) continue;

      let score = 0;

      if (normalizedTerm === normalizedNiche) {
        score = 1000 + normalizedTerm.length;
      } else if (normalizedNiche.includes(normalizedTerm)) {
        score = 700 + normalizedTerm.length;
      } else if (normalizedTerm.includes(normalizedNiche)) {
        score = 550 + normalizedNiche.length;
      } else {
        const termTokens = extractMeaningfulTokens(term);
        const overlapCount = termTokens.filter((token) => nicheTokens.includes(token)).length;

        if (overlapCount > 0) {
          score = 100 + overlapCount * 25 + normalizedTerm.length;
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { key: canonicalKey, score };
      }
    }
  }

  return bestMatch?.score ? bestMatch.key : null;
}

function extractMeaningfulTokens(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !NICHE_TOKEN_STOPWORDS.has(token));
}

function buildKeywordTerms(values: string[]): string[] {
  const rawKeywords = values.flatMap((value) => {
    const tokens = extractMeaningfulTokens(value);

    return tokens.flatMap((token) => {
      const variants = [token];

      if (token.length >= 5) variants.push(token.slice(0, 5));
      if (token.length >= 7) variants.push(token.slice(0, 6));

      return variants;
    });
  });

  return dedupeStrings(rawKeywords).filter((token) => token.length >= 3);
}

function getNicheLocalization(niche: string, countryCode: string): NicheLocalization {
  const canonicalKey = resolveCanonicalNicheKey(niche);

  if (!canonicalKey) {
    const localizedTerms = dedupeStrings([niche]);

    return {
      canonicalKey: null,
      localizedTerms,
      exactTerms: localizedTerms,
      keywordTerms: buildKeywordTerms(localizedTerms),
    };
  }

  const definition = LOCALIZED_NICHE_TERMS[canonicalKey];
  const countryTerms = definition.localized[countryCode] || [];
  const localizedTerms = dedupeStrings([...countryTerms, niche, ...definition.english]);
  const exactTerms = dedupeStrings([
    ...localizedTerms,
    ...definition.aliases,
    ...definition.english,
    ...Object.values(definition.localized).flatMap((localizedTerms) => localizedTerms ?? []),
  ]);

  return {
    canonicalKey,
    localizedTerms,
    exactTerms,
    keywordTerms: buildKeywordTerms(exactTerms),
  };
}

function getLocalizedNicheTerms(niche: string, countryCode: string): string[] {
  return getNicheLocalization(niche, countryCode).localizedTerms;
}

function buildSearchCandidates(
  niche: string,
  countryCode: string,
  cityName: string,
  searchLocation: string,
  countryName: string,
  defaultHl: string,
): SearchCandidate[] {
  const template = SEARCH_TEMPLATES[defaultHl] || SEARCH_TEMPLATES['en'];
  const nicheLocalization = getNicheLocalization(niche, countryCode);
  const localizedTerms = nicheLocalization.localizedTerms;
  const englishTerms = nicheLocalization.canonicalKey
    ? dedupeStrings(LOCALIZED_NICHE_TERMS[nicheLocalization.canonicalKey].english)
    : [];

  const candidates: SearchCandidate[] = [];

  for (const term of localizedTerms) {
    candidates.push({
      query: template.replace('{niche}', term).replace('{city}', searchLocation),
      hl: defaultHl,
      useLocation: true,
    });

    if (countryCode !== 'BR') {
      candidates.push({
        query: `${term} ${cityName} ${countryName}`,
        hl: defaultHl,
        useLocation: false,
      });
    }
  }

  if (defaultHl !== 'en') {
    for (const term of englishTerms) {
      candidates.push({
        query: SEARCH_TEMPLATES['en'].replace('{niche}', term).replace('{city}', cityName),
        hl: 'en',
        useLocation: true,
      });
    }
  }

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.hl}::${candidate.useLocation ? '1' : '0'}::${normalizeText(candidate.query)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchSerperPlaces(
  apiKeys: string[],
  payload: Record<string, unknown>,
): Promise<any[]> {
  let lastStatus = 500;
  let lastErrorText = '';

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKeys[keyIndex],
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data.places) ? data.places : [];
    }

    lastStatus = response.status;
    lastErrorText = await response.text();
    console.error(`Serper error with key #${keyIndex + 1}:`, response.status, lastErrorText);

    if (response.status !== 429) {
      break;
    }
  }

  throw new Error(lastStatus === 429 ? 'Limite de requisições atingido. Tente novamente em instantes.' : `Search error: ${lastStatus}`);
}

function dedupePlaces(places: any[]): any[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.placeId || place.cid || ''}::${place.title || place.name || ''}::${place.address || ''}`.toLowerCase();
    if (!key.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getPlaceSearchCorpus(place: any): { categoryText: string; titleText: string; fullText: string } {
  const categoryText = normalizeText([
    place.category || '',
    place.type || '',
  ].join(' '));

  const titleText = normalizeText(place.title || place.name || '');

  const fullText = normalizeText([
    place.title || place.name || '',
    place.category || '',
    place.type || '',
    place.description || '',
    place.address || '',
    place.website || '',
  ].join(' '));

  return { categoryText, titleText, fullText };
}

function getPlaceNicheScore(place: any, niche: string, countryCode: string): number {
  const nicheLocalization = getNicheLocalization(niche, countryCode);
  const { categoryText, titleText, fullText } = getPlaceSearchCorpus(place);

  let score = 0;

  for (const term of nicheLocalization.exactTerms) {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) continue;

    if (categoryText.includes(normalizedTerm)) score += 8;
    else if (titleText.includes(normalizedTerm)) score += 6;
    else if (fullText.includes(normalizedTerm)) score += 3;
  }

  for (const keyword of nicheLocalization.keywordTerms) {
    if (!keyword) continue;

    if (categoryText.includes(keyword)) score += 3;
    else if (titleText.includes(keyword)) score += 2;
    else if (fullText.includes(keyword)) score += 1;
  }

  return score;
}

function filterAndRankPlacesByNiche(places: any[], niche: string, countryCode: string): any[] {
  const scoredPlaces = places
    .map((place) => ({
      place,
      score: getPlaceNicheScore(place, niche, countryCode),
    }))
    .sort((a, b) => b.score - a.score);

  const strictMatches = scoredPlaces.filter((entry) => entry.score >= 4).map((entry) => entry.place);
  if (strictMatches.length > 0) {
    return strictMatches;
  }

  const broadMatches = scoredPlaces.filter((entry) => entry.score >= 2).map((entry) => entry.place);
  if (broadMatches.length > 0) {
    return broadMatches;
  }

  return scoredPlaces.map((entry) => entry.place);
}

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

    const apiKeys = dedupeStrings([
      Deno.env.get('SERPER_API_KEY'),
      Deno.env.get('SERPER_API_KEY_2'),
    ]);

    if (apiKeys.length === 0) {
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
    
    const searchLocation = stateAbbr ? `${cityName}, ${stateAbbr}` : cityName;

    // Build location string for Serper geo-targeting (critical for non-BR countries)
    const serperLocation = countryCode === 'BR' 
      ? (stateAbbr ? `${cityName}, ${stateAbbr}, Brazil` : `${cityName}, Brazil`)
      : `${cityName}, ${config.countryName}`;

    // Get message template for this country
    const messageTemplate = MESSAGE_TEMPLATES[config.lang] || MESSAGE_TEMPLATES['en'];
    const consultantName = affiliateName || 'Consultor Genesis';

    // FAST SEARCH: limit to 50 results to filter by state
    const maxResults = Math.min(50, Math.max(10, requestedMax || 50));
    const searchCandidates = buildSearchCandidates(
      niche,
      countryCode,
      cityName,
      searchLocation,
      config.countryName,
      config.hl,
    );
    const searchQuery = searchCandidates[0]?.query || `${niche} ${searchLocation}`;
    const serperBatchSize = Math.min(10, maxResults);
    
    console.log(`Global search: "${searchQuery}" in ${countryCode} (${config.gl}/${config.hl}), location: "${serperLocation}", state filter: "${stateAbbr}", candidates: ${searchCandidates.length}`);

    let places: any[] = [];

    for (const candidate of searchCandidates) {
      const candidatePlaces = await fetchSerperPlaces(apiKeys, {
        q: candidate.query,
        gl: config.gl,
        hl: candidate.hl,
        num: serperBatchSize,
        ...(candidate.useLocation ? { location: serperLocation } : {}),
      });

      console.log(`Query "${candidate.query}" (${candidate.hl}${candidate.useLocation ? ', location' : ''}) found ${candidatePlaces.length} results`);

      places = dedupePlaces([...places, ...candidatePlaces]);

      if (places.length >= maxResults) {
        break;
      }
    }

    const nicheFilteredPlaces = filterAndRankPlacesByNiche(places, niche, countryCode);
    console.log(`Niche precision filter: ${places.length} -> ${nicheFilteredPlaces.length} for niche "${niche}" (${countryCode})`);
    places = nicheFilteredPlaces;


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
      .filter((r: BusinessResult | null): r is BusinessResult => !!r)
      .slice(0, maxResults);

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
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Preserve full URL for social media profiles
    if (hostname.includes('instagram.com') || hostname.includes('facebook.com') || 
        hostname.includes('fb.com') || hostname.includes('fb.me') ||
        hostname.includes('linkedin.com') || hostname.includes('tiktok.com')) {
      return fullUrl;
    }
    
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
