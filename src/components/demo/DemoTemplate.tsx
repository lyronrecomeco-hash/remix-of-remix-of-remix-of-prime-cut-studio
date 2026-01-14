import { useEffect } from 'react';
import type { TemplateConfig } from '@/components/affiliate/templates/types';
import DemoHeader from './DemoHeader';
import DemoHero from './DemoHero';
import DemoServices from './DemoServices';
import DemoFooter from './DemoFooter';

interface DemoTemplateProps {
  config: TemplateConfig;
  templateSlug: string;
}

export default function DemoTemplate({ config, templateSlug }: DemoTemplateProps) {
  // Aplicar cores customizadas via CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Converter hex para HSL para as CSS variables
    const hexToHSL = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '';
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Aplicar cores customizadas
    if (config.branding.primaryColor) {
      root.style.setProperty('--primary', hexToHSL(config.branding.primaryColor));
    }
    if (config.branding.secondaryColor) {
      root.style.setProperty('--secondary', hexToHSL(config.branding.secondaryColor));
    }
    if (config.branding.accentColor) {
      root.style.setProperty('--accent', hexToHSL(config.branding.accentColor));
    }

    // Aplicar fontes customizadas
    if (config.typography.headingFont) {
      root.style.setProperty('--font-heading', config.typography.headingFont);
    }
    if (config.typography.bodyFont) {
      root.style.setProperty('--font-body', config.typography.bodyFont);
    }

    // Cleanup ao desmontar
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--font-heading');
      root.style.removeProperty('--font-body');
    };
  }, [config]);

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        fontFamily: config.typography.bodyFont || 'inherit',
      }}
    >
      <DemoHeader config={config} />
      <DemoHero config={config} />
      {config.features.showPricing && <DemoServices config={config} />}
      <DemoFooter config={config} />
    </div>
  );
}
