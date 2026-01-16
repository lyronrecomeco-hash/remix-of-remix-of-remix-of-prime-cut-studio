export type ElementType = 'card' | 'text' | 'image' | 'spacer' | 'divider' | 'stat' | 'button';

export interface DashboardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: ElementContent;
  styles: ElementStyles;
  animation?: AnimationType;
}

export interface ElementContent {
  title?: string;
  description?: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  text?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonAction?: string;
  statValue?: string;
  statLabel?: string;
  link?: string;
}

export interface ElementStyles {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  fontSize?: number;
  fontWeight?: string;
  opacity?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradient?: {
    enabled: boolean;
    from: string;
    to: string;
    direction: string;
  };
}

export type AnimationType = 
  | 'none' 
  | 'fade-in' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'scale' 
  | 'bounce' 
  | 'pulse'
  | 'shake';

export interface DashboardLayout {
  id: string;
  name: string;
  elements: DashboardElement[];
  globalStyles: {
    backgroundColor?: string;
    backgroundGradient?: {
      enabled: boolean;
      from: string;
      to: string;
      direction: string;
    };
    gridColumns: number;
    gap: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EditorState {
  isEditMode: boolean;
  selectedElementId: string | null;
  copiedElement: DashboardElement | null;
  history: DashboardLayout[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
}

export const DEFAULT_ELEMENT_STYLES: ElementStyles = {
  backgroundColor: 'hsl(var(--card))',
  textColor: 'hsl(var(--foreground))',
  borderColor: 'hsl(var(--border))',
  borderRadius: 12,
  padding: 16,
  fontSize: 14,
  fontWeight: 'normal',
  opacity: 1,
  shadow: 'sm',
};

export const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'slide-up', label: 'Deslizar Cima' },
  { value: 'slide-down', label: 'Deslizar Baixo' },
  { value: 'slide-left', label: 'Deslizar Esquerda' },
  { value: 'slide-right', label: 'Deslizar Direita' },
  { value: 'scale', label: 'Escalar' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulsar' },
  { value: 'shake', label: 'Tremer' },
];

export const ELEMENT_TEMPLATES: Record<ElementType, Partial<DashboardElement>> = {
  card: {
    width: 300,
    height: 180,
    content: {
      title: 'Novo Card',
      description: 'Descrição do card',
      badge: 'Badge',
    },
    styles: { ...DEFAULT_ELEMENT_STYLES },
  },
  text: {
    width: 200,
    height: 60,
    content: {
      text: 'Texto editável',
    },
    styles: { ...DEFAULT_ELEMENT_STYLES, backgroundColor: 'transparent', shadow: 'none' },
  },
  image: {
    width: 200,
    height: 150,
    content: {
      imageUrl: '',
    },
    styles: { ...DEFAULT_ELEMENT_STYLES },
  },
  spacer: {
    width: 100,
    height: 50,
    content: {},
    styles: { backgroundColor: 'transparent', shadow: 'none' },
  },
  divider: {
    width: 300,
    height: 2,
    content: {},
    styles: { backgroundColor: 'hsl(var(--border))', shadow: 'none' },
  },
  stat: {
    width: 150,
    height: 100,
    content: {
      statValue: '0',
      statLabel: 'Estatística',
    },
    styles: { ...DEFAULT_ELEMENT_STYLES },
  },
  button: {
    width: 150,
    height: 45,
    content: {
      buttonText: 'Botão',
      buttonAction: '',
    },
    styles: { ...DEFAULT_ELEMENT_STYLES, backgroundColor: 'hsl(var(--primary))' },
  },
};
