import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATE_MODELS, TEMPLATE_CATEGORIES, TemplateModel, TemplateCategory } from './templateModels';
import { TemplateQuickForm } from './TemplateQuickForm';

interface TemplateModelSelectorProps {
  onBack: () => void;
  onComplete: () => void;
  affiliateId?: string;
}

export function TemplateModelSelector({ onBack, onComplete, affiliateId }: TemplateModelSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateModel | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = selectedCategory === 'all'
    ? TEMPLATE_MODELS
    : TEMPLATE_MODELS.filter(t => t.category === selectedCategory);

  if (showForm && selectedTemplate) {
    return (
      <TemplateQuickForm
        template={selectedTemplate}
        onBack={() => setShowForm(false)}
        onComplete={onComplete}
        affiliateId={affiliateId}
      />
    );
  }

  return (
    <div className="space-y-0 px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold leading-tight">Escolher Modelo</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Selecione o nicho do projeto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 px-3 sm:px-4 py-2 bg-white/5 border-x border-white/10">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          Todos
        </button>
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="p-3 sm:p-4 rounded-b-xl bg-white/5 border border-white/10 border-t-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, index) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <motion.button
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedTemplate(template)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={template.image}
                      alt={template.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                      <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white">
                        {template.category === 'site' ? 'Site' : 'App'}
                      </span>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
                      </motion.div>
                    )}

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                        {template.name}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-white/70 line-clamp-1 mt-0.5">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {selectedTemplate ? (
              <>Selecionado: <span className="font-medium text-foreground">{selectedTemplate.name}</span></>
            ) : (
              'Selecione um modelo para continuar'
            )}
          </p>
          <Button
            onClick={() => setShowForm(true)}
            disabled={!selectedTemplate}
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm gap-1.5"
          >
            Continuar
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
