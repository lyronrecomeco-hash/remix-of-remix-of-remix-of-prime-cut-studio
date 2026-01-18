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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Identidade do Projeto
        </h3>
        <p className="text-muted-foreground">
          Informações básicas sobre seu negócio
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName">Nome do Projeto *</Label>
          <Input
            id="projectName"
            placeholder="Ex: Pizza Express"
            value={formData.projectName}
            onChange={(e) => updateFormData('projectName', e.target.value)}
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Nome da Empresa *</Label>
          <Input
            id="companyName"
            placeholder="Ex: Pizza Express Ltda"
            value={formData.companyName}
            onChange={(e) => updateFormData('companyName', e.target.value)}
          />
        </div>

        {/* City/Region */}
        <div className="space-y-2">
          <Label htmlFor="cityRegion">Cidade / Região</Label>
          <Input
            id="cityRegion"
            placeholder="Ex: São Paulo, SP"
            value={formData.cityRegion}
            onChange={(e) => updateFormData('cityRegion', e.target.value)}
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Público-Alvo</Label>
          <Input
            id="targetAudience"
            placeholder="Ex: Jovens adultos, famílias"
            value={formData.targetAudience}
            onChange={(e) => updateFormData('targetAudience', e.target.value)}
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Idioma Principal</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => updateFormData('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
