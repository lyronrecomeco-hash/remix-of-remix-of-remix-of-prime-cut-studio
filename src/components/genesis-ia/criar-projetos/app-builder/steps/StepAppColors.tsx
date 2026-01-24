import { motion } from 'framer-motion';
import { Check, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { COLOR_PRESETS, ThemeMode } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StepAppColors() {
  const { formData, updateFormData } = useAppBuilder();

  const themes: { id: ThemeMode; name: string; icon: React.ElementType }[] = [
    { id: 'light', name: 'Claro', icon: Sun },
    { id: 'dark', name: 'Escuro', icon: Moon },
    { id: 'auto', name: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Cores & Tema
        </h3>
        <p className="text-sm text-muted-foreground">
          Personalize o visual do seu app (veja em tempo real!)
        </p>
      </div>

      {/* Color Presets */}
      <div className="space-y-3">
        <Label className="text-sm text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          Paletas Prontas
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {COLOR_PRESETS.map((preset, index) => {
            const isSelected = formData.primaryColor === preset.primary;
            return (
              <motion.button
                key={preset.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  updateFormData('primaryColor', preset.primary);
                  updateFormData('secondaryColor', preset.secondary);
                  updateFormData('accentColor', preset.accent);
                }}
                className={`
                  relative p-3 rounded-xl border transition-all
                  ${isSelected 
                    ? 'border-white shadow-lg' 
                    : 'border-white/10 hover:border-white/30'
                  }
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <Check className="w-3 h-3 text-black" />
                  </motion.div>
                )}
                
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-[10px] text-white/70 truncate">{preset.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label className="text-xs text-white/70">Primária</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => updateFormData('primaryColor', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => updateFormData('primaryColor', e.target.value)}
              className="bg-white/5 border-white/10 text-white text-xs font-mono uppercase"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label className="text-xs text-white/70">Secundária</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => updateFormData('secondaryColor', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <Input
              value={formData.secondaryColor}
              onChange={(e) => updateFormData('secondaryColor', e.target.value)}
              className="bg-white/5 border-white/10 text-white text-xs font-mono uppercase"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label className="text-xs text-white/70">Destaque</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => updateFormData('accentColor', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <Input
              value={formData.accentColor}
              onChange={(e) => updateFormData('accentColor', e.target.value)}
              className="bg-white/5 border-white/10 text-white text-xs font-mono uppercase"
            />
          </div>
        </motion.div>
      </div>

      {/* Theme Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <Label className="text-sm text-white">Tema Padrão</Label>
        <div className="flex gap-2">
          {themes.map((theme) => {
            const isSelected = formData.themeMode === theme.id;
            const Icon = theme.icon;
            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFormData('themeMode', theme.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all
                  ${isSelected 
                    ? 'bg-primary/20 border-primary text-white' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{theme.name}</span>
                {isSelected && <Check className="w-4 h-4 ml-1" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
