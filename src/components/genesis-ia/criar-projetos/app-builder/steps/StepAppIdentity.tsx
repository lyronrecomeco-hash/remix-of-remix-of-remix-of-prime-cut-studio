import { motion } from 'framer-motion';
import { Sparkles, Building2, MessageSquareQuote, Users } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function StepAppIdentity() {
  const { formData, updateFormData, getCurrentAppType } = useAppBuilder();
  const appType = getCurrentAppType();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Identidade do App
        </h3>
        <p className="text-sm text-muted-foreground">
          Dê nome e personalidade ao seu {appType?.name || 'aplicativo'}
        </p>
      </div>

      <div className="grid gap-4">
        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <Label className="text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Nome do App *
          </Label>
          <Input
            value={formData.appName}
            onChange={(e) => updateFormData('appName', e.target.value)}
            placeholder={`Ex: ${appType?.name === 'E-commerce' ? 'Loja Plus' : appType?.name === 'Delivery' ? 'Delivery Express' : 'Meu App'}`}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label className="text-sm text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Nome da Empresa
          </Label>
          <Input
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Ex: Tech Solutions Ltda"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </motion.div>

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label className="text-sm text-white flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-primary" />
            Slogan (opcional)
          </Label>
          <Input
            value={formData.slogan}
            onChange={(e) => updateFormData('slogan', e.target.value)}
            placeholder="Ex: Inovação que transforma"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </motion.div>

        {/* Target Audience */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label className="text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Público-alvo
          </Label>
          <Textarea
            value={formData.targetAudience}
            onChange={(e) => updateFormData('targetAudience', e.target.value)}
            placeholder={`Ex: ${
              appType?.id === 'ecommerce' 
                ? 'Jovens adultos interessados em moda sustentável' 
                : appType?.id === 'saas' 
                  ? 'Pequenas e médias empresas que buscam automação' 
                  : 'Descreva quem usará seu app'
            }`}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
          />
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
      >
        <p className="text-xs text-primary flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            O nome do app aparecerá na barra de título e nas telas de login. 
            Escolha algo memorável e fácil de pronunciar!
          </span>
        </p>
      </motion.div>
    </div>
  );
}
