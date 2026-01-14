import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Home,
  GraduationCap,
  PawPrint,
  Scale,
  Sparkles as SparklesIcon,
  Eye,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

const templates = [
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Landing page premium para barbearias',
    icon: Scissors,
    route: '/barbearia',
    color: 'from-amber-500 to-amber-600',
    available: true
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Site completo para academias e personal',
    icon: Dumbbell,
    route: '/academia',
    color: 'from-red-500 to-red-600',
    available: false
  },
  {
    id: 'clinica',
    name: 'Clínica',
    description: 'Página para clínicas e consultórios',
    icon: Stethoscope,
    route: '/clinica',
    color: 'from-blue-500 to-blue-600',
    available: false
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    description: 'Cardápio digital e reservas online',
    icon: UtensilsCrossed,
    route: '/restaurante',
    color: 'from-orange-500 to-orange-600',
    available: false
  },
  {
    id: 'imobiliaria',
    name: 'Imobiliária',
    description: 'Catálogo de imóveis e corretores',
    icon: Home,
    route: '/imobiliaria',
    color: 'from-emerald-500 to-emerald-600',
    available: false
  },
  {
    id: 'escola',
    name: 'Escola/Curso',
    description: 'Matrículas e informações de cursos',
    icon: GraduationCap,
    route: '/escola',
    color: 'from-purple-500 to-purple-600',
    available: false
  },
  {
    id: 'petshop',
    name: 'Pet Shop',
    description: 'Serviços e produtos para pets',
    icon: PawPrint,
    route: '/petshop',
    color: 'from-pink-500 to-pink-600',
    available: false
  },
  {
    id: 'advocacia',
    name: 'Advocacia',
    description: 'Escritório de advocacia profissional',
    icon: Scale,
    route: '/advocacia',
    color: 'from-slate-500 to-slate-600',
    available: false
  },
];

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  const handleOpenPreview = (route: string) => {
    window.open(route, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Modelos Prontos</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Templates profissionais prontos para mostrar aos seus prospects. 
          Clique para visualizar o modelo ao vivo.
        </p>
      </motion.div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`group relative overflow-hidden transition-all duration-300 ${
                template.available 
                  ? 'hover:border-primary/50 hover:shadow-lg cursor-pointer' 
                  : 'opacity-60'
              }`}
              onClick={() => template.available && handleOpenPreview(template.route)}
            >
              <CardContent className="p-4 space-y-4">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                    <template.icon className="w-6 h-6 text-white" />
                  </div>
                  {template.available ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                      Disponível
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Lock className="w-3 h-3" />
                      Em breve
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Action */}
                {template.available && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Preview
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReadyTemplatesTab;
