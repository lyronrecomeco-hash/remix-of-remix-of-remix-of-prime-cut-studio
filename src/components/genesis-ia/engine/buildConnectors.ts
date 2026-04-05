import lovableIcon from '@/assets/ai-icons/lovable.svg';
import v0Icon from '@/assets/ai-icons/v0.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';

export interface BuildConnector {
  id: string;
  name: string;
  description: string;
  icon?: string;
  url?: string;
  oneClick?: boolean;
  /** If defined, returns a URL that auto-submits the prompt */
  buildUrl?: (prompt: string) => string;
  /** Prefix added to prompt for this destination */
  promptPrefix?: string;
  /** Focus areas for this connector */
  focus: string[];
}

export const BUILD_CONNECTORS: BuildConnector[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'Build fullstack com 1 clique',
    icon: lovableIcon,
    oneClick: true,
    buildUrl: (prompt: string) => {
      const encoded = encodeURIComponent(prompt.trim());
      return `https://lovable.dev/invite/G0FY6YR?autosubmit=true#prompt=${encoded}`;
    },
    promptPrefix: '',
    focus: ['fullstack', 'frontend', 'backend', 'database', 'auth', 'deploy'],
  },
  {
    id: 'v0',
    name: 'V0 by Vercel',
    description: 'UI/Frontend focado em design',
    icon: v0Icon,
    url: 'https://v0.dev',
    buildUrl: (prompt: string) => {
      const encoded = encodeURIComponent(prompt.trim().slice(0, 8000));
      return `https://v0.dev/chat?q=${encoded}`;
    },
    promptPrefix: 'Foque na interface, UX, componentes visuais, responsividade e design system.',
    focus: ['frontend', 'ui', 'design', 'components'],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'IDE com IA para projetos completos',
    url: 'https://cursor.sh',
    promptPrefix: 'Gere a arquitetura completa com estrutura de pastas, services, hooks, APIs e banco.',
    focus: ['fullstack', 'architecture', 'backend', 'api'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'IDE com IA para devs avançados',
    icon: windsurfIcon,
    url: 'https://windsurf.com',
    promptPrefix: 'Estruture com arquitetura limpa, patterns, services e separação de concerns.',
    focus: ['fullstack', 'architecture', 'patterns'],
  },
  {
    id: 'trae',
    name: 'Trae',
    description: 'IDE com IA da ByteDance',
    url: 'https://trae.ai',
    promptPrefix: 'Gere a solução completa com foco em performance, escalabilidade e boas práticas.',
    focus: ['fullstack', 'performance', 'scalability'],
  },
  {
    id: 'bolt',
    name: 'Bolt.new',
    description: 'Build fullstack no navegador',
    url: 'https://bolt.new',
    buildUrl: (prompt: string) => {
      const encoded = encodeURIComponent(prompt.trim().slice(0, 8000));
      return `https://bolt.new/?prompt=${encoded}`;
    },
    promptPrefix: '',
    focus: ['fullstack', 'frontend', 'rapid'],
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'IDE online com deploy integrado',
    url: 'https://replit.com',
    promptPrefix: 'Estruture o projeto para deploy rápido com backend integrado.',
    focus: ['fullstack', 'deploy', 'rapid'],
  },
];
