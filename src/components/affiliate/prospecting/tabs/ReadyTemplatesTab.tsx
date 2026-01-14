import { TemplatePortfolioSystem } from '@/components/affiliate/templates/TemplatePortfolioSystem';

interface ReadyTemplatesTabProps {
  affiliateId: string;
  onEditorStateChange?: (isEditing: boolean) => void;
}

export const ReadyTemplatesTab = ({ affiliateId, onEditorStateChange }: ReadyTemplatesTabProps) => {
  return <TemplatePortfolioSystem affiliateId={affiliateId} onEditorStateChange={onEditorStateChange} />;
};

export default ReadyTemplatesTab;
