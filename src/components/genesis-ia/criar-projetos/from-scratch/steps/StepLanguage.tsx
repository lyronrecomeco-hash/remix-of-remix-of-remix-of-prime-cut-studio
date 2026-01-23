import { motion } from 'framer-motion';
import { Globe, Coins, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { LANGUAGES, CURRENCIES, TIMEZONES } from '../types';

export function StepLanguage() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Idioma e Localização
        </h3>
        <p className="text-muted-foreground">
          Configure o idioma e formato regional do projeto
        </p>
      </div>

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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = formData.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => updateFormData('language', lang.code)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl block mb-1">{lang.flag}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Language Input */}
        {formData.language === 'other' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <label className="text-sm font-medium block mb-2">
              Digite o idioma
            </label>
            <Input
              value={formData.customLanguage || ''}
              onChange={(e) => updateFormData('customLanguage', e.target.value)}
              placeholder="Ex: Holandês, Sueco, Polonês..."
              className="bg-white/5 border-white/10"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Currency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-medium">
          <Coins className="w-4 h-4 text-primary" />
          Moeda
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CURRENCIES.map((currency) => {
            const isSelected = formData.currency === currency.code;
            return (
              <button
                key={currency.code}
                onClick={() => updateFormData('currency', currency.code)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xl font-bold block mb-1">{currency.symbol}</span>
                <span className="text-xs text-muted-foreground">{currency.name}</span>
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
        className="space-y-3"
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
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-sm font-medium block">{tz.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
