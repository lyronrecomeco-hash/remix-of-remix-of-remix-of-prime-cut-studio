import { motion } from 'framer-motion';
import { Globe, Coins, Clock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { LANGUAGES, CURRENCIES, TIMEZONES } from '../types';

export function StepLanguage() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-4">
      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <label className="flex items-center gap-2 text-xs font-medium">
          <Globe className="w-3.5 h-3.5 text-primary" />
          Idioma Principal
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = formData.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => updateFormData('language', lang.code)}
                className={`relative p-1.5 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-base block">{lang.flag}</span>
                <span className="text-[8px] text-muted-foreground">{lang.name}</span>
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {formData.language === 'other' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Input
              value={formData.customLanguage || ''}
              onChange={(e) => updateFormData('customLanguage', e.target.value)}
              placeholder="Ex: Holandês, Sueco..."
              className="bg-white/5 border-white/10 h-8 text-xs max-w-xs"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Currency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <label className="flex items-center gap-2 text-xs font-medium">
          <Coins className="w-3.5 h-3.5 text-primary" />
          Moeda
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
          {CURRENCIES.map((currency) => {
            const isSelected = formData.currency === currency.code;
            return (
              <button
                key={currency.code}
                onClick={() => updateFormData('currency', currency.code)}
                className={`relative p-1.5 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-sm font-bold block">{currency.symbol}</span>
                <span className="text-[8px] text-muted-foreground">{currency.name}</span>
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
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
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="flex items-center gap-2 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Fuso Horário
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
          {TIMEZONES.map((tz) => {
            const isSelected = formData.timezone === tz.code;
            return (
              <button
                key={tz.code}
                onClick={() => updateFormData('timezone', tz.code)}
                className={`relative p-1.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-[10px] font-medium">{tz.name}</span>
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
