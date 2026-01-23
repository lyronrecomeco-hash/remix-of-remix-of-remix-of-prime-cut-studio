import { motion } from 'framer-motion';
import { Building2, Type, MapPin, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFromScratch } from '../FromScratchContext';

export function StepIdentity() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          <Label className="text-xs flex items-center gap-1.5">
            <Type className="w-3 h-3 text-primary" />
            Nome do Projeto *
          </Label>
          <Input
            value={formData.projectName}
            onChange={(e) => updateFormData('projectName', e.target.value)}
            placeholder={selectedNiche ? `Ex: ${selectedNiche.name} Pro` : 'Ex: Meu Projeto'}
            className="bg-white/5 border-white/10 h-8 text-xs"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-1.5"
        >
          <Label className="text-xs flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-primary" />
            Nome da Empresa *
          </Label>
          <Input
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
            placeholder="Ex: Empresa XYZ"
            className="bg-white/5 border-white/10 h-8 text-xs"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Type className="w-3 h-3" />
            Slogan (opcional)
          </Label>
          <Input
            value={formData.slogan || ''}
            onChange={(e) => updateFormData('slogan', e.target.value)}
            placeholder="Ex: Inovação que transforma"
            className="bg-white/5 border-white/10 h-8 text-xs"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1.5"
        >
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Cidade/Região (opcional)
          </Label>
          <Input
            value={formData.cityRegion || ''}
            onChange={(e) => updateFormData('cityRegion', e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="bg-white/5 border-white/10 h-8 text-xs"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          Público-Alvo (opcional)
        </Label>
        <Textarea
          value={formData.targetAudience || ''}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          placeholder="Descreva seu público-alvo: idade, interesses, comportamento..."
          className="bg-white/5 border-white/10 min-h-[60px] text-xs resize-none"
        />
      </motion.div>
    </div>
  );
}
