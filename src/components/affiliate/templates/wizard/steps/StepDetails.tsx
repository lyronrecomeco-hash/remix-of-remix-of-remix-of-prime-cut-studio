import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Link2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';

export const StepDetails: React.FC = () => {
  const { formData, updateFormData } = useWizard();
  const [newUrl, setNewUrl] = useState('');
  const [newUsp, setNewUsp] = useState('');

  const addInspiration = () => {
    if (newUrl.trim() && !formData.inspirationUrls.includes(newUrl.trim())) {
      updateFormData({ 
        inspirationUrls: [...formData.inspirationUrls, newUrl.trim()] 
      });
      setNewUrl('');
    }
  };

  const removeInspiration = (url: string) => {
    updateFormData({ 
      inspirationUrls: formData.inspirationUrls.filter(u => u !== url) 
    });
  };

  const addUsp = () => {
    if (newUsp.trim() && !formData.uniqueSellingPoints.includes(newUsp.trim())) {
      updateFormData({ 
        uniqueSellingPoints: [...formData.uniqueSellingPoints, newUsp.trim()] 
      });
      setNewUsp('');
    }
  };

  const removeUsp = (usp: string) => {
    updateFormData({ 
      uniqueSellingPoints: formData.uniqueSellingPoints.filter(u => u !== usp) 
    });
  };

  return (
    <div className="space-y-6">
      {/* Target Audience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Label htmlFor="targetAudience" className="text-base font-medium">
          Público-Alvo *
        </Label>
        <Textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => updateFormData({ targetAudience: e.target.value })}
          placeholder="Descreva o público-alvo do negócio. Ex: Homens de 25-45 anos, profissionais que buscam praticidade..."
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Ajuda a IA a criar conteúdo direcionado
        </p>
      </motion.div>

      {/* Business Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label htmlFor="businessDescription" className="text-base font-medium">
          Descrição do Negócio *
        </Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => updateFormData({ businessDescription: e.target.value })}
          placeholder="Descreva o negócio, serviços oferecidos, diferenciais, história..."
          className="min-h-[120px] resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Quanto mais detalhes, melhor o resultado
          </p>
          <span className="text-xs text-muted-foreground">
            {formData.businessDescription.length} caracteres
          </span>
        </div>
      </motion.div>

      {/* Unique Selling Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label className="text-base font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Diferenciais do Negócio
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={newUsp}
            onChange={(e) => setNewUsp(e.target.value)}
            placeholder="Ex: Atendimento 24h, Entrega grátis..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUsp())}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addUsp}
            disabled={!newUsp.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.uniqueSellingPoints.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.uniqueSellingPoints.map((usp, index) => (
              <motion.span
                key={usp}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-full text-sm"
              >
                <Sparkles className="w-3 h-3" />
                {usp}
                <button
                  type="button"
                  onClick={() => removeUsp(usp)}
                  className="ml-1 hover:text-amber-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Inspiration URLs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <Label className="text-base font-medium flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-500" />
          Sites de Inspiração (opcional)
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://exemplo.com"
            type="url"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInspiration())}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addInspiration}
            disabled={!newUrl.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.inspirationUrls.length > 0 && (
          <div className="space-y-2">
            {formData.inspirationUrls.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
              >
                <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => removeInspiration(url)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Adicione links de sites que você gostaria de usar como referência
        </p>
      </motion.div>

      {/* Summary Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      >
        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Resumo do Template
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Negócio:</span>
            <p className="font-medium">{formData.businessName || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <p className="font-medium capitalize">{formData.projectType || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Estilo:</span>
            <p className="font-medium capitalize">
              {formData.visualStyle?.replace(/-/g, ' ') || '-'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Funcionalidades:</span>
            <p className="font-medium">{formData.features.length} selecionadas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
