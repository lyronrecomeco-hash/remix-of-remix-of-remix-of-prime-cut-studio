import { LucideIcon } from 'lucide-react';

interface FeatureHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureHeader = ({ icon: Icon, title, description }: FeatureHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
