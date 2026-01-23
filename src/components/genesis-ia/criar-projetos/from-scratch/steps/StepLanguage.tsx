import { motion } from 'framer-motion';
import { Globe, Coins, Clock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { LANGUAGES, CURRENCIES, TIMEZONES } from '../types';

export function StepLanguage() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-5">
      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <Globe className="w-4 h-4 text-primary" />
          Idioma Principal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = formData.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => updateFormData('language', lang.code)}
                className={`relative p-3 sm:p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl block mb-1">{lang.flag}</span>
                <span className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{lang.name}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
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
              className="bg-white/5 border-white/10 h-10 text-sm"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Currency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <Coins className="w-4 h-4 text-primary" />
          Moeda
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {CURRENCIES.map((currency) => {
            const isSelected = formData.currency === currency.code;
            return (
              <button
                key={currency.code}
                onClick={() => updateFormData('currency', currency.code)}
                className={`relative p-3 sm:p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-lg sm:text-xl font-bold block">{currency.symbol}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{currency.name}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
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
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-primary" />
          Fuso Horário
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {TIMEZONES.map((tz) => {
            const isSelected = formData.timezone === tz.code;
            return (
              <button
                key={tz.code}
                onClick={() => updateFormData('timezone', tz.code)}
                className={`relative p-3 sm:p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-sm font-medium">{tz.name}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
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
