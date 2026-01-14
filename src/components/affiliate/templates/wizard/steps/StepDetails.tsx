import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Link2, Sparkles, Target, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

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
    <div className="space-y-5">
      {/* Target Audience */}
      <div className="space-y-2">
        <Label htmlFor="targetAudience" className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-primary" />
          Público-Alvo
          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">obrigatório</span>
        </Label>
        <Textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => updateFormData({ targetAudience: e.target.value })}
          placeholder="Ex: Homens de 25-45 anos que buscam cortes modernos..."
          className="min-h-[60px] resize-none text-sm"
        />
      </div>

      {/* Business Description */}
      <div className="space-y-2">
        <Label htmlFor="businessDescription" className="text-sm font-semibold flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          Descrição do Negócio
          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">obrigatório</span>
        </Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => updateFormData({ businessDescription: e.target.value })}
          placeholder="Descreva o negócio, serviços, diferenciais..."
          className="min-h-[80px] resize-none text-sm"
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {formData.businessDescription.length} caracteres
        </p>
      </div>

      {/* Unique Selling Points */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Diferenciais (opcional)
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={newUsp}
            onChange={(e) => setNewUsp(e.target.value)}
            placeholder="Ex: Atendimento 24h"
            className="text-sm h-9"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUsp())}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUsp}
            disabled={!newUsp.trim()}
            className="h-9 px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.uniqueSellingPoints.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {formData.uniqueSellingPoints.map((usp) => (
              <motion.span
                key={usp}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {usp}
                <button
                  type="button"
                  onClick={() => removeUsp(usp)}
                  className="ml-0.5 hover:text-amber-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Inspiration URLs */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-blue-500" />
          Inspiração (opcional)
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://exemplo.com"
            type="url"
            className="text-sm h-9"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInspiration())}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInspiration}
            disabled={!newUrl.trim()}
            className="h-9 px-3"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.inspirationUrls.length > 0 && (
          <div className="space-y-1">
            {formData.inspirationUrls.map((url) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-1.5 bg-muted/50 rounded"
              >
                <Link2 className="w-3 h-3 text-blue-500 shrink-0" />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate flex-1"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => removeInspiration(url)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      >
        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Resumo
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Negócio:</span>
            <p className="font-medium truncate">{formData.businessName || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <p className="font-medium capitalize">{formData.projectType || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Estilo:</span>
            <p className="font-medium capitalize truncate">
              {formData.visualStyle?.split('-')[0] || '-'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Features:</span>
            <p className="font-medium">{formData.features.length} selecionadas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
