import { 
  Search, 
  MessageCircle, 
  FileText, 
  Handshake, 
  CheckCircle2, 
  BarChart3,
  Radar,
  BookOpen,
  Phone,
  Code2,
  Users,
  Zap
} from 'lucide-react';

export interface ResourceLink {
  id: string;
  name: string;
  description: string;
  tab: string;
  icon: React.ElementType;
}

// Mapeamento de tipos de ação para recursos do painel
export const ACTION_TYPE_RESOURCES: Record<string, ResourceLink> = {
  prospecting: {
    id: 'prospects',
    name: 'Buscar Clientes',
    description: 'Encontre novos leads qualificados',
    tab: 'prospects',
    icon: Search
  },
  'follow-up': {
    id: 'accepted_proposals',
    name: 'Leads Aceitos',
    description: 'Gerencie seus follow-ups',
    tab: 'accepted_proposals',
    icon: MessageCircle
  },
  proposal: {
    id: 'proposals',
    name: 'Propostas Personalizadas',
    description: 'Crie propostas com IA',
    tab: 'proposals',
    icon: FileText
  },
  negotiation: {
    id: 'academia',
    name: 'Academia Genesis',
    description: 'Scripts de negociação',
    tab: 'academia',
    icon: BookOpen
  },
  closing: {
    id: 'contracts',
    name: 'Contratos',
    description: 'Finalize seus fechamentos',
    tab: 'contracts',
    icon: CheckCircle2
  },
  analysis: {
    id: 'radar',
    name: 'Radar Global',
    description: 'Analise seus resultados',
    tab: 'radar',
    icon: BarChart3
  }
};

// Recursos adicionais disponíveis
export const ADDITIONAL_RESOURCES: ResourceLink[] = [
  {
    id: 'phone-training',
    name: 'Treinamento Ligação',
    description: 'Scripts e simulação de chamadas',
    tab: 'academia',
    icon: Phone
  },
  {
    id: 'page-builder',
    name: 'Criador de Páginas',
    description: 'Landing pages com IA',
    tab: 'page-builder',
    icon: Code2
  },
  {
    id: 'criar-projetos',
    name: 'Biblioteca de Projetos',
    description: 'Templates prontos',
    tab: 'criar-projetos',
    icon: Zap
  }
];

// Função para obter recurso baseado no tipo de ação
export const getResourceForAction = (actionType: string, linkedResource?: string): ResourceLink | null => {
  if (linkedResource && ACTION_TYPE_RESOURCES[linkedResource]) {
    return ACTION_TYPE_RESOURCES[linkedResource];
  }
  return ACTION_TYPE_RESOURCES[actionType] || null;
};

// Função para obter todos os recursos recomendados para uma missão
export const getRecommendedResources = (actionTypes: string[]): ResourceLink[] => {
  const uniqueResources = new Map<string, ResourceLink>();
  
  actionTypes.forEach(type => {
    const resource = ACTION_TYPE_RESOURCES[type];
    if (resource && !uniqueResources.has(resource.id)) {
      uniqueResources.set(resource.id, resource);
    }
  });
  
  return Array.from(uniqueResources.values());
};
