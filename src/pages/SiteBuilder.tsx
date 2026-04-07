import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone,
  MessageSquare, Clock, Plus, Check, Globe, Layers,
  Zap, X, LayoutGrid, Server, Database, FileCode,
  FolderOpen, ChevronRight, Sparkles, Play
} from 'lucide-react';
import genesisLogo from '@/assets/genesis-logo.png';
import GenesisBackground from '@/components/genesis-ia/GenesisBackground';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  messages: ChatMessage[];
  generatedCode: string;
  streamingCode: string;
  createdAt: Date;
  updatedAt: Date;
  snapshots?: string[];
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type CenterMode = 'preview' | 'code' | 'structure';
type BuildStage =
  | 'idle'
  | 'entendendo_prompt'
  | 'definindo_arquitetura'
  | 'planejando_layout'
  | 'criando_secoes'
  | 'gerando_conteudo'
  | 'construindo_componentes'
  | 'estruturando_backend'
  | 'criando_rotas'
  | 'configurando_banco'
  | 'ajustando_responsividade'
  | 'refinando_experiencia'
  | 'finalizando'
  | 'pronto'
  | 'erro';

/* ─── Helpers ─── */
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genesis-site-builder`;
const STORAGE_KEY = 'genesis_site_builder_projects';
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function extractHtml(text: string): string {
  const codeBlockMatch = text.match(/```html?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const docMatch = text.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (docMatch) return docMatch[1].trim();
  return '';
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((p: any) => ({
      ...p,
      streamingCode: p.streamingCode || '',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      messages: p.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch { return []; }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/* ─── Stage metadata ─── */
const STAGE_META: Record<BuildStage, { label: string; icon: string; pct: number; category: 'understand' | 'frontend' | 'backend' | 'finalize' }> = {
  idle:                     { label: '',                              icon: '',   pct: 0,   category: 'understand' },
  entendendo_prompt:        { label: 'Entendendo seu pedido',         icon: '🧠', pct: 5,   category: 'understand' },
  definindo_arquitetura:    { label: 'Definindo a arquitetura',       icon: '📐', pct: 12,  category: 'understand' },
  planejando_layout:        { label: 'Planejando o layout',           icon: '🎨', pct: 22,  category: 'frontend' },
  criando_secoes:           { label: 'Criando as seções',             icon: '🧩', pct: 32,  category: 'frontend' },
  gerando_conteudo:         { label: 'Gerando conteúdo',              icon: '✍️', pct: 42,  category: 'frontend' },
  construindo_componentes:  { label: 'Construindo componentes',       icon: '⚡', pct: 52,  category: 'frontend' },
  estruturando_backend:     { label: 'Estruturando backend',          icon: '🔧', pct: 62,  category: 'backend' },
  criando_rotas:            { label: 'Criando rotas e APIs',          icon: '🔗', pct: 72,  category: 'backend' },
  configurando_banco:       { label: 'Configurando banco de dados',   icon: '💾', pct: 80,  category: 'backend' },
  ajustando_responsividade: { label: 'Ajustando responsividade',      icon: '📱', pct: 88,  category: 'finalize' },
  refinando_experiencia:    { label: 'Refinando a experiência',       icon: '✨', pct: 93,  category: 'finalize' },
  finalizando:              { label: 'Finalizando o build',           icon: '🚀', pct: 98,  category: 'finalize' },
  pronto:                   { label: 'Build concluído!',              icon: '✅', pct: 100, category: 'finalize' },
  erro:                     { label: 'Erro na geração',               icon: '❌', pct: 0,   category: 'finalize' },
};

const STAGE_ORDER: BuildStage[] = [
  'entendendo_prompt', 'definindo_arquitetura', 'planejando_layout',
  'criando_secoes', 'gerando_conteudo', 'construindo_componentes',
  'estruturando_backend', 'criando_rotas', 'configurando_banco',
  'ajustando_responsividade', 'refinando_experiencia', 'finalizando', 'pronto',
];

function inferStage(charCount: number): BuildStage {
  if (charCount < 80) return 'entendendo_prompt';
  if (charCount < 300) return 'definindo_arquitetura';
  if (charCount < 800) return 'planejando_layout';
  if (charCount < 2000) return 'criando_secoes';
  if (charCount < 3500) return 'gerando_conteudo';
  if (charCount < 5000) return 'construindo_componentes';
  if (charCount < 7000) return 'estruturando_backend';
  if (charCount < 9000) return 'criando_rotas';
  if (charCount < 10500) return 'configurando_banco';
  if (charCount < 12000) return 'ajustando_responsividade';
  if (charCount < 14000) return 'refinando_experiencia';
  return 'finalizando';
}

/* ─── Skeleton Preview (shown during generation before real content) ─── */
const SkeletonPreview = memo(({ stage }: { stage: BuildStage }) => {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const showNav = currentIdx >= 2;
  const showHero = currentIdx >= 3;
  const showFeatures = currentIdx >= 4;
  const showCta = currentIdx >= 5;
  const showFooter = currentIdx >= 6;

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-[hsl(0_0%_97%)]">
      {/* Skeleton Nav */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-4">
              <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-blue-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton Hero */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center px-8 py-16 text-center"
          >
            <div className="mb-3 h-8 w-80 animate-pulse rounded bg-gray-200" />
            <div className="mb-2 h-5 w-64 animate-pulse rounded bg-gray-100" />
            <div className="mb-6 h-5 w-48 animate-pulse rounded bg-gray-100" />
            <div className="flex gap-3">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-blue-200" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton Features */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 px-8 pb-12"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="rounded-xl border border-gray-100 bg-white p-5"
              >
                <div className="mb-3 h-8 w-8 animate-pulse rounded-lg bg-blue-50" />
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mb-1 h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton CTA */}
      <AnimatePresence>
        {showCta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-8 mb-8 flex flex-col items-center rounded-2xl bg-blue-50 px-6 py-10"
          >
            <div className="mb-3 h-6 w-56 animate-pulse rounded bg-blue-200" />
            <div className="mb-4 h-4 w-40 animate-pulse rounded bg-blue-100" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-blue-300" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton Footer */}
      <AnimatePresence>
        {showFooter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border-t border-gray-200 bg-gray-50 px-8 py-6"
          >
            <div className="flex justify-between">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage label overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 shadow-lg backdrop-blur-md"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-xs font-medium text-foreground/70">{STAGE_META[stage].label}</span>
        </motion.div>
      </div>
    </div>
  );
});
SkeletonPreview.displayName = 'SkeletonPreview';

/* ─── Live Code Editor (streams code as it arrives) ─── */
const LiveCodeEditor = memo(({ code, isStreaming }: { code: string; isStreaming: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = code.split('\n');

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [code, isStreaming]);

  const getLineClass = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<!--')) return 'text-muted-foreground/30';
    if (trimmed.startsWith('<') && trimmed.includes('class=')) return 'text-primary/60';
    if (trimmed.startsWith('<')) return 'text-sky-400/70';
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return 'text-muted-foreground/25';
    if (trimmed.startsWith('const ') || trimmed.startsWith('function ') || trimmed.startsWith('import ')) return 'text-purple-400/60';
    return 'text-foreground/40';
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Editor Chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-0.5">
          <FileCode className="h-3 w-3 text-primary/40" />
          <span className="font-mono text-[10px] text-muted-foreground/50">index.html</span>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-primary/60">Escrevendo...</span>
          </div>
        )}
      </div>

      {/* Code Lines */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-1 py-3 font-mono text-[11px] leading-[20px]">
        {lines.length === 0 || !code ? (
          <div className="flex h-full items-center justify-center text-muted-foreground/20 text-xs font-sans">
            O código aparecerá aqui durante a geração
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="flex hover:bg-secondary/20 px-2">
              <span className="mr-4 inline-block w-8 select-none text-right text-muted-foreground/15 text-[10px]">{i + 1}</span>
              <span className={getLineClass(line)}>{line || '\u00A0'}</span>
            </div>
          ))
        )}
        {isStreaming && (
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 0.5, repeat: Infinity }} className="flex px-2">
            <span className="mr-4 inline-block w-8 select-none text-right text-muted-foreground/15 text-[10px]">{lines.length + 1}</span>
            <span className="inline-block h-[14px] w-[7px] rounded-[1px] bg-primary/60" />
          </motion.div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-1">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/30">
          <span>HTML5</span>
          <span>Tailwind CSS</span>
        </div>
        <span className="text-[10px] text-muted-foreground/25">{lines.length} linhas • {(code.length / 1024).toFixed(1)}KB</span>
      </div>
    </div>
  );
});
LiveCodeEditor.displayName = 'LiveCodeEditor';

/* ─── Build Pipeline ─── */
const BuildPipeline = memo(({ stage }: { stage: BuildStage }) => {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const categories = [
    { key: 'understand', label: 'Análise', stages: STAGE_ORDER.filter(s => STAGE_META[s].category === 'understand') },
    { key: 'frontend', label: 'Frontend', stages: STAGE_ORDER.filter(s => STAGE_META[s].category === 'frontend') },
    { key: 'backend', label: 'Backend', stages: STAGE_ORDER.filter(s => STAGE_META[s].category === 'backend') },
    { key: 'finalize', label: 'Finalização', stages: STAGE_ORDER.filter(s => STAGE_META[s].category === 'finalize') },
  ];

  return (
    <div className="space-y-3">
      {categories.map(cat => (
        <div key={cat.key}>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">{cat.label}</p>
          <div className="space-y-0.5">
            {cat.stages.map(s => {
              const idx = STAGE_ORDER.indexOf(s);
              const done = idx < currentIdx || stage === 'pronto';
              const active = idx === currentIdx && stage !== 'pronto' && stage !== 'erro';
              return (
                <motion.div key={s} initial={false} animate={{ opacity: idx > currentIdx && stage !== 'pronto' ? 0.35 : 1 }} className="flex items-center gap-2 py-0.5">
                  {done ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                  ) : active ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                      <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border/50" />
                  )}
                  <span className={`text-[10px] leading-tight ${done ? 'text-primary/60' : active ? 'text-foreground/70 font-medium' : 'text-muted-foreground/30'}`}>
                    {STAGE_META[s].label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
BuildPipeline.displayName = 'BuildPipeline';

/* ─── Structure View ─── */
const StructureView = memo(({ code }: { code: string }) => {
  const sections: { label: string; icon: typeof Globe }[] = [];
  const sectionRegex = /<!--\s*[═─]*\s*(.+?)\s*[═─]*\s*-->/gi;
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(code)) !== null) {
    sections.push({ label: match[1].trim(), icon: LayoutGrid });
  }
  if (sections.length === 0) {
    ['header', 'nav', 'main', 'section', 'footer'].forEach(t => {
      const count = (code.match(new RegExp(`<${t}[\\s>]`, 'gi')) || []).length;
      for (let i = 0; i < count; i++) sections.push({ label: `<${t}>`, icon: LayoutGrid });
    });
  }

  const fileTree = [
    { name: 'src/', icon: FolderOpen, depth: 0 },
    { name: 'index.html', icon: FileCode, depth: 1 },
    { name: 'styles.css', icon: FileCode, depth: 1 },
    { name: 'app.js', icon: FileCode, depth: 1 },
    { name: 'components/', icon: FolderOpen, depth: 1 },
    { name: 'api/', icon: Server, depth: 1 },
    { name: 'database/', icon: Database, depth: 1 },
  ];

  return (
    <div className="flex h-full gap-3 overflow-auto">
      {/* File Tree */}
      <div className="w-48 flex-shrink-0 rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">Arquivos</p>
        <div className="space-y-0.5">
          {fileTree.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-foreground/50 hover:bg-secondary/30" style={{ paddingLeft: 8 + f.depth * 12 }}>
              <f.icon className="h-3 w-3 text-primary/30" />
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">Seções Detectadas</p>
        {sections.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground/20">Aguardando geração</div>
        ) : (
          <div className="space-y-1.5">
            {sections.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-primary/30" />
                <span className="text-[11px] text-foreground/50">{s.label}</span>
                <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/15" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
StructureView.displayName = 'StructureView';

/* ══════════════════════════════════════════════════════════════ */
/*                        MAIN PAGE                              */
/* ══════════════════════════════════════════════════════════════ */
export default function SiteBuilderPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [centerMode, setCenterMode] = useState<CenterMode>('preview');
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<'chat' | 'building'>('chat');
  const [buildStage, setBuildStage] = useState<BuildStage>('idle');
  const [liveHtml, setLiveHtml] = useState('');
  const [streamingCode, setStreamingCode] = useState('');
  const [chatLogs, setChatLogs] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLogs]);

  const createProject = useCallback((name?: string) => {
    const project: Project = {
      id: generateId(),
      name: name || `Projeto ${projects.length + 1}`,
      messages: [], generatedCode: '', streamingCode: '', snapshots: [],
      createdAt: new Date(), updatedAt: new Date(),
    };
    setProjects(prev => [project, ...prev]);
    setActiveProjectId(project.id);
    setShowHistory(false);
    setPhase('chat');
    return project.id;
  }, [projects.length]);

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) { setActiveProjectId(null); setPhase('chat'); }
  };

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
  }, []);

  const addLog = useCallback((log: string) => {
    setChatLogs(prev => [...prev, log]);
  }, []);

  /* ─── Send Message ─── */
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    let projectId = activeProjectId;
    if (!projectId) projectId = createProject(input.slice(0, 40));

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: input.trim(), timestamp: new Date() };
    const currentProject = projects.find(p => p.id === projectId);
    const allMessages = [...(currentProject?.messages || []), userMsg];
    updateProject(projectId!, { messages: allMessages });

    const prompt = input.trim();
    setInput('');
    setIsGenerating(true);
    setPhase('building');
    setCenterMode('preview');
    setLiveHtml('');
    setStreamingCode('');
    setChatLogs([]);
    setBuildStage('entendendo_prompt');
    addLog('🧠 Entendendo seu pedido...');

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), projectId }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      addLog('📐 Definindo a arquitetura...');

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';
      let lastStage: BuildStage = 'entendendo_prompt';
      const loggedStages = new Set<BuildStage>(['entendendo_prompt', 'definindo_arquitetura']);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamingCode(fullContent);

              const newStage = inferStage(fullContent.length);
              if (newStage !== lastStage && !loggedStages.has(newStage)) {
                setBuildStage(newStage);
                addLog(`${STAGE_META[newStage].icon} ${STAGE_META[newStage].label}`);
                loggedStages.add(newStage);
                lastStage = newStage;
              }

              const partialHtml = extractHtml(fullContent);
              if (partialHtml && partialHtml.length > 300) {
                setLiveHtml(partialHtml);
              }

              updateProject(projectId!, { generatedCode: extractHtml(fullContent) || '', streamingCode: fullContent });
            }
          } catch { /* partial */ }
        }
      }

      const finalHtml = extractHtml(fullContent);
      setBuildStage('pronto');
      addLog('✅ Build concluído! Seu site está pronto.');
      setLiveHtml(finalHtml);
      setStreamingCode(fullContent);

      const prevSnapshots = currentProject?.snapshots || [];
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant' as const, content: fullContent, timestamp: new Date() }],
        generatedCode: finalHtml || '',
        streamingCode: fullContent,
        name: currentProject?.name || prompt.slice(0, 40),
        snapshots: [...prevSnapshots, finalHtml].slice(-10),
      });
    } catch (err: any) {
      setBuildStage('erro');
      addLog(`❌ Erro: ${err.message}`);
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant', content: `❌ Erro: ${err.message}`, timestamp: new Date() }],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    const code = activeProject?.generatedCode || liveHtml;
    if (code) { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const downloadHtml = () => {
    const code = activeProject?.generatedCode;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${(activeProject?.name || 'site').replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const viewportWidths: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '375px' };
  const previewCode = liveHtml || activeProject?.generatedCode || '';
  const codeToShow = streamingCode || activeProject?.streamingCode || previewCode;

  const suggestions = [
    { icon: Globe, text: 'Site para barbearia moderna com agendamento online' },
    { icon: Layers, text: 'Landing page para clínica de estética premium' },
    { icon: Zap, text: 'Sistema de pizzaria com cardápio digital e painel admin' },
  ];

  /* ════════════════════════════════════════ */
  /*          INITIAL CHAT PHASE             */
  /* ════════════════════════════════════════ */
  if (phase === 'chat' && (!activeProject || activeProject.messages.length === 0)) {
    return (
      <div className="relative flex min-h-screen flex-col" style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}>
        <GenesisBackground />

        {/* Header - matching dashboard */}
        <header className="sticky top-0 z-40 border-b border-border backdrop-blur" style={{ backgroundColor: 'hsl(220 25% 10% / 0.8)' }}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/login/dashboard')} className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img src={genesisLogo} alt="Genesis" className="h-8 w-8" />
              <h1 className="text-sm font-bold text-foreground">Site Builder</h1>
            </div>
            {projects.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" /> Projetos ({projects.length})
              </Button>
            )}
          </div>
        </header>

        {/* History modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Seus Projetos</h3>
                  <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {projects.map(p => (
                    <div key={p.id} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-xs cursor-pointer hover:bg-secondary/50"
                      onClick={() => { setActiveProjectId(p.id); setShowHistory(false); setPhase('building'); setLiveHtml(p.generatedCode); setStreamingCode(p.streamingCode || p.generatedCode); setBuildStage(p.generatedCode ? 'pronto' : 'idle'); }}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-3.5 w-3.5 text-primary/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground/70">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground/50">{p.messages.length} msgs • {p.updatedAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-primary/5 blur-xl" />
                <img src={genesisLogo} alt="Genesis" className="relative h-16 w-16" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Genesis <span className="text-primary">Site Builder</span>
            </h1>
            <p className="mb-10 text-sm text-muted-foreground">
              Descreva o que deseja e a IA construirá frontend + backend em tempo real
            </p>

            <div className="mx-auto w-full max-w-xl">
              <div className="rounded-2xl border border-border bg-card/80 p-1 shadow-2xl backdrop-blur-xl transition-all focus-within:border-primary/30 focus-within:shadow-primary/10">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Descreva o site ou sistema que deseja criar..."
                  rows={3}
                  className="w-full resize-none bg-transparent px-5 py-4 text-sm text-foreground placeholder-muted-foreground/40 outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-[10px] text-muted-foreground/30">Shift+Enter nova linha</span>
                  <Button onClick={handleSend} disabled={!input.trim() || isGenerating} size="sm" className="gap-2">
                    {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Criar
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => setInput(s.text)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card/30 px-4 py-2.5 text-[11px] text-muted-foreground transition-all hover:border-primary/15 hover:bg-card/60 hover:text-foreground/60">
                  <s.icon className="h-3.5 w-3.5 text-primary/30" />
                  {s.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════ */
  /*        BUILDING PHASE — WORKSPACE       */
  /* ════════════════════════════════════════ */
  return (
    <div className="flex h-screen flex-col" style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}>
      <GenesisBackground />

      {/* ─── Header ─── */}
      <header className="relative z-30 flex items-center justify-between border-b border-border backdrop-blur" style={{ backgroundColor: 'hsl(220 25% 10% / 0.8)' }}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => { setPhase('chat'); setActiveProjectId(null); setBuildStage('idle'); setChatLogs([]); setLiveHtml(''); setStreamingCode(''); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={genesisLogo} alt="Genesis" className="h-6 w-6" />
          <div>
            <h1 className="text-xs font-semibold text-foreground/80">{activeProject?.name || 'Novo Projeto'}</h1>
            <p className="text-[10px] text-muted-foreground/40">Site Builder</p>
          </div>
          {buildStage !== 'idle' && (
            <Badge variant="outline" className="ml-2 text-[10px] gap-1.5">
              {isGenerating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
              {STAGE_META[buildStage].label}
            </Badge>
          )}
        </div>

        {/* Center: Mode Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
          {([
            { mode: 'preview' as CenterMode, icon: Eye, label: 'Preview' },
            { mode: 'code' as CenterMode, icon: Code2, label: 'Código' },
            { mode: 'structure' as CenterMode, icon: LayoutGrid, label: 'Estrutura' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => setCenterMode(mode)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] transition-all ${
                centerMode === mode ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground/50 hover:text-foreground/60'
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 px-4 py-2.5">
          {centerMode === 'preview' && (
            <div className="mr-2 hidden items-center gap-0.5 rounded-lg border border-border bg-secondary/30 p-0.5 md:flex">
              {([
                { mode: 'desktop' as ViewMode, icon: Monitor },
                { mode: 'tablet' as ViewMode, icon: Tablet },
                { mode: 'mobile' as ViewMode, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`rounded-md p-1.5 transition-all ${viewMode === mode ? 'bg-primary/15 text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground/60'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode} disabled={!previewCode}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadHtml} disabled={!activeProject?.generatedCode}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="ml-1 gap-1.5 text-[11px]" onClick={() => { setPhase('chat'); createProject(); }}>
            <Plus className="h-3 w-3" /> Novo
          </Button>
        </div>
      </header>

      {/* ─── Main Workspace ─── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* ── Left: Chat + Pipeline ── */}
        <div className="flex w-72 flex-shrink-0 flex-col border-r border-border bg-card/20 backdrop-blur-sm lg:w-80">
          {/* Chat Logs */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1.5">
              {/* User messages */}
              {activeProject?.messages.filter(m => m.role === 'user').map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end">
                  <div className="max-w-[90%] rounded-xl bg-primary/10 border border-primary/15 px-3 py-2 text-[12px] text-foreground/80">
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="mt-1 text-[9px] text-muted-foreground/25">{msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              ))}

              {/* Humanized logs */}
              {chatLogs.map((log, i) => (
                <motion.div key={`log-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-secondary/20 px-3 py-2">
                  <span className="text-[11px] text-foreground/60">{log}</span>
                </motion.div>
              ))}

              {isGenerating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} className="h-1 w-1 rounded-full bg-primary" />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground/40">{STAGE_META[buildStage].label}</span>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Pipeline */}
          {(isGenerating || buildStage !== 'idle') && (
            <div className="border-t border-border bg-card/30 p-3 max-h-64 overflow-y-auto">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30">Pipeline</p>
                <span className="text-[10px] text-primary/50">{STAGE_META[buildStage].pct}%</span>
              </div>
              {/* Progress bar */}
              <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div className="h-full rounded-full bg-primary/60" animate={{ width: `${STAGE_META[buildStage].pct}%` }} transition={{ duration: 0.5 }} />
              </div>
              <BuildPipeline stage={buildStage} />
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border bg-card/30 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2 transition-all focus-within:border-primary/25">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isGenerating ? 'Aguarde o build...' : 'Descreva alterações...'}
                rows={2} disabled={isGenerating}
                className="flex-1 resize-none bg-transparent text-xs text-foreground/70 placeholder-muted-foreground/30 outline-none disabled:opacity-40"
              />
              <Button size="icon" className="h-7 w-7 shrink-0" onClick={handleSend} disabled={!input.trim() || isGenerating}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Center: Preview / Code / Structure ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-auto p-3 lg:p-4">
            <AnimatePresence mode="wait">
              {centerMode === 'preview' && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full">
                  {previewCode ? (
                    <div className="relative mx-auto h-full" style={{ maxWidth: viewportWidths[viewMode] }}>
                      {isGenerating && (
                        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2.5 rounded-t-xl border-b border-primary/10 bg-card/90 px-4 py-2 backdrop-blur-md">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <span className="text-[11px] text-foreground/60">{STAGE_META[buildStage].label}</span>
                          <div className="ml-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
                            <motion.div className="h-full rounded-full bg-primary/50" animate={{ width: `${STAGE_META[buildStage].pct}%` }} transition={{ duration: 0.5 }} />
                          </div>
                        </div>
                      )}
                      <iframe srcDoc={previewCode} className="h-full w-full rounded-xl border border-border bg-white shadow-lg" sandbox="allow-scripts allow-same-origin" title="Preview" />
                    </div>
                  ) : isGenerating ? (
                    <SkeletonPreview stage={buildStage} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground/15">
                      <Eye className="mb-3 h-14 w-14" />
                      <p className="text-sm">O preview aparecerá aqui</p>
                      <p className="mt-1 text-xs text-muted-foreground/10">Descreva o que deseja no chat ao lado</p>
                    </div>
                  )}
                </motion.div>
              )}

              {centerMode === 'code' && (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <LiveCodeEditor code={codeToShow} isStreaming={isGenerating} />
                </motion.div>
              )}

              {centerMode === 'structure' && (
                <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <StructureView code={previewCode} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Bar */}
          <div className="relative z-10 flex items-center justify-between border-t border-border bg-card/30 backdrop-blur-sm px-4 py-1.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className={`h-1.5 w-1.5 rounded-full ${buildStage === 'pronto' ? 'bg-green-500' : buildStage === 'erro' ? 'bg-destructive' : isGenerating ? 'bg-primary animate-pulse' : 'bg-muted-foreground/20'}`} />
                <span className="text-muted-foreground/40">
                  {buildStage === 'pronto' ? 'Build concluído' : buildStage === 'erro' ? 'Erro' : isGenerating ? STAGE_META[buildStage].label : 'Pronto'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/25">
              <span>HTML5 + Tailwind CSS</span>
              {previewCode && <span>{(previewCode.length / 1024).toFixed(1)}KB</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
