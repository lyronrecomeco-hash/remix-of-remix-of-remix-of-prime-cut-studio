import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone, Sparkles,
  MessageSquare, Clock, Plus, Check, Globe, Layers,
  Zap, X, FolderOpen, FileCode, Palette, Settings2
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
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type Phase = 'chat' | 'building';

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

/* ─── Floating Particles Background ─── */
const FloatingParticles = memo(() => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(200 80% 50%) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-48 -right-32 h-[500px] w-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(210 70% 40%) 0%, transparent 70%)' }} />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-[0.02]"
        style={{ background: 'radial-gradient(circle, hsl(190 90% 50%) 0%, transparent 70%)' }} />

      {/* Floating dots */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(200 70% 60% / 0.15)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(200 50% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(200 50% 50%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
});
FloatingParticles.displayName = 'FloatingParticles';

/* ─── Code Generation Terminal ─── */
const CODE_LINES = [
  { text: '<!DOCTYPE html>', type: 'tag' },
  { text: '<html lang="pt-BR">', type: 'tag' },
  { text: '<head>', type: 'tag' },
  { text: '  <meta charset="UTF-8">', type: 'attr' },
  { text: '  <meta name="viewport" content="width=device-width, initial-scale=1.0">', type: 'attr' },
  { text: '  <title>Meu Site Profissional</title>', type: 'text' },
  { text: '  <script src="https://cdn.tailwindcss.com"><\/script>', type: 'attr' },
  { text: '</head>', type: 'tag' },
  { text: '<body class="bg-gray-50 antialiased">', type: 'tag' },
  { text: '', type: 'empty' },
  { text: '  <!-- ═══ Navigation ═══ -->', type: 'comment' },
  { text: '  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg">', type: 'tag' },
  { text: '    <nav class="max-w-7xl mx-auto px-6 py-4 flex justify-between">', type: 'tag' },
  { text: '      <div class="text-2xl font-bold text-blue-600">Brand</div>', type: 'text' },
  { text: '      <div class="hidden md:flex gap-8 items-center">', type: 'tag' },
  { text: '        <a href="#" class="text-gray-700 hover:text-blue-600">Início</a>', type: 'text' },
  { text: '        <a href="#" class="text-gray-700 hover:text-blue-600">Serviços</a>', type: 'text' },
  { text: '      </div>', type: 'tag' },
  { text: '    </nav>', type: 'tag' },
  { text: '  </header>', type: 'tag' },
  { text: '', type: 'empty' },
  { text: '  <!-- ═══ Hero Section ═══ -->', type: 'comment' },
  { text: '  <section class="relative overflow-hidden">', type: 'tag' },
  { text: '    <div class="max-w-7xl mx-auto px-6 py-24 text-center">', type: 'tag' },
  { text: '      <h1 class="text-5xl font-bold text-gray-900 mb-6">', type: 'tag' },
  { text: '        Transforme sua presença digital', type: 'text' },
  { text: '      </h1>', type: 'tag' },
  { text: '      <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-10">', type: 'tag' },
  { text: '        Soluções profissionais para seu negócio crescer.', type: 'text' },
  { text: '      </p>', type: 'tag' },
  { text: '      <a href="#contato" class="inline-flex items-center bg-blue-600">', type: 'attr' },
  { text: '        Começar Agora', type: 'text' },
  { text: '      </a>', type: 'tag' },
  { text: '    </div>', type: 'tag' },
  { text: '  </section>', type: 'tag' },
  { text: '', type: 'empty' },
  { text: '  <!-- ═══ Features Grid ═══ -->', type: 'comment' },
  { text: '  <section class="py-20 bg-white">', type: 'tag' },
  { text: '    <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">', type: 'tag' },
  { text: '      <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100">', type: 'tag' },
  { text: '        <h3 class="text-xl font-semibold mt-4">Design Moderno</h3>', type: 'text' },
  { text: '        <p class="text-gray-600 mt-2">Interfaces responsivas.</p>', type: 'text' },
  { text: '      </div>', type: 'tag' },
  { text: '    </div>', type: 'tag' },
  { text: '  </section>', type: 'tag' },
  { text: '', type: 'empty' },
  { text: '  <!-- ═══ Footer ═══ -->', type: 'comment' },
  { text: '  <footer class="bg-gray-900 text-white py-12">', type: 'tag' },
  { text: '    <div class="max-w-7xl mx-auto px-6 text-center">', type: 'tag' },
  { text: '      <p class="text-gray-400">&copy; 2024 Todos os direitos.</p>', type: 'text' },
  { text: '    </div>', type: 'tag' },
  { text: '  </footer>', type: 'tag' },
  { text: '</body>', type: 'tag' },
  { text: '</html>', type: 'tag' },
];

const getLineColor = (type: string) => {
  switch (type) {
    case 'tag': return 'text-blue-400/70';
    case 'attr': return 'text-cyan-300/60';
    case 'text': return 'text-emerald-300/60';
    case 'comment': return 'text-white/20';
    default: return 'text-white/10';
  }
};

const BuildingTerminal = memo(({ progress }: { progress: number }) => {
  const visibleLines = Math.floor((progress / 100) * CODE_LINES.length);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(220_25%_8%)]">
      {/* Terminal chrome */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0_60%_50%/0.5)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(40_60%_50%/0.5)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(130_50%_45%/0.5)]" />
        </div>
        <div className="flex-1 text-center">
          <span className="rounded-md bg-white/[0.04] px-3 py-0.5 font-mono text-[10px] text-white/30">
            genesis-builder ~/projeto/index.html
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: progress < 100 ? [0.3, 1, 0.3] : 1 }}
            transition={{ duration: 1, repeat: progress < 100 ? Infinity : 0 }}
            className={`h-1.5 w-1.5 rounded-full ${progress >= 100 ? 'bg-emerald-400/60' : 'bg-blue-400/60'}`}
          />
          <span className="font-mono text-[10px] text-white/20">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px w-full bg-white/[0.04]">
        <motion.div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(200 80% 50% / 0.6), hsl(180 70% 50% / 0.4))',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Code editor */}
      <div className="flex-1 overflow-hidden px-5 py-4 font-mono text-[11px] leading-[20px]">
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1 }}
            className="flex"
          >
            <span className="mr-5 inline-block w-5 select-none text-right text-white/[0.08]">{i + 1}</span>
            <span className={getLineColor(line.type)}>{line.text || '\u00A0'}</span>
          </motion.div>
        ))}
        {progress < 100 && (
          <motion.div
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="mt-0.5 flex items-center"
          >
            <span className="mr-5 inline-block w-5 select-none text-right text-white/[0.08]">{visibleLines + 1}</span>
            <span className="inline-block h-[14px] w-[7px] rounded-[1px] bg-blue-400/50" />
          </motion.div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/[0.04] bg-white/[0.015] px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className={`h-1.5 w-1.5 rounded-full ${progress >= 100 ? 'bg-emerald-400/50' : 'bg-blue-400/40'}`} />
            <span className="text-white/20">{progress >= 100 ? 'Build concluído' : 'Gerando código...'}</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/15">
          <span>HTML5</span>
          <span>Tailwind CSS</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
});
BuildingTerminal.displayName = 'BuildingTerminal';

/* ─── Build Sidebar ─── */
const BuildSidebar = memo(({ progress }: { progress: number }) => {
  const folders = [
    { name: 'projeto/', icon: FolderOpen, indent: 0, at: 0 },
    { name: 'src/', icon: FolderOpen, indent: 1, at: 5 },
    { name: 'components/', icon: FolderOpen, indent: 2, at: 8 },
    { name: 'Header.tsx', icon: FileCode, indent: 3, at: 12 },
    { name: 'Hero.tsx', icon: FileCode, indent: 3, at: 18 },
    { name: 'Features.tsx', icon: FileCode, indent: 3, at: 28 },
    { name: 'Footer.tsx', icon: FileCode, indent: 3, at: 38 },
    { name: 'styles/', icon: Palette, indent: 2, at: 45 },
    { name: 'globals.css', icon: FileCode, indent: 3, at: 50 },
    { name: 'index.html', icon: Globe, indent: 1, at: 60 },
    { name: 'tailwind.config.js', icon: Settings2, indent: 1, at: 75 },
    { name: 'package.json', icon: FileCode, indent: 1, at: 85 },
  ];

  const steps = [
    { label: 'Analisando prompt', at: 5 },
    { label: 'Criando estrutura', at: 15 },
    { label: 'Gerando componentes', at: 35 },
    { label: 'Aplicando estilos', at: 60 },
    { label: 'Otimizando código', at: 80 },
    { label: 'Finalizando build', at: 95 },
  ];

  return (
    <div className="flex w-52 flex-shrink-0 flex-col gap-3">
      {/* File tree */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/20">Arquivos</p>
        <div className="space-y-0.5 font-mono text-[11px]">
          {folders.filter(f => progress >= f.at).map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5"
              style={{ paddingLeft: f.indent * 12 }}
            >
              <f.icon className="h-3 w-3 shrink-0 text-blue-400/30" />
              <span className="text-white/40">{f.name}</span>
              {progress >= f.at + 8 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="ml-auto h-2.5 w-2.5 text-emerald-400/40" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/20">Pipeline</p>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const done = progress >= step.at;
            const active = progress >= step.at - 10 && progress < step.at;
            return (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {done ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/10">
                    <Check className="h-2.5 w-2.5 text-emerald-400/60" />
                  </div>
                ) : active ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-400/10">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-400/50" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-white/[0.08]" />
                )}
                <span className={done ? 'text-white/40' : active ? 'text-blue-400/50' : 'text-white/15'}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
BuildSidebar.displayName = 'BuildSidebar';

/* ─── Main Page ─── */
export default function SiteBuilderPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>('chat');
  const [buildProgress, setBuildProgress] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeProject?.messages]);

  useEffect(() => {
    if (isGenerating && activeProjectId) {
      setPhase('building');
      setBuildProgress(0);
      progressRef.current = setInterval(() => {
        setBuildProgress(prev => prev >= 95 ? 95 : prev + Math.random() * 2.5 + 0.3);
      }, 250);
    } else if (!isGenerating && progressRef.current) {
      setBuildProgress(100);
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [isGenerating, activeProjectId]);

  const createProject = useCallback((name?: string) => {
    const project: Project = {
      id: generateId(),
      name: name || `Projeto ${projects.length + 1}`,
      messages: [], generatedCode: '',
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

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';

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
              const assistantMsg: ChatMessage = { id: `assistant-${projectId}`, role: 'assistant', content: fullContent, timestamp: new Date() };
              const updatedMsgs = [...allMessages];
              const idx = updatedMsgs.findIndex(m => m.id === assistantMsg.id);
              if (idx >= 0) updatedMsgs[idx] = assistantMsg; else updatedMsgs.push(assistantMsg);
              const html = extractHtml(fullContent);
              updateProject(projectId!, { messages: updatedMsgs, generatedCode: html || '' });
            }
          } catch { /* partial */ }
        }
      }

      const html = extractHtml(fullContent);
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant', content: fullContent, timestamp: new Date() }],
        generatedCode: html || '',
        name: currentProject?.name || input.slice(0, 40),
      });
    } catch (err: any) {
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant', content: `❌ Erro: ${err.message}`, timestamp: new Date() }],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    if (activeProject?.generatedCode) {
      navigator.clipboard.writeText(activeProject.generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadHtml = () => {
    if (!activeProject?.generatedCode) return;
    const blob = new Blob([activeProject.generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewportWidths: Record<ViewMode, string> = { desktop: '100%', tablet: '768px', mobile: '375px' };

  const suggestions = [
    { icon: Globe, text: 'Site para barbearia moderna com agendamento online' },
    { icon: Layers, text: 'Landing page para clínica de estética premium' },
    { icon: Zap, text: 'Site de pizzaria com cardápio digital e pedidos' },
  ];

  /* ════════ CHAT PHASE ════════ */
  if (phase === 'chat' && (!activeProject || activeProject.messages.length === 0)) {
    return (
      <div
        className="relative flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}
      >
        <FloatingParticles />

        {/* Top bar */}
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate('/login/dashboard')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-[11px] text-white/40 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:text-white/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          {projects.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 text-[11px] text-white/40 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:text-white/60"
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
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[hsl(220_25%_12%)] p-5 shadow-2xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white/80">Seus Projetos</h3>
                  <button onClick={() => setShowHistory(false)} className="text-white/30 hover:text-white/60"><X className="h-4 w-4" /></button>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-xs transition-all cursor-pointer hover:bg-white/[0.04]"
                      onClick={() => { setActiveProjectId(p.id); setShowHistory(false); setPhase('building'); }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-400/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white/60">{p.name}</p>
                        <p className="text-[10px] text-white/25">{p.messages.length} msgs • {p.updatedAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="shrink-0 rounded-lg p-1.5 text-white/15 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400/60 group-hover:opacity-100"
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
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, hsl(200 80% 50% / 0.15), transparent 70%)' }} />
              <img src={genesisLogo} alt="Genesis" className="relative h-12 w-12" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white/90 md:text-3xl">
            Genesis <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Site Builder</span>
          </h1>
          <p className="mb-10 text-sm text-white/30">
            Descreva seu site e a IA construirá tudo em tempo real
          </p>

          {/* Input */}
          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-xl shadow-black/20 backdrop-blur-xl transition-all focus-within:border-blue-500/20 focus-within:shadow-blue-500/5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Descreva o site que deseja criar..."
                rows={3}
                className="w-full resize-none bg-transparent px-5 py-4 text-sm text-white/80 placeholder-white/20 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-[10px] text-white/15">Shift+Enter para nova linha</span>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg, hsl(210 80% 50% / 0.2), hsl(190 70% 50% / 0.15))' : 'transparent',
                    color: input.trim() ? 'hsl(200 80% 70%)' : 'hsl(200 10% 40%)',
                    border: `1px solid ${input.trim() ? 'hsl(200 60% 50% / 0.15)' : 'transparent'}`,
                  }}
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
                className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-[11px] text-white/30 transition-all hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white/50"
              >
                <s.icon className="h-3.5 w-3.5 text-blue-400/30" />
                {s.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ════════ BUILDING PHASE ════════ */
  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPhase('chat'); setActiveProjectId(null); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img src={genesisLogo} alt="Genesis" className="h-6 w-6" />
          <div>
            <h1 className="text-xs font-semibold text-white/70">{activeProject?.name || 'Novo Projeto'}</h1>
            <p className="text-[10px] text-white/20">Site Builder</p>
          </div>
        </div>
        <button
          onClick={() => { setPhase('chat'); createProject(); }}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/60"
        >
          <Plus className="h-3 w-3" /> Novo Projeto
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="flex w-full max-w-sm flex-col border-r border-white/[0.06] lg:max-w-md">
          <div className="flex-1 overflow-y-auto p-4">
            {activeProject && activeProject.messages.length > 0 ? (
              <div className="space-y-3">
                {activeProject.messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-500/10 text-white/70 border border-blue-500/10'
                        : 'bg-white/[0.03] text-white/50 border border-white/[0.05]'
                    }`}>
                      {msg.role === 'assistant' && extractHtml(msg.content) ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10">
                            <Check className="h-3 w-3 text-emerald-400/70" />
                          </div>
                          <span className="text-xs text-emerald-400/60">Site gerado com sucesso</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content.length > 200 && msg.role === 'assistant' ? msg.content.slice(0, 200) + '...' : msg.content}
                        </p>
                      )}
                      <p className="mt-1.5 text-[10px] text-white/15">
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                            className="h-1.5 w-1.5 rounded-full bg-blue-400/50"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-white/25">Construindo...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-white/15">Envie uma mensagem para começar</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-all focus-within:border-blue-500/15">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Descreva alterações ou novo site..."
                rows={2}
                className="flex-1 resize-none bg-transparent text-sm text-white/70 placeholder-white/20 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400/60 transition-all hover:bg-blue-500/25 hover:text-blue-400 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview / Build Panel */}
        <div className="hidden flex-1 flex-col lg:flex">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-5 py-2">
            <div className="flex items-center gap-1">
              {([
                { mode: 'desktop' as ViewMode, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as ViewMode, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as ViewMode, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
                    viewMode === mode
                      ? 'bg-blue-500/10 text-blue-400/70'
                      : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCode(c => !c)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
                  showCode ? 'bg-emerald-500/10 text-emerald-400/60' : 'text-white/20 hover:text-white/40'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" /> Código
              </button>
              <button
                onClick={copyCode}
                disabled={!activeProject?.generatedCode}
                className="rounded-lg p-2 text-white/20 transition-all hover:bg-white/[0.04] hover:text-white/40 disabled:opacity-15"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400/60" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={downloadHtml}
                disabled={!activeProject?.generatedCode}
                className="rounded-lg p-2 text-white/20 transition-all hover:bg-white/[0.04] hover:text-white/40 disabled:opacity-15"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {isGenerating ? (
              <div className="flex h-full gap-4">
                <div className="flex-1">
                  <BuildingTerminal progress={Math.min(buildProgress, 100)} />
                </div>
                <BuildSidebar progress={Math.min(buildProgress, 100)} />
              </div>
            ) : showCode ? (
              <pre className="h-full overflow-auto rounded-2xl border border-white/[0.06] bg-[hsl(220_25%_8%)] p-5 font-mono text-[11px] leading-5 text-emerald-300/50">
                <code>{activeProject?.generatedCode || '// Nenhum código gerado ainda'}</code>
              </pre>
            ) : activeProject?.generatedCode ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto h-full"
                style={{ maxWidth: viewportWidths[viewMode] }}
              >
                <iframe
                  srcDoc={activeProject.generatedCode}
                  className="h-full w-full rounded-2xl border border-white/[0.08] bg-white shadow-2xl shadow-black/30"
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-white/10">
                <Eye className="mb-3 h-14 w-14 opacity-20" />
                <p className="text-sm">Preview aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
