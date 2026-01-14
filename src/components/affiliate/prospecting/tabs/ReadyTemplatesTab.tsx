import { TemplatePortfolioSystem } from '@/components/affiliate/templates/TemplatePortfolioSystem';

interface ReadyTemplatesTabProps {
  affiliateId: string;
}

export const ReadyTemplatesTab = ({ affiliateId }: ReadyTemplatesTabProps) => {
  return <TemplatePortfolioSystem affiliateId={affiliateId} />;
};

export default ReadyTemplatesTab;
