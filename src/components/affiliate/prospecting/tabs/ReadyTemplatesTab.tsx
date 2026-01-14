import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Eye, 
  Palette, 
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  Phone,
  MapPin,
  Clock,
  Star,
  Calendar,
  ArrowRight,
  Type,
  Image,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://genesis.lovable.app/barbearia');
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPreview = () => {
    window.open('/barbearia', '_blank');
  };

  // Canvas customization features
  const customizationFeatures = [
    {
      icon: Type,
      title: 'Textos & Marca',
      description: 'Nome da barbearia, slogan, descrições',
      items: ['Nome do negócio', 'Tagline/Slogan', 'Descrição principal', 'Textos de seções']
    },
    {
      icon: Palette,
      title: 'Cores & Tema',
      description: 'Paleta de cores personalizada',
      items: ['Cor primária', 'Cor secundária', 'Fundo escuro/claro', 'Gradientes']
    },
    {
      icon: Phone,
      title: 'Contatos',
      description: 'Informações de contato',
      items: ['WhatsApp', 'Telefone fixo', 'E-mail', 'Redes sociais']
    },
    {
      icon: MapPin,
      title: 'Localização',
      description: 'Endereço e mapa',
      items: ['Endereço completo', 'Link Google Maps', 'Coordenadas', 'Instruções']
    },
    {
      icon: Clock,
      title: 'Horários',
      description: 'Funcionamento semanal',
      items: ['Dias úteis', 'Sábados', 'Domingos', 'Feriados']
    },
    {
      icon: Image,
      title: 'Imagens',
      description: 'Galeria e hero',
      items: ['Hero background', 'Logo', 'Galeria de fotos', 'Ícones']
    },
    {
      icon: Settings2,
      title: 'Serviços',
      description: 'Catálogo de serviços',
      items: ['Lista de serviços', 'Preços', 'Duração', 'Descrições']
    },
    {
      icon: Star,
      title: 'Depoimentos',
      description: 'Avaliações de clientes',
      items: ['Nome do cliente', 'Foto', 'Texto', 'Nota']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Templates Profissionais</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Modelos Prontos Genesis
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Landing pages completas e profissionais prontas para uso. 
          Perfeitas para fechar vendas com seus prospects mostrando um exemplo real do que podem ter.
        </p>
      </motion.div>

      {/* Barbearia Template Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Barbearia Premium</CardTitle>
                    <CardDescription>Template completo para barbearias</CardDescription>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Ativo
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Preview Frame */}
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl">
              {/* Browser Chrome */}
              <div className="bg-muted/80 px-4 py-2 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/80 rounded-lg px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                    <span className="text-green-500">🔒</span>
                    genesis.lovable.app/barbearia
                  </div>
                </div>
              </div>

              {/* Preview Content - Hero Section Simulation */}
              <div className="relative h-[400px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block px-4 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20"
                  >
                    ✂️ Experiência Premium em Barbearia
                  </motion.span>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl md:text-4xl font-bold text-white leading-tight"
                  >
                    Seu visual merece<br />
                    <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                      atenção aos detalhes
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-zinc-400 max-w-md text-sm"
                  >
                    Técnica refinada, ambiente sofisticado e atendimento personalizado.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 pt-2"
                  >
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2">
                      <Calendar className="w-4 h-4" />
                      Agendar
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2">
                      Serviços
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-8 pt-6"
                  >
                    {[
                      { value: '10+', label: 'Anos' },
                      { value: '5.000+', label: 'Clientes' },
                      { value: '4.9', label: 'Avaliação' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-zinc-500">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleOpenPreview}
                className="flex-1 sm:flex-none gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver Preview Completo
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[
                { icon: '🎨', label: 'Design Premium' },
                { icon: '📱', label: '100% Responsivo' },
                { icon: '⚡', label: 'Super Rápido' },
                { icon: '🔒', label: 'Seguro' },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Canvas Customization Idea */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <Separator />
        
        <div className="text-center space-y-2 pt-4">
          <Badge variant="outline" className="gap-2">
            <Palette className="w-3 h-3" />
            Em Breve
          </Badge>
          <h2 className="text-xl font-bold text-foreground">
            Canvas de Personalização
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Editor visual para customizar templates em tempo real. 
            Altere cores, textos, imagens e mais - veja as mudanças ao vivo!
          </p>
        </div>

        {/* Customization Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {customizationFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <ul className="space-y-1">
                    {feature.items.slice(0, 3).map((item) => (
                      <li key={item} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        {item}
                      </li>
                    ))}
                    {feature.items.length > 3 && (
                      <li className="text-xs text-primary font-medium">
                        +{feature.items.length - 3} mais
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Canvas Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="overflow-hidden border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Left Panel - Controls Mock */}
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Painel de Edição
                  </div>
                  
                  <div className="space-y-3">
                    {/* Mock Input */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Nome da Barbearia</label>
                      <div className="h-9 rounded-md border border-border bg-background px-3 flex items-center text-sm text-muted-foreground">
                        Barber Studio
                      </div>
                    </div>
                    
                    {/* Mock Color Picker */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Cor Principal</label>
                      <div className="flex gap-2">
                        {['#D97706', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'].map((color) => (
                          <div 
                            key={color}
                            className="w-8 h-8 rounded-lg cursor-pointer border-2 border-transparent hover:border-foreground/50 transition-colors"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mock Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">Modo Escuro</label>
                      <div className="w-11 h-6 rounded-full bg-primary relative">
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gap-2" disabled>
                    <Sparkles className="w-4 h-4" />
                    Salvar Template
                  </Button>
                </div>

                {/* Right Panel - Preview Mock */}
                <div className="flex-1 relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      Preview ao Vivo
                    </Badge>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <div className="h-32 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Scissors className="w-8 h-8 text-amber-500 mx-auto" />
                        <div className="text-lg font-bold text-foreground">Barber Studio</div>
                        <div className="text-xs text-muted-foreground">Tradição e Estilo</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 rounded bg-muted animate-pulse" />
                      <div className="h-12 rounded bg-muted animate-pulse" />
                      <div className="h-12 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReadyTemplatesTab;
