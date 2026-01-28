import React from 'react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
  'Português (Brasil)',
  'Português (Portugal)',
  'English (US)',
  'English (UK)',
  'Español',
  'Français',
  'Deutsch',
  'Italiano',
];

export const StepIdentity: React.FC = () => {
  const { formData, updateFormData } = useProjectBuilder();

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-10">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Identidade do Projeto
        </h3>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto px-2">
          Informações básicas sobre seu negócio
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Project Name */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="projectName" className="text-sm sm:text-base font-medium">
              Nome do Projeto *
            </Label>
            <Input
              id="projectName"
              placeholder="Ex: Pizza Express"
              value={formData.projectName}
              onChange={(e) => updateFormData('projectName', e.target.value)}
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="companyName" className="text-sm sm:text-base font-medium">
              Nome da Empresa *
            </Label>
            <Input
              id="companyName"
              placeholder="Ex: Pizza Express Ltda"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          {/* City/Region & Target Audience - Side by Side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="cityRegion" className="text-sm sm:text-base font-medium">
                Cidade / Região
              </Label>
              <Input
                id="cityRegion"
                placeholder="Ex: São Paulo, SP"
                value={formData.cityRegion}
                onChange={(e) => updateFormData('cityRegion', e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="targetAudience" className="text-sm sm:text-base font-medium">
                Público-Alvo
              </Label>
              <Input
                id="targetAudience"
                placeholder="Ex: Jovens adultos, famílias"
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">Idioma Principal</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => updateFormData('language', value)}
            >
              <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-sm sm:text-base">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
