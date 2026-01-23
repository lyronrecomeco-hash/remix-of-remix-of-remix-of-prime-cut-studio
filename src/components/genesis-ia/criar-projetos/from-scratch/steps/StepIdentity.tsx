import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFromScratch } from '../FromScratchContext';

export function StepIdentity() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  return (
    <div className="grid gap-4 max-w-xl">
      {/* Project Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1.5"
      >
        <Label htmlFor="projectName" className="flex items-center gap-2 text-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Nome do Projeto *
        </Label>
        <Input
          id="projectName"
          value={formData.projectName}
          onChange={(e) => updateFormData('projectName', e.target.value)}
          placeholder={selectedNiche ? `Ex: ${selectedNiche.name} Premium` : 'Nome do seu projeto'}
          className="bg-white/5 border-white/10 h-9"
        />
      </motion.div>

      {/* Company Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-1.5"
      >
        <Label htmlFor="companyName" className="flex items-center gap-2 text-sm">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          Nome da Empresa *
        </Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => updateFormData('companyName', e.target.value)}
          placeholder="Ex: Bella Pizzaria, Studio Hair..."
          className="bg-white/5 border-white/10 h-9"
        />
      </motion.div>

      {/* Two columns for optional fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <Label htmlFor="slogan" className="text-sm text-muted-foreground">
            Slogan (opcional)
          </Label>
          <Input
            id="slogan"
            value={formData.slogan}
            onChange={(e) => updateFormData('slogan', e.target.value)}
            placeholder="Sabor que conquista..."
            className="bg-white/5 border-white/10 h-9"
          />
        </motion.div>

        {/* City/Region */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5"
        >
          <Label htmlFor="cityRegion" className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            Cidade (opcional)
          </Label>
          <Input
            id="cityRegion"
            value={formData.cityRegion}
            onChange={(e) => updateFormData('cityRegion', e.target.value)}
            placeholder="São Paulo - SP"
            className="bg-white/5 border-white/10 h-9"
          />
        </motion.div>
      </div>

      {/* Target Audience */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <Label htmlFor="targetAudience" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          Público-Alvo (opcional)
        </Label>
        <Textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          placeholder="Ex: Jovens profissionais de 25-40 anos..."
          className="bg-white/5 border-white/10 resize-none h-16"
          rows={2}
        />
      </motion.div>
    </div>
  );
}
