import { motion } from 'framer-motion';
import { Globe, Coins, Clock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { LANGUAGES, CURRENCIES, TIMEZONES } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepLanguage() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <ScrollArea className="h-[350px] pr-2">
      <div className="space-y-5">
        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4 text-primary" />
            Idioma Principal
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = formData.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => updateFormData('language', lang.code)}
                  className={`relative p-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl block">{lang.flag}</span>
                  <span className="text-[10px] text-muted-foreground">{lang.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Language Input */}
          {formData.language === 'other' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <Input
                value={formData.customLanguage || ''}
                onChange={(e) => updateFormData('customLanguage', e.target.value)}
                placeholder="Ex: Holandês, Sueco..."
                className="bg-white/5 border-white/10 h-9 max-w-xs"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Currency */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-sm font-medium">
            <Coins className="w-4 h-4 text-primary" />
            Moeda
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {CURRENCIES.map((currency) => {
              const isSelected = formData.currency === currency.code;
              return (
                <button
                  key={currency.code}
                  onClick={() => updateFormData('currency', currency.code)}
                  className={`relative p-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-lg font-bold block">{currency.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{currency.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Timezone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-primary" />
            Fuso Horário
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMEZONES.map((tz) => {
              const isSelected = formData.timezone === tz.code;
              return (
                <button
                  key={tz.code}
                  onClick={() => updateFormData('timezone', tz.code)}
                  className={`relative p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-medium">{tz.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
