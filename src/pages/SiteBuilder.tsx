import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone, Sparkles,
  MessageSquare, Clock, Plus, Check, Globe, Layers,
  ChevronRight, Zap, X
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

/* ─── Code Generation Animation Lines ─── */
const CODE_LINES = [
  '<!DOCTYPE html>',
  '<html lang="pt-BR">',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '  <title>Meu Site</title>',
  '  <script src="https://cdn.tailwindcss.com"><\/script>',
  '</head>',
  '<body class="bg-gray-50">',
  '  <!-- Header -->',
  '  <header class="bg-white shadow-sm">',
  '    <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between">',
  '      <div class="text-2xl font-bold text-blue-600">Logo</div>',
  '      <div class="hidden md:flex gap-8 items-center">',
  '        <a href="#" class="text-gray-700 hover:text-blue-600">Início</a>',
  '        <a href="#" class="text-gray-700 hover:text-blue-600">Serviços</a>',
  '        <a href="#" class="text-gray-700 hover:text-blue-600">Contato</a>',
  '      </div>',
  '    </nav>',
  '  </header>',
  '',
  '  <!-- Hero Section -->',
  '  <section class="relative bg-gradient-to-br from-blue-600 to-blue-800">',
  '    <div class="max-w-7xl mx-auto px-4 py-24 text-center">',
  '      <h1 class="text-5xl font-bold text-white mb-6">',
  '        Transforme sua presença digital',
  '      </h1>',
  '      <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">',
  '        Soluções profissionais para o seu negócio crescer.',
  '      </p>',
  '      <a href="#contato" class="bg-white text-blue-600 px-8 py-4 rounded-full">',
  '        Começar Agora',
  '      </a>',
  '    </div>',
  '  </section>',
  '',
  '  <!-- Features -->',
  '  <section class="py-20 bg-white">',
  '    <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">',
  '      <div class="p-6 rounded-2xl bg-gray-50 border">',
  '        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">',
  '          <svg class="w-6 h-6 text-blue-600">...</svg>',
  '        </div>',
  '        <h3 class="text-xl font-semibold mt-4">Design Moderno</h3>',
  '        <p class="text-gray-600 mt-2">Interfaces elegantes e responsivas.</p>',
  '      </div>',
  '    </div>',
  '  </section>',
  '',
  '  <!-- Footer -->',
  '  <footer class="bg-gray-900 text-white py-12">',
  '    <div class="max-w-7xl mx-auto px-4 text-center">',
  '      <p class="text-gray-400">&copy; 2024 Todos os direitos reservados.</p>',
  '    </div>',
  '  </footer>',
  '</body>',
  '</html>',
];

/* ─── Building Animation Component ─── */
const BuildingAnimation = memo(({ progress }: { progress: number }) => {
  const visibleLines = Math.floor((progress / 100) * CODE_LINES.length);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-sky-500/20 bg-slate-950">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-sky-500/10 bg-slate-900/80 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-sky-400/60">genesis-builder — generating site...</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
          <span className="text-[10px] font-mono text-sky-400/40">{progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-hidden p-4 font-mono text-[11px] leading-5">
        <div className="space-y-0">
          {CODE_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <span className="mr-4 inline-block w-6 select-none text-right text-sky-500/20">{i + 1}</span>
              <span className={
                line.startsWith('  <!--') ? 'text-sky-500/30' :
                line.includes('class=') ? 'text-cyan-300/80' :
                line.startsWith('<') ? 'text-sky-400/70' :
                'text-white/50'
              }>
                {line || '\u00A0'}
              </span>
            </motion.div>
          ))}
          {progress < 100 && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex items-center mt-1"
            >
              <span className="mr-4 inline-block w-6 select-none text-right text-sky-500/20">{visibleLines + 1}</span>
              <span className="inline-block h-4 w-2 bg-sky-400" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-sky-500/10 bg-slate-900/60 px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
            {progress < 100 ? 'Gerando...' : 'Concluído'}
          </span>
          <span className="text-[10px] text-sky-400/30">HTML • Tailwind CSS • JavaScript</span>
        </div>
        <span className="text-[10px] text-sky-400/30">{visibleLines} linhas</span>
      </div>
    </div>
  );
});
BuildingAnimation.displayName = 'BuildingAnimation';

/* ─── Folder Structure Animation ─── */
const FolderStructure = memo(({ progress }: { progress: number }) => {
  const folders = [
    { name: 'src/', icon: '📁', delay: 0 },
    { name: '  components/', icon: '📂', delay: 5 },
    { name: '    Header.tsx', icon: '📄', delay: 10 },
    { name: '    Hero.tsx', icon: '📄', delay: 15 },
    { name: '    Features.tsx', icon: '📄', delay: 20 },
    { name: '    Footer.tsx', icon: '📄', delay: 30 },
    { name: '  styles/', icon: '📂', delay: 40 },
    { name: '    globals.css', icon: '🎨', delay: 45 },
    { name: '  assets/', icon: '📂', delay: 55 },
    { name: '    logo.svg', icon: '🖼️', delay: 60 },
    { name: '  index.html', icon: '📄', delay: 70 },
    { name: '  app.js', icon: '⚡', delay: 80 },
    { name: 'package.json', icon: '📦', delay: 90 },
  ];

  return (
    <div className="rounded-lg border border-sky-500/10 bg-slate-900/40 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-sky-400/40">Estrutura do Projeto</p>
      <div className="space-y-0.5 font-mono text-[11px]">
        {folders.filter(f => progress >= f.delay).map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sky-300/50"
          >
            <span className="text-[10px]">{f.icon}</span>
            <span>{f.name.trim()}</span>
            {progress >= f.delay + 5 && (
              <Check className="ml-auto h-3 w-3 text-emerald-400/50" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});
FolderStructure.displayName = 'FolderStructure';

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
  const [streamingCode, setStreamingCode] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeProject?.messages]);

  // Switch to building phase when generating starts
  useEffect(() => {
    if (isGenerating && activeProjectId) {
      setPhase('building');
      setBuildProgress(0);
      progressRef.current = setInterval(() => {
        setBuildProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 3 + 0.5;
        });
      }, 200);
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
      messages: [],
      generatedCode: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects(prev => [project, ...prev]);
    setActiveProjectId(project.id);
    setShowHistory(false);
    setPhase('chat');
    return project.id;
  }, [projects.length]);

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setPhase('chat');
    }
  };

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    let projectId = activeProjectId;
    if (!projectId) {
      projectId = createProject(input.slice(0, 40));
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const currentProject = projects.find(p => p.id === projectId);
    const allMessages = [...(currentProject?.messages || []), userMsg];
    
    updateProject(projectId!, { messages: allMessages });
    setInput('');
    setIsGenerating(true);
    setStreamingCode('');

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          projectId,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

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
              const assistantMsg: ChatMessage = {
                id: `assistant-${projectId}`,
                role: 'assistant',
                content: fullContent,
                timestamp: new Date(),
              };
              const updatedMsgs = [...allMessages];
              const existingIdx = updatedMsgs.findIndex(m => m.id === assistantMsg.id);
              if (existingIdx >= 0) updatedMsgs[existingIdx] = assistantMsg;
              else updatedMsgs.push(assistantMsg);
              const html = extractHtml(fullContent);
              updateProject(projectId!, { messages: updatedMsgs, generatedCode: html || '' });
            }
          } catch { /* partial json */ }
        }
      }

      const html = extractHtml(fullContent);
      const finalAssistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      };
      updateProject(projectId!, {
        messages: [...allMessages, finalAssistantMsg],
        generatedCode: html || '',
        name: currentProject?.name || input.slice(0, 40),
      });

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Erro: ${err.message}`,
        timestamp: new Date(),
      };
      updateProject(projectId!, { messages: [...allMessages, errorMsg] });
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

  const viewportWidths: Record<ViewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const suggestions = [
    { icon: Globe, text: 'Site para barbearia moderna com agendamento online' },
    { icon: Layers, text: 'Landing page para clínica de estética premium' },
    { icon: Zap, text: 'Site de pizzaria com cardápio digital e pedidos' },
  ];

  /* ─── CHAT PHASE (initial screen) ─── */
  if (phase === 'chat' && (!activeProject || activeProject.messages.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: 'linear-gradient(180deg, hsl(215 30% 6%) 0%, hsl(220 35% 9%) 50%, hsl(215 30% 6%) 100%)' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/login/dashboard')}
          className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-sky-500/10 bg-slate-900/60 px-3 py-2 text-xs text-sky-400/60 backdrop-blur-xl transition-colors hover:bg-slate-800/80 hover:text-sky-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>

        {/* History button */}
        {projects.length > 0 && (
          <button
            onClick={() => setShowHistory(true)}
            className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-sky-500/10 bg-slate-900/60 px-3 py-2 text-xs text-sky-400/60 backdrop-blur-xl transition-colors hover:bg-slate-800/80 hover:text-sky-300"
          >
            <Clock className="h-3.5 w-3.5" /> Projetos ({projects.length})
          </button>
        )}

        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-sky-500/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Seus Projetos</h3>
                  <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-white/60 transition-colors cursor-pointer hover:bg-sky-500/10 hover:text-white"
                      onClick={() => { setActiveProjectId(p.id); setShowHistory(false); setPhase('building'); }}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-sky-400/40" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-[10px] text-white/30">{p.messages.length} mensagens</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                        className="shrink-0 rounded-lg p-1 text-white/20 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
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

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-sky-500/10 blur-xl" />
              <img src={genesisLogo} alt="Genesis" className="relative h-14 w-14" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
            Genesis <span className="text-sky-400">Site Builder</span>
          </h1>
          <p className="mb-10 text-sm text-white/40">
            Descreva o site que deseja criar e a IA construirá em tempo real.
          </p>

          {/* Input box */}
          <div className="relative mx-auto w-full">
            <div className="rounded-2xl border border-sky-500/15 bg-slate-900/60 p-1.5 shadow-xl shadow-sky-500/5 backdrop-blur-xl transition-all focus-within:border-sky-500/30 focus-within:shadow-sky-500/10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Descreva o site que deseja criar..."
                rows={3}
                className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-[10px] text-white/20">Shift+Enter para nova linha</span>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-sky-500/20 px-4 py-2 text-xs font-medium text-sky-400 transition-all hover:bg-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Criar Site
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s.text)}
                className="flex items-center gap-2 rounded-xl border border-sky-500/8 bg-slate-900/40 px-4 py-2.5 text-xs text-white/40 transition-all hover:border-sky-500/20 hover:bg-slate-800/60 hover:text-white/60"
              >
                <s.icon className="h-3.5 w-3.5 text-sky-400/40" />
                {s.text}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── BUILDING PHASE (chat + preview/build animation) ─── */
  return (
    <div className="flex h-screen flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(215 30% 6%) 0%, hsl(220 35% 9%) 50%, hsl(215 30% 6%) 100%)' }}>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-sky-500/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPhase('chat'); setActiveProjectId(null); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img src={genesisLogo} alt="Genesis" className="h-6 w-6" />
          <div>
            <h1 className="text-xs font-semibold text-white">{activeProject?.name || 'Novo Projeto'}</h1>
            <p className="text-[10px] text-sky-400/40">Site Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPhase('chat'); createProject(); }}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/10 px-3 py-1.5 text-[11px] text-sky-400/60 transition-colors hover:bg-sky-500/10 hover:text-sky-400"
          >
            <Plus className="h-3 w-3" /> Novo
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="flex w-full max-w-sm flex-col border-r border-sky-500/10 lg:max-w-md">
          <div className="flex-1 overflow-y-auto p-4">
            {activeProject && activeProject.messages.length > 0 ? (
              <div className="space-y-3">
                {activeProject.messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-500/15 text-white border border-sky-500/10'
                        : 'bg-slate-800/60 text-white/70 border border-sky-500/5'
                    }`}>
                      {msg.role === 'assistant' && extractHtml(msg.content) ? (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Site gerado! Veja o preview →</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.content.length > 200 && msg.role === 'assistant'
                          ? msg.content.slice(0, 200) + '...'
                          : msg.content
                        }</p>
                      )}
                      <p className="mt-1.5 text-[10px] opacity-30">
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-sky-500/10 bg-slate-800/60 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      <span className="text-xs text-white/40">Construindo seu site...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-white/20">Envie uma mensagem para começar</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-sky-500/10 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-sky-500/10 bg-slate-900/40 px-3 py-2 transition-all focus-within:border-sky-500/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Descreva alterações ou um novo site..."
                rows={2}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 transition-all hover:bg-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview / Build Animation Panel */}
        <div className="hidden flex-1 flex-col lg:flex">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-sky-500/10 bg-slate-950/60 px-4 py-2">
            <div className="flex items-center gap-1">
              {([
                { mode: 'desktop' as ViewMode, icon: Monitor, label: 'Desktop' },
                { mode: 'tablet' as ViewMode, icon: Tablet, label: 'Tablet' },
                { mode: 'mobile' as ViewMode, icon: Smartphone, label: 'Mobile' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors ${
                    viewMode === mode ? 'bg-sky-500/15 text-sky-400' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowCode(c => !c)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors ${
                  showCode ? 'bg-emerald-500/15 text-emerald-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" /> Código
              </button>
              <button
                onClick={copyCode}
                disabled={!activeProject?.generatedCode}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-white/30 transition-colors hover:text-white/60 disabled:opacity-20"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={downloadHtml}
                disabled={!activeProject?.generatedCode}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-white/30 transition-colors hover:text-white/60 disabled:opacity-20"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-auto p-4">
            {isGenerating ? (
              /* Building animation */
              <div className="flex h-full gap-4">
                <div className="flex-1">
                  <BuildingAnimation progress={Math.min(buildProgress, 100)} />
                </div>
                <div className="w-56 flex-shrink-0 space-y-3">
                  <FolderStructure progress={Math.min(buildProgress, 100)} />
                  <div className="rounded-lg border border-sky-500/10 bg-slate-900/40 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-sky-400/40">Status</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Analisando prompt', done: buildProgress > 10 },
                        { label: 'Gerando estrutura', done: buildProgress > 30 },
                        { label: 'Criando componentes', done: buildProgress > 50 },
                        { label: 'Aplicando estilos', done: buildProgress > 70 },
                        { label: 'Otimizando código', done: buildProgress > 90 },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          {step.done ? (
                            <Check className="h-3 w-3 text-emerald-400/60" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-sky-500/20" />
                          )}
                          <span className={step.done ? 'text-white/50' : 'text-white/20'}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : showCode ? (
              <pre className="h-full overflow-auto rounded-xl border border-sky-500/10 bg-slate-900/60 p-4 font-mono text-xs text-emerald-400/70 leading-5">
                <code>{activeProject?.generatedCode || '// Nenhum código gerado ainda'}</code>
              </pre>
            ) : activeProject?.generatedCode ? (
              <div className="mx-auto h-full" style={{ maxWidth: viewportWidths[viewMode] }}>
                <iframe
                  srcDoc={activeProject.generatedCode}
                  className="h-full w-full rounded-xl border border-sky-500/10 bg-white shadow-2xl shadow-sky-500/5"
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-white/15">
                <Eye className="mb-3 h-16 w-16 opacity-20" />
                <p className="text-sm">Preview aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
