import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, X, Layout } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { APP_SCREENS } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function StepAppScreens() {
  const { formData, updateFormData, getCurrentAppType } = useAppBuilder();
  const [newScreen, setNewScreen] = useState('');
  const appType = getCurrentAppType();

  const toggleScreen = (screenId: string) => {
    const current = formData.selectedScreens;
    if (current.includes(screenId)) {
      updateFormData('selectedScreens', current.filter(id => id !== screenId));
    } else {
      updateFormData('selectedScreens', [...current, screenId]);
    }
  };

  const addCustomScreen = () => {
    if (newScreen.trim() && !formData.customScreens.includes(newScreen.trim())) {
      updateFormData('customScreens', [...formData.customScreens, newScreen.trim()]);
      setNewScreen('');
    }
  };

  const removeCustomScreen = (screen: string) => {
    updateFormData('customScreens', formData.customScreens.filter(s => s !== screen));
  };

  // Sort screens: suggested first, then rest
  const suggestedIds = appType?.suggestedScreens || [];
  const sortedScreens = [...APP_SCREENS].sort((a, b) => {
    const aIsSuggested = suggestedIds.includes(a.id);
    const bIsSuggested = suggestedIds.includes(b.id);
    if (aIsSuggested && !bIsSuggested) return -1;
    if (!aIsSuggested && bIsSuggested) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Telas do App
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione as telas que seu {appType?.name || 'app'} terá
        </p>
      </div>

      {/* Selected count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {formData.selectedScreens.length} tela(s) selecionada(s)
        </span>
        {suggestedIds.length > 0 && (
          <span className="text-xs text-primary">
            ★ Sugeridas para {appType?.name}
          </span>
        )}
      </div>

      {/* Screens Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {sortedScreens.map((screen, index) => {
          const isSelected = formData.selectedScreens.includes(screen.id);
          const isSuggested = suggestedIds.includes(screen.id);

          return (
            <motion.button
              key={screen.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => toggleScreen(screen.id)}
              className={`
                relative p-3 rounded-xl border transition-all text-left
                ${isSelected 
                  ? 'bg-primary/10 border-primary' 
                  : isSuggested
                    ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}

              {isSuggested && !isSelected && (
                <div className="absolute top-2 right-2 text-primary text-xs">★</div>
              )}

              <div className="text-xl mb-2">{screen.icon}</div>
              <h4 className="text-xs font-medium text-white truncate">{screen.name}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{screen.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Screens */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-primary" />
          <span className="text-sm text-white">Telas Personalizadas</span>
        </div>

        {/* Custom screens list */}
        {formData.customScreens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.customScreens.map((screen) => (
              <motion.div
                key={screen}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30"
              >
                <span className="text-xs text-white">{screen}</span>
                <button
                  onClick={() => removeCustomScreen(screen)}
                  className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add custom screen */}
        <div className="flex gap-2">
          <Input
            value={newScreen}
            onChange={(e) => setNewScreen(e.target.value)}
            placeholder="Nome da tela personalizada..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCustomScreen()}
          />
          <Button
            onClick={addCustomScreen}
            disabled={!newScreen.trim()}
            size="sm"
            className="px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
