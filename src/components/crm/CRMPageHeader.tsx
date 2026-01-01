import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CRMPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export default function CRMPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: CRMPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
