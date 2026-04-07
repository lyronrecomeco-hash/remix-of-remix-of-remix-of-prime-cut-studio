import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone, RotateCcw, Sparkles,
  MessageSquare, Clock, ChevronDown, Plus, Check
} from 'lucide-react';
import genesisLogo from '@/assets/genesis-logo.png';

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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genesis-site-builder`;

function extractHtml(text: string): string {
  // Try to extract HTML from markdown code blocks first
  const codeBlockMatch = text.match(/```html?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  
  // If the text starts with <!DOCTYPE or <html, use it directly
  const docMatch = text.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (docMatch) return docMatch[1].trim();
  
  return '';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const STORAGE_KEY = 'genesis_site_builder_projects';

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((p: any) => ({
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeProject?.messages]);

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
    return project.id;
  }, [projects.length]);

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
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
              // Update the assistant message progressively
              const assistantMsg: ChatMessage = {
                id: `assistant-${projectId}`,
                role: 'assistant',
                content: fullContent,
                timestamp: new Date(),
              };
              const updatedMsgs = [...allMessages];
              const existingIdx = updatedMsgs.findIndex(m => m.id === assistantMsg.id);
              if (existingIdx >= 0) {
                updatedMsgs[existingIdx] = assistantMsg;
              } else {
                updatedMsgs.push(assistantMsg);
              }
              const html = extractHtml(fullContent);
              updateProject(projectId!, { messages: updatedMsgs, generatedCode: html || '' });
            }
          } catch { /* partial json */ }
        }
      }

      // Final update
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(220 25% 8%) 0%, hsl(230 30% 10%) 50%, hsl(220 25% 8%) 100%)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login/dashboard')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img src={genesisLogo} alt="Genesis" className="h-7 w-7" />
          <h1 className="text-sm font-semibold text-white">Site Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Clock className="h-3.5 w-3.5" />
            Histórico ({projects.length})
          </button>
          <button
            onClick={() => createProject()}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/30"
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden border-r border-white/10 bg-slate-950/50"
            >
              <div className="h-full overflow-y-auto p-3">
                <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">Projetos</p>
                {projects.length === 0 ? (
                  <p className="px-2 text-xs text-white/30">Nenhum projeto ainda</p>
                ) : (
                  <div className="space-y-1">
                    {projects.map(p => (
                      <div
                        key={p.id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                          activeProjectId === p.id ? 'bg-sky-500/15 text-sky-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => { setActiveProjectId(p.id); setShowHistory(false); }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 truncate">{p.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                          className="shrink-0 rounded p-0.5 text-white/20 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content: Chat + Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Panel */}
          <div className="flex w-full max-w-md flex-col border-r border-white/10 lg:max-w-lg">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {!activeProject || activeProject.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10">
                    <Sparkles className="h-8 w-8 text-sky-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Genesis Site Builder</h2>
                  <p className="mt-2 max-w-xs text-sm text-white/40">
                    Cole o prompt do seu projeto ou descreva o site que deseja criar. A IA gerará o código completo.
                  </p>
                  <div className="mt-6 grid gap-2">
                    {[
                      'Crie um site para uma barbearia moderna chamada "BarberKing"',
                      'Site de pizzaria com cardápio online e pedidos',
                      'Landing page para clínica de estética premium',
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-left text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProject.messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-sky-500/20 text-white'
                            : 'bg-white/5 text-white/80'
                        }`}
                      >
                        {msg.role === 'assistant' && msg.content.includes('<!DOCTYPE') ? (
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Site gerado com sucesso! Veja o preview →</span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <p className="mt-1 text-[10px] opacity-40">
                          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isGenerating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                        <span className="text-xs text-white/50">Gerando site...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Descreva o site ou cole o prompt..."
                  rows={2}
                  className="flex-1 resize-none bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 transition-colors hover:bg-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="hidden flex-1 flex-col lg:flex">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <div className="flex items-center gap-1">
                {([
                  { mode: 'desktop' as ViewMode, icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet' as ViewMode, icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile' as ViewMode, icon: Smartphone, label: 'Mobile' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      viewMode === mode ? 'bg-sky-500/20 text-sky-400' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowCode(c => !c)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    showCode ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" /> Código
                </button>
                <button
                  onClick={copyCode}
                  disabled={!activeProject?.generatedCode}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/40 transition-colors hover:text-white/70 disabled:opacity-30"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={downloadHtml}
                  disabled={!activeProject?.generatedCode}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/40 transition-colors hover:text-white/70 disabled:opacity-30"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4">
              {showCode ? (
                <pre className="h-full overflow-auto rounded-xl border border-white/10 bg-slate-900 p-4 text-xs text-emerald-400/80">
                  <code>{activeProject?.generatedCode || '// Nenhum código gerado ainda'}</code>
                </pre>
              ) : activeProject?.generatedCode ? (
                <div className="mx-auto h-full" style={{ maxWidth: viewportWidths[viewMode] }}>
                  <iframe
                    srcDoc={activeProject.generatedCode}
                    className="h-full w-full rounded-xl border border-white/10 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-white/20">
                  <Eye className="mb-3 h-16 w-16 opacity-20" />
                  <p className="text-sm">Preview do site aparecerá aqui</p>
                  <p className="mt-1 text-xs opacity-50">Envie uma mensagem para gerar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
