import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Phone, ArrowRight, Lock, TrendingUp, DollarSign, Globe, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RealLead {
  id: string;
  company_name: string;
  niche: string | null;
  company_city: string | null;
  company_state: string | null;
  company_phone: string | null;
  analysis_score: number | null;
  source: string | null;
}

// Brazilian cities for random locations
const BRAZILIAN_CITIES = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Recife', state: 'PE' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'Manaus', state: 'AM' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'Vitória', state: 'ES' },
  { city: 'Natal', state: 'RN' },
  { city: 'Campo Grande', state: 'MS' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Aracaju', state: 'SE' },
  { city: 'Cuiabá', state: 'MT' },
  { city: 'Uberlândia', state: 'MG' },
  { city: 'Ribeirão Preto', state: 'SP' },
  { city: 'Sorocaba', state: 'SP' },
  { city: 'Joinville', state: 'SC' },
  { city: 'Londrina', state: 'PR' },
];

// Generate random masked location
const getRandomMaskedLocation = (index: number) => {
  const location = BRAZILIAN_CITIES[index % BRAZILIAN_CITIES.length];
  const maskedCity = location.city.length > 5 
    ? `${location.city.substring(0, 5)}•••••` 
    : `${location.city}•••`;
  return `${maskedCity}, ${location.state}`;
};

const maskPhone = () => '(••) •••••-••••';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Avançado';
  if (score >= 60) return 'Intermediário';
  return 'Básico';
};

const getNicheIcon = (niche: string | null) => {
  const nicheIcons: Record<string, string> = {
    'Barbearia': '💈',
    'Restaurante': '🍽️',
    'Loja': '🛍️',
    'Academia': '🏋️',
    'Clínica': '🏥',
    'Salão': '💇',
    'Pet Shop': '🐾',
    'Oficina': '🔧',
    'Fitness': '🏋️',
    'Farmácia': '💊',
    'Pizzaria': '🍕',
    'Padaria': '🥖',
    'Consultório': '🩺',
    'Estética': '✨',
    'Delivery': '🛵',
    'Imobiliária': '🏠',
    'Advocacia': '⚖️',
    'Contabilidade': '📊',
  };
  return nicheIcons[niche || ''] || '🏢';
};

const getEstimatedValue = (niche: string | null): { min: number; max: number; recurrence: number } => {
  const values: Record<string, { min: number; max: number; recurrence: number }> = {
    'Barbearia': { min: 300, max: 600, recurrence: 50 },
    'Restaurante': { min: 500, max: 1200, recurrence: 80 },
    'Loja': { min: 400, max: 800, recurrence: 60 },
    'Academia': { min: 550, max: 800, recurrence: 90 },
    'Fitness': { min: 550, max: 800, recurrence: 90 },
    'Clínica': { min: 800, max: 2000, recurrence: 150 },
    'Salão': { min: 350, max: 700, recurrence: 55 },
    'Pet Shop': { min: 400, max: 900, recurrence: 70 },
    'Oficina': { min: 350, max: 750, recurrence: 45 },
    'Farmácia': { min: 450, max: 950, recurrence: 65 },
    'Pizzaria': { min: 400, max: 900, recurrence: 70 },
    'Padaria': { min: 350, max: 700, recurrence: 50 },
    'Consultório': { min: 700, max: 1800, recurrence: 120 },
    'Estética': { min: 600, max: 1400, recurrence: 100 },
    'Delivery': { min: 300, max: 700, recurrence: 45 },
    'Imobiliária': { min: 800, max: 2500, recurrence: 200 },
    'Advocacia': { min: 900, max: 3000, recurrence: 250 },
    'Contabilidade': { min: 700, max: 1500, recurrence: 150 },
  };
  return values[niche || ''] || { min: 300, max: 800, recurrence: 50 };
};

// Generate tags based on niche
const getNicheTags = (niche: string | null): string[] => {
  const tagMap: Record<string, string[]> = {
    'Barbearia': ['agendamento', 'fidelidade'],
    'Restaurante': ['delivery', 'cardápio'],
    'Loja': ['e-commerce', 'catálogo'],
    'Academia': ['app', 'agendamento'],
    'Fitness': ['app', 'agendamento'],
    'Clínica': ['prontuário', 'agendamento'],
    'Salão': ['agendamento', 'catálogo'],
    'Pet Shop': ['agendamento', 'delivery'],
    'Oficina': ['orçamento', 'gestão'],
    'Farmácia': ['estoque', 'vendas'],
    'Pizzaria': ['pedidos', 'delivery'],
    'Padaria': ['encomendas', 'cardápio'],
    'Consultório': ['prontuário', 'agenda'],
    'Estética': ['agendamento', 'pacotes'],
    'Delivery': ['pedidos', 'rotas'],
    'Imobiliária': ['imóveis', 'CRM'],
    'Advocacia': ['processos', 'clientes'],
    'Contabilidade': ['gestão', 'documentos'],
  };
  return tagMap[niche || ''] || ['site', 'presença digital'];
};

// Get AI description based on niche
const getAiDescription = (niche: string | null, companyName: string): string => {
  const descriptions: Record<string, string> = {
    'Academia': `${niche || 'Negócio'} precisa de app para agendamento de aulas e controle de alunos.`,
    'Fitness': `${niche || 'Negócio'} precisa de app para agendamento de aulas e controle de alunos.`,
    'Barbearia': `${niche || 'Negócio'} precisa de sistema de agendamento online e fidelidade.`,
    'Restaurante': `${niche || 'Negócio'} precisa de cardápio digital e sistema de delivery.`,
    'Clínica': `${niche || 'Negócio'} precisa de prontuário eletrônico e agendamento.`,
    'Pet Shop': `${niche || 'Negócio'} precisa de agendamento para banho/tosa e e-commerce.`,
    'Salão': `${niche || 'Negócio'} precisa de agendamento online e catálogo de serviços.`,
  };
  return descriptions[niche || ''] || `${niche || 'Negócio'} precisa de sistema de agendamento e presença digital.`;
};

const GenesisCommercialRadar = () => {
  const [leads, setLeads] = useState<RealLead[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Shuffle locations on mount
  const shuffledLocationIndices = useMemo(() => {
    const indices = Array.from({ length: 50 }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  // Diverse niches for showcase - always show variety
  const DIVERSE_NICHES = [
    'Academia', 'Restaurante', 'Clínica', 'Pet Shop', 'Salão', 
    'Barbearia', 'Loja', 'Oficina', 'Fitness', 'Farmácia', 
    'Pizzaria', 'Padaria', 'Consultório', 'Estética', 'Delivery',
    'Imobiliária', 'Advocacia', 'Contabilidade'
  ];

  const MOCK_COMPANIES: { name: string; niche: string }[] = [
    { name: 'Studio Fitness Pro', niche: 'Academia' },
    { name: 'Restaurante Sabor & Arte', niche: 'Restaurante' },
    { name: 'Clínica Bem Estar', niche: 'Clínica' },
    { name: 'Pet Center Amigo', niche: 'Pet Shop' },
    { name: 'Salão Beleza Total', niche: 'Salão' },
    { name: 'Loja Moda Atual', niche: 'Loja' },
    { name: 'Auto Mecânica Express', niche: 'Oficina' },
    { name: 'CrossFit Power', niche: 'Fitness' },
    { name: 'Farmácia Popular Plus', niche: 'Farmácia' },
    { name: 'Pizzaria Forno Italiano', niche: 'Pizzaria' },
    { name: 'Padaria Pão Quente', niche: 'Padaria' },
    { name: 'Consultório Dr. Saúde', niche: 'Consultório' },
    { name: 'Estética Renova', niche: 'Estética' },
    { name: 'Delivery Rápido', niche: 'Delivery' },
    { name: 'Imóveis Prime', niche: 'Imobiliária' },
    { name: 'Advocacia Silva', niche: 'Advocacia' },
    { name: 'Contábil Express', niche: 'Contabilidade' },
    { name: 'Academia Top Shape', niche: 'Academia' },
    { name: 'Restaurante La Pasta', niche: 'Restaurante' },
    { name: 'Clínica Odonto Prime', niche: 'Clínica' },
    { name: 'Pet Shop Bicho Feliz', niche: 'Pet Shop' },
    { name: 'Salão Glamour', niche: 'Salão' },
    { name: 'Loja Tech Store', niche: 'Loja' },
    { name: 'Oficina Turbo', niche: 'Oficina' },
    { name: 'Studio Pilates', niche: 'Fitness' },
    { name: 'Farmácia Saúde Total', niche: 'Farmácia' },
    { name: 'Pizzaria Napoli', niche: 'Pizzaria' },
    { name: 'Padaria Doce Mel', niche: 'Padaria' },
    { name: 'Clínica Vida Nova', niche: 'Consultório' },
    { name: 'Estética Body Care', niche: 'Estética' },
    { name: 'Delivery Express', niche: 'Delivery' },
    { name: 'Corretora Horizonte', niche: 'Imobiliária' },
    { name: 'Escritório Jurídico Costa', niche: 'Advocacia' },
    { name: 'Contabilidade Moderna', niche: 'Contabilidade' },
  ];

  useEffect(() => {
    const generateDiverseLeads = () => {
      // Always generate diverse mock leads for best showcase experience
      // This ensures visitors always see variety of niches
      const mockLeads: RealLead[] = MOCK_COMPANIES.map((company, i) => ({
        id: `lead-${i}-${Date.now()}`,
        company_name: company.name,
        niche: company.niche,
        company_city: null,
        company_state: null,
        company_phone: null,
        analysis_score: Math.floor(Math.random() * 35) + 60, // 60-95
        source: 'radar',
      }));
      
      // Fisher-Yates shuffle for true randomness
      for (let i = mockLeads.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mockLeads[i], mockLeads[j]] = [mockLeads[j], mockLeads[i]];
      }
      
      setLeads(mockLeads);
      setLoading(false);
    };
    
    generateDiverseLeads();
  }, []);

  // Auto-scroll carousel - FASTER
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || leads.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 1.2; // Faster speed

    const animate = () => {
      scrollPosition += speed;
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => { animationId = requestAnimationFrame(animate); };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [leads]);

  // Duplicate leads for infinite scroll effect
  const displayLeads = [...leads, ...leads];

  return (
    <section id="oportunidades" className="relative py-20 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(150,80%,40%,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.15)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative z-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2" />
            Clientes Prontos para Fechar Negócio
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Veja oportunidades <span className="text-primary">reais</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Empresas esperando por você. Assine e tenha acesso completo aos contatos.
          </p>
        </motion.div>

        {/* Auto-scrolling Cards Carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden pb-4"
            style={{ scrollBehavior: 'auto' }}
          >
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[340px] h-[320px] bg-card border border-border rounded-xl animate-pulse" />
              ))
            ) : (
              displayLeads.map((lead, index) => {
                const estimated = getEstimatedValue(lead.niche);
                const score = lead.analysis_score || 70;
                const tags = getNicheTags(lead.niche);
                const locationIndex = shuffledLocationIndices[index % shuffledLocationIndices.length];
                
                return (
                  <motion.div
                    key={`${lead.id}-${index}`}
                    className="flex-shrink-0 w-[340px] bg-card/90 backdrop-blur-sm border border-border rounded-xl p-5 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                          {getNicheIcon(lead.niche)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground text-base truncate max-w-[180px]">
                            {lead.company_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{lead.niche || 'Negócio'}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 ${getScoreColor(score)}`}>
                              {getScoreLabel(score)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Values - With Labels */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                          <DollarSign className="w-3 h-3 text-amber-500" />
                          <span>VALOR ESTIMADO</span>
                        </div>
                        <div className="text-xs text-muted-foreground">R$ {estimated.min} (mín)</div>
                        <div className="text-base font-bold text-foreground">R$ {estimated.max}</div>
                        <div className="text-[10px] text-muted-foreground">(máx)</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span>RECORRÊNCIA</span>
                        </div>
                        <div className="text-base font-bold text-emerald-500">+R$ {estimated.recurrence}/mês</div>
                      </div>
                    </div>

                    {/* AI Description */}
                    <div className="flex items-start gap-2 mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                      <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {getAiDescription(lead.niche, lead.company_name)}
                      </p>
                    </div>

                    {/* Info with masks - Blurred location for privacy */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="relative">
                          <span className="blur-[4px] select-none">São Paulo, SP</span>
                          <span className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-[2px] rounded text-[10px] text-muted-foreground/70">
                            🔒 Assine para ver
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="relative">
                          <span className="blur-[4px] select-none">(11) 99999-9999</span>
                          <span className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-[2px] rounded text-[10px] text-muted-foreground/70">
                            🔒 Assine para ver
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Digital presence indicator */}
                    <div className="flex items-center gap-2 py-2 border-t border-border mb-4">
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Sem presença digital — oportunidade máxima</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] bg-muted/50 text-muted-foreground rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons - Blurred for non-subscribers */}
                    <div className="flex gap-2 relative">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 blur-[2px] pointer-events-none"
                        disabled
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aceitar Projeto
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs gap-1.5 blur-[2px] pointer-events-none"
                        disabled
                      >
                        <Search className="w-3.5 h-3.5" />
                        Pesquisar →
                      </Button>
                      {/* Lock overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Lock className="w-4 h-4" />
            <span>Assine para desbloquear todos os contatos e começar a fechar negócios</span>
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Link to="/genesis" className="flex items-center gap-2">
              Desbloquear Acesso
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialRadar;
