import { motion } from 'framer-motion';
import { Sparkles, Building2, MapPin, Phone, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Dados reais do banco com máscaras aplicadas
const realLeads = [
  { company_name: 'Barbearia Executive', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 85 },
  { company_name: 'ELLEGANTES BARBEARIA', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 78 },
  { company_name: 'Barbeiros SA', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 92 },
  { company_name: 'Don Juba Barbearia', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 70 },
  { company_name: 'Barbearia Xandy White', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 88 },
  { company_name: 'Barbearia Vikings', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 75 },
  { company_name: 'BARBEARIA ARMAZZEM', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 82 },
  { company_name: 'Salão Brasil', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 68 },
  { company_name: 'Tiago Barbearia', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 90 },
  { company_name: 'Barbearia Everaldo', niche: 'Barbearia', city: 'Vitória da Conquista', state: 'BA', score: 77 },
  { company_name: 'SALAO NOVO ESTILO', niche: 'Barbearia', city: 'Águia Branca', state: 'ES', score: 85 },
  { company_name: 'Barbearia Lá Casa du Corte', niche: 'Barbearia', city: 'Águia Branca', state: 'ES', score: 72 },
  { company_name: 'Seu Aragão Barbearia', niche: 'Barbearia', city: 'Águia Branca', state: 'ES', score: 80 },
  { company_name: 'Barbearia Nunes', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 88 },
  { company_name: 'John Wick Barbearia', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 95 },
  { company_name: 'Barbearia The Express', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 73 },
  { company_name: 'Barbearia Rezende', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 81 },
  { company_name: 'Juarez Barber Shop', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 86 },
  { company_name: 'Barbearia Adão', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 69 },
  { company_name: 'Roque Barbearia', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 91 },
  { company_name: 'Gunz Barbearia', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 84 },
  { company_name: 'Yuri Barbeiro', niche: 'Barbearia', city: 'Cariacica', state: 'ES', score: 76 },
  { company_name: 'Inspire Barbershop', niche: 'Barbearia', city: 'Cariacica', state: 'ES', score: 93 },
  { company_name: 'Coser Barbearia', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 79 },
  { company_name: 'Barbearia Ferreiras', niche: 'Barbearia', city: 'Cariacica', state: 'ES', score: 87 },
  { company_name: 'Barberking Barbearia', niche: 'Barbearia', city: 'Nova Venécia', state: 'ES', score: 74 },
  { company_name: 'Asmad BarberCoffee', niche: 'Barbearia', city: 'Cariacica', state: 'ES', score: 89 },
  { company_name: 'Studio Barbearia', niche: 'Barbearia', city: 'São Paulo', state: 'SP', score: 82 },
  { company_name: 'Classic Barber', niche: 'Barbearia', city: 'Rio de Janeiro', state: 'RJ', score: 78 },
  { company_name: 'Premium Cuts', niche: 'Barbearia', city: 'Belo Horizonte', state: 'MG', score: 85 },
];

const maskLocation = (city: string, state: string) => {
  if (!city || !state) return '••••••, ••';
  return `${city.substring(0, 3)}•••••, ${state}`;
};

const maskPhone = () => {
  return '(••) •••••-••••';
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const getScoreLabel = (score: number) => {
  if (score >= 85) return 'Avançado';
  if (score >= 70) return 'Intermediário';
  return 'Básico';
};

const GenesisCommercialRadar = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      </div>

      <div className="container relative z-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-primary/30 text-primary">
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

        {/* Cards Carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
            {realLeads.map((lead, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="flex-shrink-0 w-[280px] bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm truncate max-w-[150px]">
                        {lead.company_name}
                      </h3>
                      <span className="text-xs text-muted-foreground">{lead.niche}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getScoreColor(lead.score)}`}>
                    {getScoreLabel(lead.score)}
                  </Badge>
                </div>

                {/* Info with masks */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{maskLocation(lead.city, lead.state)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{maskPhone()}</span>
                  </div>
                </div>

                {/* Value estimate */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Valor estimado</span>
                    <div className="text-sm font-bold text-primary">
                      R$ {(Math.floor(Math.random() * 500) + 300).toLocaleString('pt-BR')}
                      <span className="text-xs font-normal text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
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
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
