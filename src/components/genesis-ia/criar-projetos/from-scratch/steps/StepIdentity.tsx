import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFromScratch } from '../FromScratchContext';

export function StepIdentity() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Informações do Projeto
        </h3>
        <p className="text-muted-foreground">
          Dados básicos sobre o negócio para personalizar o projeto
        </p>
      </div>

      <div className="grid gap-6">
        {/* Project Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="projectName" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Nome do Projeto *
          </Label>
          <Input
            id="projectName"
            value={formData.projectName}
            onChange={(e) => updateFormData('projectName', e.target.value)}
            placeholder={selectedNiche ? `Ex: ${selectedNiche.name} Premium` : 'Nome do seu projeto'}
            className="bg-white/5 border-white/10"
          />
          <p className="text-xs text-muted-foreground">
            Nome que aparecerá no título do site
          </p>
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="companyName" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Nome da Empresa/Estabelecimento *
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Ex: Bella Pizzaria, Studio Hair, etc."
            className="bg-white/5 border-white/10"
          />
        </motion.div>

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="slogan">
            Slogan ou Tagline (opcional)
          </Label>
          <Input
            id="slogan"
            value={formData.slogan}
            onChange={(e) => updateFormData('slogan', e.target.value)}
            placeholder="Ex: Sabor que conquista, Beleza que transforma"
            className="bg-white/5 border-white/10"
          />
        </motion.div>

        {/* City/Region */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="cityRegion" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            Cidade/Região (opcional)
          </Label>
          <Input
            id="cityRegion"
            value={formData.cityRegion}
            onChange={(e) => updateFormData('cityRegion', e.target.value)}
            placeholder="Ex: São Paulo - SP, Rio de Janeiro, etc."
            className="bg-white/5 border-white/10"
          />
        </motion.div>

        {/* Target Audience */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="targetAudience" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Público-Alvo (opcional)
          </Label>
          <Textarea
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => updateFormData('targetAudience', e.target.value)}
            placeholder="Ex: Jovens profissionais de 25-40 anos, famílias com pets, empresários locais..."
            className="bg-white/5 border-white/10 resize-none"
            rows={2}
          />
        </motion.div>
      </div>
    </div>
  );
}
