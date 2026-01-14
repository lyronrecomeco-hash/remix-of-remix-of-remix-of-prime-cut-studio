// Global Countries and Niches Configuration for Prospecting

export interface Country {
  code: string;
  name: string;
  flag: string;
  language: string;
  searchParams: {
    gl: string; // Google country code
    hl: string; // Language code
  };
}

export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', language: 'pt-BR', searchParams: { gl: 'br', hl: 'pt-br' } },
  { code: 'US', name: 'United States', flag: '🇺🇸', language: 'en-US', searchParams: { gl: 'us', hl: 'en' } },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', language: 'pt-PT', searchParams: { gl: 'pt', hl: 'pt-pt' } },
  { code: 'ES', name: 'España', flag: '🇪🇸', language: 'es-ES', searchParams: { gl: 'es', hl: 'es' } },
  { code: 'MX', name: 'México', flag: '🇲🇽', language: 'es-MX', searchParams: { gl: 'mx', hl: 'es' } },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', language: 'es-AR', searchParams: { gl: 'ar', hl: 'es' } },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', language: 'es-CO', searchParams: { gl: 'co', hl: 'es' } },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', language: 'es-CL', searchParams: { gl: 'cl', hl: 'es' } },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', language: 'es-PE', searchParams: { gl: 'pe', hl: 'es' } },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', language: 'en-GB', searchParams: { gl: 'uk', hl: 'en' } },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', language: 'de-DE', searchParams: { gl: 'de', hl: 'de' } },
  { code: 'FR', name: 'France', flag: '🇫🇷', language: 'fr-FR', searchParams: { gl: 'fr', hl: 'fr' } },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', language: 'it-IT', searchParams: { gl: 'it', hl: 'it' } },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', language: 'en-CA', searchParams: { gl: 'ca', hl: 'en' } },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', language: 'en-AU', searchParams: { gl: 'au', hl: 'en' } },
  { code: 'JP', name: '日本', flag: '🇯🇵', language: 'ja-JP', searchParams: { gl: 'jp', hl: 'ja' } },
];

// Niches per country with local language
export const NICHES_BY_COUNTRY: Record<string, string[]> = {
  BR: [
    'Barbearia', 'Salão de Beleza', 'Clínica Médica', 'Clínica Odontológica',
    'Academia', 'Restaurante', 'Pizzaria', 'Hamburgueria', 'Padaria', 'Cafeteria',
    'Loja de Roupas', 'Pet Shop', 'Clínica Veterinária', 'Oficina Mecânica',
    'Lava Rápido', 'Imobiliária', 'Escritório de Advocacia', 'Contabilidade',
    'Estúdio de Tatuagem', 'Estúdio de Pilates', 'Escola de Idiomas', 'Auto Escola',
    'Hotel', 'Pousada', 'Farmácia', 'Ótica', 'Joalheria', 'Floricultura',
    'Supermercado', 'Mercado', 'Açougue', 'Papelaria', 'Loja de Eletrônicos',
    'Loja de Móveis', 'Loja de Materiais de Construção',
  ],
  US: [
    'Barbershop', 'Hair Salon', 'Medical Clinic', 'Dental Clinic', 'Gym',
    'Restaurant', 'Pizzeria', 'Burger Joint', 'Bakery', 'Coffee Shop',
    'Clothing Store', 'Pet Store', 'Veterinary Clinic', 'Auto Repair Shop',
    'Car Wash', 'Real Estate Agency', 'Law Firm', 'Accounting Firm',
    'Tattoo Studio', 'Yoga Studio', 'Pilates Studio', 'Language School',
    'Driving School', 'Hotel', 'Motel', 'Pharmacy', 'Optical Store',
    'Jewelry Store', 'Flower Shop', 'Supermarket', 'Grocery Store',
    'Electronics Store', 'Furniture Store', 'Hardware Store', 'Spa',
  ],
  PT: [
    'Barbearia', 'Cabeleireiro', 'Clínica Médica', 'Clínica Dentária',
    'Ginásio', 'Restaurante', 'Pizzaria', 'Padaria', 'Café',
    'Loja de Roupa', 'Pet Shop', 'Clínica Veterinária', 'Oficina Automóvel',
    'Lavagem Auto', 'Imobiliária', 'Escritório de Advogados', 'Contabilidade',
    'Estúdio de Tatuagem', 'Hotel', 'Farmácia', 'Ótica', 'Ourivesaria',
    'Florista', 'Supermercado', 'Minimercado', 'Loja de Electrónica',
  ],
  ES: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Clínica Dental', 'Gimnasio',
    'Restaurante', 'Pizzería', 'Hamburguesería', 'Panadería', 'Cafetería',
    'Tienda de Ropa', 'Tienda de Mascotas', 'Clínica Veterinaria',
    'Taller Mecánico', 'Lavado de Coches', 'Inmobiliaria', 'Despacho de Abogados',
    'Asesoría Contable', 'Estudio de Tatuaje', 'Estudio de Pilates',
    'Academia de Idiomas', 'Autoescuela', 'Hotel', 'Hostal', 'Farmacia',
    'Óptica', 'Joyería', 'Floristería', 'Supermercado', 'Tienda de Electrónica',
  ],
  MX: [
    'Barbería', 'Estética', 'Clínica Médica', 'Consultorio Dental', 'Gimnasio',
    'Restaurante', 'Pizzería', 'Hamburguesería', 'Panadería', 'Cafetería',
    'Tienda de Ropa', 'Veterinaria', 'Taller Mecánico', 'Autolavado',
    'Inmobiliaria', 'Despacho de Abogados', 'Contabilidad', 'Estudio de Tatuaje',
    'Hotel', 'Farmacia', 'Óptica', 'Joyería', 'Florería', 'Supermercado',
    'Tienda de Electrónica', 'Mueblería', 'Ferretería', 'Spa',
  ],
  AR: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Consultorio Odontológico',
    'Gimnasio', 'Restaurante', 'Pizzería', 'Hamburguesería', 'Panadería',
    'Cafetería', 'Local de Ropa', 'Pet Shop', 'Veterinaria', 'Taller Mecánico',
    'Lavadero de Autos', 'Inmobiliaria', 'Estudio Jurídico', 'Estudio Contable',
    'Estudio de Tatuajes', 'Hotel', 'Farmacia', 'Óptica', 'Joyería',
    'Florería', 'Supermercado', 'Almacén', 'Electrónica', 'Mueblería',
  ],
  CO: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Consultorio Odontológico',
    'Gimnasio', 'Restaurante', 'Pizzería', 'Panadería', 'Cafetería',
    'Tienda de Ropa', 'Veterinaria', 'Taller Mecánico', 'Lavadero de Carros',
    'Inmobiliaria', 'Oficina de Abogados', 'Contabilidad', 'Estudio de Tatuaje',
    'Hotel', 'Droguería', 'Óptica', 'Joyería', 'Floristería', 'Supermercado',
  ],
  CL: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Clínica Dental', 'Gimnasio',
    'Restaurante', 'Pizzería', 'Panadería', 'Cafetería', 'Tienda de Ropa',
    'Veterinaria', 'Taller Mecánico', 'Lavado de Autos', 'Inmobiliaria',
    'Estudio de Abogados', 'Contabilidad', 'Estudio de Tatuaje', 'Hotel',
    'Farmacia', 'Óptica', 'Joyería', 'Floristería', 'Supermercado',
  ],
  PE: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Consultorio Dental', 'Gimnasio',
    'Restaurante', 'Pizzería', 'Panadería', 'Cafetería', 'Tienda de Ropa',
    'Veterinaria', 'Taller Mecánico', 'Lavado de Autos', 'Inmobiliaria',
    'Estudio de Abogados', 'Contabilidad', 'Estudio de Tatuaje', 'Hotel',
    'Botica', 'Óptica', 'Joyería', 'Floristería', 'Supermercado',
  ],
  UK: [
    'Barbershop', 'Hair Salon', 'Medical Clinic', 'Dental Practice', 'Gym',
    'Restaurant', 'Pizzeria', 'Burger Restaurant', 'Bakery', 'Coffee Shop',
    'Clothing Store', 'Pet Shop', 'Veterinary Clinic', 'Car Garage',
    'Car Wash', 'Estate Agent', 'Law Firm', 'Accountancy Firm',
    'Tattoo Studio', 'Yoga Studio', 'Hotel', 'Pharmacy', 'Opticians',
    'Jewellers', 'Florist', 'Supermarket', 'Electronics Store', 'Spa',
  ],
  DE: [
    'Friseursalon', 'Barbershop', 'Arztpraxis', 'Zahnarzt', 'Fitnessstudio',
    'Restaurant', 'Pizzeria', 'Bäckerei', 'Café', 'Bekleidungsgeschäft',
    'Tierhandlung', 'Tierarzt', 'Autowerkstatt', 'Autowaschanlage',
    'Immobilienbüro', 'Rechtsanwalt', 'Steuerberater', 'Tattoo Studio',
    'Hotel', 'Apotheke', 'Optiker', 'Juwelier', 'Blumenladen', 'Supermarkt',
  ],
  FR: [
    'Salon de Coiffure', 'Barbier', 'Cabinet Médical', 'Cabinet Dentaire',
    'Salle de Sport', 'Restaurant', 'Pizzeria', 'Boulangerie', 'Café',
    'Boutique de Vêtements', 'Animalerie', 'Vétérinaire', 'Garage Automobile',
    'Station de Lavage', 'Agence Immobilière', 'Cabinet d\'Avocats',
    'Cabinet Comptable', 'Studio de Tatouage', 'Hôtel', 'Pharmacie',
    'Opticien', 'Bijouterie', 'Fleuriste', 'Supermarché', 'Spa',
  ],
  IT: [
    'Barbiere', 'Parrucchiere', 'Studio Medico', 'Studio Dentistico', 'Palestra',
    'Ristorante', 'Pizzeria', 'Panetteria', 'Caffetteria', 'Negozio di Abbigliamento',
    'Negozio di Animali', 'Veterinario', 'Officina Meccanica', 'Autolavaggio',
    'Agenzia Immobiliare', 'Studio Legale', 'Commercialista', 'Studio di Tatuaggi',
    'Hotel', 'Farmacia', 'Ottico', 'Gioielleria', 'Fiorista', 'Supermercato',
  ],
  CA: [
    'Barbershop', 'Hair Salon', 'Medical Clinic', 'Dental Clinic', 'Gym',
    'Restaurant', 'Pizzeria', 'Burger Place', 'Bakery', 'Coffee Shop',
    'Clothing Store', 'Pet Store', 'Veterinary Clinic', 'Auto Repair',
    'Car Wash', 'Real Estate Agency', 'Law Firm', 'Accounting Firm',
    'Tattoo Studio', 'Yoga Studio', 'Hotel', 'Pharmacy', 'Optical Store',
    'Jewelry Store', 'Flower Shop', 'Supermarket', 'Electronics Store', 'Spa',
  ],
  AU: [
    'Barbershop', 'Hair Salon', 'Medical Centre', 'Dental Clinic', 'Gym',
    'Restaurant', 'Pizzeria', 'Burger Bar', 'Bakery', 'Café',
    'Clothing Store', 'Pet Shop', 'Vet Clinic', 'Mechanic',
    'Car Wash', 'Real Estate Agent', 'Law Firm', 'Accountant',
    'Tattoo Studio', 'Yoga Studio', 'Hotel', 'Pharmacy', 'Optometrist',
    'Jeweller', 'Florist', 'Supermarket', 'Electronics Store', 'Day Spa',
  ],
  JP: [
    '理髪店', '美容院', 'クリニック', '歯科医院', 'ジム',
    'レストラン', 'ピザ屋', 'ハンバーガーショップ', 'パン屋', 'カフェ',
    '洋服店', 'ペットショップ', '動物病院', '自動車修理',
    '洗車場', '不動産会社', '法律事務所', '会計事務所',
    'タトゥースタジオ', 'ヨガスタジオ', 'ホテル', '薬局', 'メガネ店',
    '宝石店', '花屋', 'スーパー', '電器店', 'スパ',
  ],
};

// Brazilian states
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

// Get niches for a country, fallback to US if not found
export function getNichesForCountry(countryCode: string): string[] {
  return NICHES_BY_COUNTRY[countryCode] || NICHES_BY_COUNTRY['US'];
}

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
