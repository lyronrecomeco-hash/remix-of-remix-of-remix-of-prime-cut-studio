import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone, Sparkles,
  MessageSquare, Clock, Plus, Check, Globe, Layers,
  Zap, X, FolderOpen, FileCode, ChevronRight, LayoutGrid
} from 'lucide-react';
import genesisLogo from '@/assets/genesis-logo.png';

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
  createdAt: Date;
  updatedAt: Date;
  snapshots?: string[];
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type CenterMode = 'preview' | 'code' | 'structure';
type BuildStage =
  | 'idle'
  | 'entendendo_prompt'
  | 'planejando_estrutura'
  | 'definindo_layout'
  | 'criando_secoes'
  | 'gerando_conteudo'
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
const STAGE_META: Record<BuildStage, { label: string; pct: number }> = {
  idle: { label: '', pct: 0 },
  entendendo_prompt: { label: 'Entendendo seu pedido...', pct: 8 },
  planejando_estrutura: { label: 'Planejando a estrutura', pct: 18 },
  definindo_layout: { label: 'Definindo o layout', pct: 30 },
  criando_secoes: { label: 'Criando as seções', pct: 45 },
  gerando_conteudo: { label: 'Gerando o conteúdo', pct: 60 },
  ajustando_responsividade: { label: 'Ajustando responsividade', pct: 75 },
  refinando_experiencia: { label: 'Refinando a experiência', pct: 88 },
  finalizando: { label: 'Finalizando seu site', pct: 96 },
  pronto: { label: 'Seu site está pronto!', pct: 100 },
  erro: { label: 'Ocorreu um erro', pct: 0 },
};

const STAGE_ORDER: BuildStage[] = [
  'entendendo_prompt', 'planejando_estrutura', 'definindo_layout',
  'criando_secoes', 'gerando_conteudo', 'ajustando_responsividade',
  'refinando_experiencia', 'finalizando', 'pronto',
];

function inferStageFromProgress(charCount: number, isDone: boolean): BuildStage {
  if (isDone) return 'pronto';
  if (charCount < 100) return 'entendendo_prompt';
  if (charCount < 400) return 'planejando_estrutura';
  if (charCount < 1000) return 'definindo_layout';
  if (charCount < 3000) return 'criando_secoes';
  if (charCount < 6000) return 'gerando_conteudo';
  if (charCount < 9000) return 'ajustando_responsividade';
  if (charCount < 12000) return 'refinando_experiencia';
  return 'finalizando';
}

/* ─── Floating Particles Background ─── */
const FloatingParticles = memo(() => {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 12,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-48 -right-32 h-[500px] w-[500px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }} />
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
});
FloatingParticles.displayName = 'FloatingParticles';

/* ─── Build Pipeline (left panel, below chat) ─── */
const BuildPipeline = memo(({ stage }: { stage: BuildStage }) => {
  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="space-y-1">
      {STAGE_ORDER.map((s, i) => {
        const done = i < currentIdx || stage === 'pronto';
        const active = i === currentIdx && stage !== 'pronto';
        const pending = i > currentIdx;
        return (
          <motion.div
            key={s}
            initial={false}
            animate={{ opacity: pending ? 0.3 : 1 }}
            className="flex items-center gap-2.5 py-1"
          >
            {done ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : active ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-border" />
            )}
            <span className={`text-[11px] ${done ? 'text-primary/70' : active ? 'text-foreground/70 font-medium' : 'text-muted-foreground/40'}`}>
              {STAGE_META[s].label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
});
BuildPipeline.displayName = 'BuildPipeline';

/* ─── Structure View ─── */
const StructureView = memo(({ code }: { code: string }) => {
  const sections: { tag: string; label: string }[] = [];
  const sectionRegex = /<!--\s*[═─]*\s*(.+?)\s*[═─]*\s*-->/gi;
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(code)) !== null) {
    sections.push({ tag: 'section', label: match[1].trim() });
  }
  if (sections.length === 0) {
    // Fallback: detect semantic tags
    const tags = ['header', 'nav', 'main', 'section', 'footer'];
    tags.forEach(t => {
      const count = (code.match(new RegExp(`<${t}[\\s>]`, 'gi')) || []).length;
      for (let i = 0; i < count; i++) sections.push({ tag: t, label: `<${t}>` });
    });
  }

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">Estrutura do Site</p>
      {sections.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground/30 text-xs">
          Nenhuma estrutura detectada
        </div>
      ) : (
        <div className="space-y-1.5">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2.5"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-primary/40" />
              <span className="text-xs text-foreground/60">{s.label}</span>
              <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground/20" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});
StructureView.displayName = 'StructureView';

/* ─── Chat Log Item (humanized, never code) ─── */
const ChatLogItem = memo(({ msg, isGenerating }: { msg: ChatMessage; isGenerating: boolean }) => {
  const isUser = msg.role === 'user';

  // For assistant messages: never show code. Show status or summary.
  let displayContent = msg.content;
  if (!isUser) {
    const html = extractHtml(msg.content);
    if (html) {
      displayContent = '✅ Site gerado com sucesso! Confira o preview ao lado.';
    } else if (msg.content.startsWith('❌')) {
      displayContent = msg.content;
    } else if (msg.content.length > 300) {
      // Likely code being streamed - don't show it
      displayContent = '';
    }
  }

  if (!isUser && !displayContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
        isUser
          ? 'bg-primary/10 text-foreground/80 border border-primary/10'
          : 'bg-secondary/50 text-foreground/60 border border-border/50'
      }`}>
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
        <p className="mt-1 text-[10px] text-muted-foreground/30">
          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
});
ChatLogItem.displayName = 'ChatLogItem';

/* ─── Main Page ─── */
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
  const [chatLogs, setChatLogs] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeProject?.messages, chatLogs]);

  const createProject = useCallback((name?: string) => {
    const project: Project = {
      id: generateId(),
      name: name || `Projeto ${projects.length + 1}`,
      messages: [], generatedCode: '', snapshots: [],
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

  const addChatLog = useCallback((log: string) => {
    setChatLogs(prev => [...prev, log]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    let projectId = activeProjectId;
    if (!projectId) projectId = createProject(input.slice(0, 40));

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: input.trim(), timestamp: new Date() };
    const currentProject = projects.find(p => p.id === projectId);
    const allMessages = [...(currentProject?.messages || []), userMsg];
    updateProject(projectId!, { messages: allMessages });
    setInput('');
    setIsGenerating(true);
    setPhase('building');
    setCenterMode('preview');
    setLiveHtml('');
    setChatLogs([]);
    setBuildStage('entendendo_prompt');
    addChatLog('✦ Entendendo seu pedido...');

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

      addChatLog('✦ Planejando a estrutura...');

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';
      let lastStage: BuildStage = 'entendendo_prompt';
      let loggedStages = new Set<BuildStage>(['entendendo_prompt']);

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

              // Infer stage and log humanized messages
              const newStage = inferStageFromProgress(fullContent.length, false);
              if (newStage !== lastStage && !loggedStages.has(newStage)) {
                setBuildStage(newStage);
                addChatLog(`✦ ${STAGE_META[newStage].label}`);
                loggedStages.add(newStage);
                lastStage = newStage;
              }

              // Live preview: try to render partial HTML
              const partialHtml = extractHtml(fullContent);
              if (partialHtml && partialHtml.length > 200) {
                setLiveHtml(partialHtml);
              }

              // Update project silently (no code in chat)
              const html = extractHtml(fullContent);
              updateProject(projectId!, { generatedCode: html || '' });
            }
          } catch { /* partial JSON */ }
        }
      }

      const finalHtml = extractHtml(fullContent);
      setBuildStage('pronto');
      addChatLog('✅ Seu site está pronto!');
      setLiveHtml(finalHtml);

      // Save snapshot
      const prevSnapshots = currentProject?.snapshots || [];

      updateProject(projectId!, {
        messages: [
          ...allMessages,
          { id: generateId(), role: 'assistant' as const, content: fullContent, timestamp: new Date() },
        ],
        generatedCode: finalHtml || '',
        name: currentProject?.name || input.slice(0, 40),
        snapshots: [...prevSnapshots, finalHtml].slice(-10),
      });
    } catch (err: any) {
      setBuildStage('erro');
      addChatLog(`❌ Erro: ${err.message}`);
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant', content: `❌ Erro: ${err.message}`, timestamp: new Date() }],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    const code = activeProject?.generatedCode || liveHtml;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadHtml = () => {
    const code = activeProject?.generatedCode;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeProject?.name || 'site').replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewportWidths: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '375px' };

  const suggestions = [
    { icon: Globe, text: 'Site para barbearia moderna com agendamento online' },
    { icon: Layers, text: 'Landing page para clínica de estética premium' },
    { icon: Zap, text: 'Site de pizzaria com cardápio digital e pedidos' },
  ];

  const previewCode = liveHtml || activeProject?.generatedCode || '';

  /* ════════════════════════════════════════ */
  /*         CHAT PHASE (Initial)            */
  /* ════════════════════════════════════════ */
  if (phase === 'chat' && (!activeProject || activeProject.messages.length === 0)) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <FloatingParticles />

        {/* Top bar */}
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate('/login/dashboard')}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3.5 py-2 text-[11px] text-muted-foreground backdrop-blur-xl transition-all hover:bg-card hover:text-foreground/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          {projects.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3.5 py-2 text-[11px] text-muted-foreground backdrop-blur-xl transition-all hover:bg-card hover:text-foreground/70"
            >
              <Clock className="h-3.5 w-3.5" /> Projetos ({projects.length})
            </button>
          )}
        </div>

        {/* History modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground/80">Seus Projetos</h3>
                  <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-xs transition-all cursor-pointer hover:bg-secondary/50"
                      onClick={() => { setActiveProjectId(p.id); setShowHistory(false); setPhase('building'); setLiveHtml(p.generatedCode); setBuildStage(p.generatedCode ? 'pronto' : 'idle'); }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-3.5 w-3.5 text-primary/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground/60">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground/50">{p.messages.length} msgs • {p.updatedAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground/20 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5" />
              <img src={genesisLogo} alt="Genesis" className="relative h-12 w-12" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground/90 md:text-3xl">
            Genesis <span className="text-primary">Site Builder</span>
          </h1>
          <p className="mb-10 text-sm text-muted-foreground">
            Descreva seu site e a IA construirá tudo em tempo real
          </p>

          {/* Input */}
          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-2xl border border-border bg-card/60 p-1 shadow-xl backdrop-blur-xl transition-all focus-within:border-primary/20 focus-within:shadow-primary/5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Descreva o site que deseja criar..."
                rows={3}
                className="w-full resize-none bg-transparent px-5 py-4 text-sm text-foreground/80 placeholder-muted-foreground/40 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-[10px] text-muted-foreground/30">Shift+Enter para nova linha</span>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/20 px-5 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/25 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Criar Site
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => setInput(s.text)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/30 px-4 py-2.5 text-[11px] text-muted-foreground transition-all hover:border-primary/15 hover:bg-card/60 hover:text-foreground/60"
              >
                <s.icon className="h-3.5 w-3.5 text-primary/30" />
                {s.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ════════════════════════════════════════ */
  /*     BUILDING PHASE — Preview First      */
  /* ════════════════════════════════════════ */
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPhase('chat'); setActiveProjectId(null); setBuildStage('idle'); setChatLogs([]); setLiveHtml(''); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img src={genesisLogo} alt="Genesis" className="h-6 w-6" />
          <div className="hidden sm:block">
            <h1 className="text-xs font-semibold text-foreground/70">{activeProject?.name || 'Novo Projeto'}</h1>
            <p className="text-[10px] text-muted-foreground/50">Site Builder</p>
          </div>
        </div>

        {/* Center: Mode Tabs */}
        <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
          {([
            { mode: 'preview' as CenterMode, icon: Eye, label: 'Preview' },
            { mode: 'code' as CenterMode, icon: Code2, label: 'Código' },
            { mode: 'structure' as CenterMode, icon: LayoutGrid, label: 'Estrutura' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setCenterMode(mode)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] transition-all ${
                centerMode === mode
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Viewport + Actions */}
        <div className="flex items-center gap-1">
          {centerMode === 'preview' && (
            <div className="mr-2 hidden items-center gap-0.5 rounded-lg border border-border bg-secondary/30 p-0.5 md:flex">
              {([
                { mode: 'desktop' as ViewMode, icon: Monitor },
                { mode: 'tablet' as ViewMode, icon: Tablet },
                { mode: 'mobile' as ViewMode, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md p-1.5 transition-all ${
                    viewMode === mode ? 'bg-primary/10 text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
          <button onClick={copyCode} disabled={!previewCode} className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-secondary hover:text-muted-foreground disabled:opacity-15">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button onClick={downloadHtml} disabled={!activeProject?.generatedCode} className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-secondary hover:text-muted-foreground disabled:opacity-15">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setPhase('chat'); createProject(); }}
            className="ml-1 flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground/70"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </header>

      {/* ─── Main Area ─── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel: Chat + Logs + Pipeline ── */}
        <div className="flex w-72 flex-shrink-0 flex-col border-r border-border lg:w-80">
          {/* Chat Logs */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {/* User messages from project */}
              {activeProject?.messages.map(msg => (
                <ChatLogItem key={msg.id} msg={msg} isGenerating={isGenerating} />
              ))}

              {/* Live generation logs */}
              {chatLogs.map((log, i) => (
                <motion.div
                  key={`log-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 py-1"
                >
                  <span className="text-[12px] leading-relaxed text-muted-foreground/60">{log}</span>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isGenerating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-1">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                        className="h-1 w-1 rounded-full bg-primary/50"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground/40">{STAGE_META[buildStage].label}</span>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Pipeline (below chat, visible during build) */}
          {(isGenerating || buildStage !== 'idle') && (
            <div className="border-t border-border p-3">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/40">Pipeline</p>
              <BuildPipeline stage={buildStage} />
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 transition-all focus-within:border-primary/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isGenerating ? 'Aguarde a geração...' : 'Descreva alterações ou novo site...'}
                rows={2}
                disabled={isGenerating}
                className="flex-1 resize-none bg-transparent text-xs text-foreground/70 placeholder-muted-foreground/30 outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-all hover:bg-primary/25 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Center: Preview / Code / Structure ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Content */}
          <div className="relative flex-1 overflow-auto bg-background p-3 lg:p-4">
            <AnimatePresence mode="wait">
              {centerMode === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {previewCode ? (
                    <div className="relative mx-auto h-full" style={{ maxWidth: viewportWidths[viewMode] }}>
                      {/* Building overlay */}
                      {isGenerating && (
                        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2.5 rounded-t-xl border-b border-primary/10 bg-card/90 px-4 py-2 backdrop-blur-md">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <span className="text-[11px] text-foreground/60">{STAGE_META[buildStage].label}</span>
                          <div className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              className="h-full rounded-full bg-primary/50"
                              animate={{ width: `${STAGE_META[buildStage].pct}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                      <iframe
                        srcDoc={previewCode}
                        className="h-full w-full rounded-xl border border-border bg-white shadow-lg"
                        sandbox="allow-scripts allow-same-origin"
                        title="Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground/20">
                      <Eye className="mb-3 h-12 w-12" />
                      <p className="text-sm">O preview aparecerá aqui durante a geração</p>
                    </div>
                  )}
                </motion.div>
              )}

              {centerMode === 'code' && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <pre className="h-full overflow-auto rounded-xl border border-border bg-card p-5 font-mono text-[11px] leading-5 text-foreground/50">
                    <code>{previewCode || '// Nenhum código gerado ainda'}</code>
                  </pre>
                </motion.div>
              )}

              {centerMode === 'structure' && (
                <motion.div
                  key="structure"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <StructureView code={previewCode} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Status Bar ─── */}
          <div className="flex items-center justify-between border-t border-border bg-card/30 px-4 py-1.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px]">
                <span className={`h-1.5 w-1.5 rounded-full ${buildStage === 'pronto' ? 'bg-emerald-500' : buildStage === 'erro' ? 'bg-destructive' : isGenerating ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                <span className="text-muted-foreground/50">
                  {buildStage === 'pronto' ? 'Build concluído' : buildStage === 'erro' ? 'Erro na geração' : isGenerating ? STAGE_META[buildStage].label : 'Pronto'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/30">
              <span>HTML5</span>
              <span>Tailwind CSS</span>
              {previewCode && <span>{(previewCode.length / 1024).toFixed(1)}KB</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
