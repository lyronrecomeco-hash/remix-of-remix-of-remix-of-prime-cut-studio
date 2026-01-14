import { TemplateGallery } from '../prompt-builder/TemplateGallery';
import { NicheTemplate } from '../prompt-builder/types';
import { NICHE_TEMPLATES } from '../prompt-builder/templates';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  const handleSelectTemplate = (template: NicheTemplate) => {
    // TODO: Implement template selection action
    console.log('Template selecionado:', template.name);
  };

  return (
    <TemplateGallery 
      templates={NICHE_TEMPLATES}
      onSelect={handleSelectTemplate}
    />
  );
};
