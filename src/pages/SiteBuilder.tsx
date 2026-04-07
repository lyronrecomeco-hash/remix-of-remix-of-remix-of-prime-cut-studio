import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Code2, Eye, Copy, Download, Trash2,
  Loader2, Monitor, Tablet, Smartphone,
  MessageSquare, Clock, Plus, Check, Globe, Layers,
  Zap, X, LayoutGrid, Server, Database, FileCode,
  FolderOpen, ChevronRight, Sparkles, ChevronDown,
  FileText, Settings, Image, Coffee, File, Menu, PanelLeftClose,
  FolderTree, Hash, Braces
} from 'lucide-react';
import genesisLogo from '@/assets/genesis-logo.png';
import GenesisBackground from '@/components/genesis-ia/GenesisBackground';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectFile {
  path: string;
  content: string;
  category: 'frontend' | 'backend' | 'config' | 'assets' | 'database' | 'preview';
}

interface Project {
  id: string;
  name: string;
  messages: ChatMessage[];
  files: ProjectFile[];
  generatedCode: string;
  rawOutput: string;
  createdAt: Date;
  updatedAt: Date;
  snapshots?: string[];
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type CenterMode = 'preview' | 'code' | 'structure';
type BuildStage =
  | 'idle' | 'entendendo_prompt' | 'definindo_arquitetura' | 'criando_estrutura'
  | 'gerando_preview' | 'escrevendo_frontend' | 'criando_estilos' | 'criando_javascript'
  | 'escrevendo_backend' | 'criando_includes' | 'criando_paginas' | 'criando_config'
  | 'ajustando_responsividade' | 'refinando_experiencia' | 'finalizando' | 'pronto' | 'erro';

/* ─── Helpers ─── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/genesis-site-builder`;
const STORAGE_KEY = 'genesis_site_builder_projects';
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function parseFiles(rawText: string): ProjectFile[] {
  const files: ProjectFile[] = [];
  // Match ===FILE:path=== blocks - handle streaming where last file may be incomplete
  const regex = /===FILE:([^=\n]+)===/g;
  const matches: { path: string; start: number }[] = [];
  let match;
  while ((match = regex.exec(rawText)) !== null) {
    matches.push({ path: match[1].trim(), start: match.index + match[0].length });
  }
  for (let i = 0; i < matches.length; i++) {
    const path = matches[i].path;
    const start = matches[i].start;
    const end = i + 1 < matches.length ? matches[i + 1].start - `===FILE:${matches[i + 1].path}===`.length : rawText.length;
    const content = rawText.slice(start, end).trim();
    if (!path) continue;
    // Allow files with partial content during streaming
    let category: ProjectFile['category'] = 'frontend';
    if (path === 'preview.html') category = 'preview';
    else if (/controller|model|config|helper/i.test(path) && path.endsWith('.php')) category = 'backend';
    else if (path.includes('includes/') || path.includes('admin/')) category = 'backend';
    else if (path.includes('database/')) category = 'database';
    else if (path.includes('config/')) category = 'config';
    else if (/\.css$|\.js$|assets\//i.test(path)) category = 'assets';
    files.push({ path, content, category });
  }
  return files;
}

function getPreviewHtml(files: ProjectFile[]): string {
  const preview = files.find(f => f.path === 'preview.html');
  if (!preview) return '';
  const c = preview.content;
  // Show preview as soon as we have a meaningful HTML fragment (body tag or 200+ chars)
  if (c.includes('</html>') || c.includes('</body>') || c.includes('<body') || c.length > 200) return c;
  return '';
}

function categorizeFile(path: string): { icon: typeof File; color: string } {
  if (path.endsWith('.php')) return { icon: FileCode, color: 'text-purple-400' };
  if (path.endsWith('.css')) return { icon: FileText, color: 'text-blue-400' };
  if (path.endsWith('.js')) return { icon: Braces, color: 'text-yellow-400' };
  if (path.endsWith('.sql')) return { icon: Database, color: 'text-emerald-400' };
  if (path.endsWith('.html')) return { icon: Globe, color: 'text-orange-400' };
  if (path === '.htaccess') return { icon: Settings, color: 'text-red-400' };
  return { icon: File, color: 'text-muted-foreground/50' };
}

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((p: any) => ({
      ...p, files: p.files || [], rawOutput: p.rawOutput || '',
      createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt),
      messages: p.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch { return []; }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/* ─── Stage metadata ─── */
const STAGE_META: Record<BuildStage, { label: string; pct: number; group: string }> = {
  idle:                     { label: '',                              pct: 0,   group: '' },
  entendendo_prompt:        { label: 'Entendendo seu pedido...',      pct: 5,   group: 'Análise' },
  definindo_arquitetura:    { label: 'Definindo a arquitetura...',    pct: 10,  group: 'Análise' },
  criando_estrutura:        { label: 'Criando estrutura do projeto',  pct: 16,  group: 'Estrutura' },
  gerando_preview:          { label: 'Gerando preview visual',        pct: 24,  group: 'Frontend' },
  escrevendo_frontend:      { label: 'Escrevendo páginas PHP',        pct: 32,  group: 'Frontend' },
  criando_estilos:          { label: 'Criando estilos CSS',           pct: 42,  group: 'Frontend' },
  criando_javascript:       { label: 'Criando JavaScript',            pct: 50,  group: 'Frontend' },
  escrevendo_backend:       { label: 'Estruturando backend PHP',      pct: 58,  group: 'Backend' },
  criando_includes:         { label: 'Criando includes e templates',  pct: 66,  group: 'Backend' },
  criando_paginas:          { label: 'Criando páginas adicionais',    pct: 74,  group: 'Backend' },
  criando_config:           { label: 'Configurando ambiente',         pct: 80,  group: 'Config' },
  ajustando_responsividade: { label: 'Ajustando responsividade',      pct: 86,  group: 'Refinamento' },
  refinando_experiencia:    { label: 'Refinando a experiência',       pct: 92,  group: 'Refinamento' },
  finalizando:              { label: 'Finalizando o build',           pct: 98,  group: 'Refinamento' },
  pronto:                   { label: 'Build concluído!',              pct: 100, group: 'Concluído' },
  erro:                     { label: 'Erro na geração',               pct: 0,   group: '' },
};

const STAGE_ORDER: BuildStage[] = [
  'entendendo_prompt', 'definindo_arquitetura', 'criando_estrutura',
  'gerando_preview', 'escrevendo_frontend', 'criando_estilos',
  'criando_javascript', 'escrevendo_backend', 'criando_includes',
  'criando_paginas', 'criando_config',
  'ajustando_responsividade', 'refinando_experiencia', 'finalizando', 'pronto',
];

function inferStage(text: string, fileCount: number): BuildStage {
  const len = text.length;
  const hasPreview = text.includes('===FILE:preview.html===');
  const hasPhp = /===FILE:[^=]*\.php===/i.test(text);
  const hasCss = /===FILE:[^=]*\.css===/i.test(text);
  const hasJs = /===FILE:[^=]*\.js===/i.test(text);
  const hasIncludes = text.includes('includes/');
  const hasConfig = text.includes('config/');

  if (len < 80) return 'entendendo_prompt';
  if (len < 300) return 'definindo_arquitetura';
  if (!hasPreview && len < 600) return 'criando_estrutura';
  if (hasPreview && !hasPhp) return 'gerando_preview';
  if (hasPhp && !hasCss) return 'escrevendo_frontend';
  if (hasCss && !hasJs) return 'criando_estilos';
  if (hasJs && !hasIncludes) return 'criando_javascript';
  if (hasIncludes && !hasConfig) return 'criando_includes';
  if (hasConfig && fileCount < 10) return 'criando_config';
  if (fileCount >= 10 && len < 20000) return 'ajustando_responsividade';
  if (len >= 20000) return 'refinando_experiencia';
  return 'escrevendo_backend';
}

/* ─── Dark Genesis Skeleton ─── */
const SkeletonPreview = memo(({ stage }: { stage: BuildStage }) => {
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const sections = [
    { min: 1, h: 'h-12', content: 'nav' },
    { min: 2, h: 'h-64', content: 'hero' },
    { min: 3, h: 'h-20', content: 'stats' },
    { min: 4, h: 'h-48', content: 'features' },
    { min: 5, h: 'h-40', content: 'about' },
    { min: 6, h: 'h-36', content: 'testimonials' },
    { min: 7, h: 'h-28', content: 'cta' },
    { min: 8, h: 'h-24', content: 'footer' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, hsl(220 20% 13%) 0%, hsl(225 22% 11%) 100%)' }}>
      {/* Shimmer */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12" />
      </div>

      {/* Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} className="pointer-events-none absolute h-1 w-1 rounded-full bg-primary/20"
          style={{ left: `${10 + i * 11}%`, top: `${8 + i * 10}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }} />
      ))}

      <div className="relative z-[1] h-full overflow-y-auto p-4 sm:p-6 space-y-4">
        {sections.map((sec, i) => (
          <AnimatePresence key={i}>
            {stageIdx >= sec.min && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`${sec.h} w-full rounded-xl border border-white/[0.05]`}
                style={{ backgroundColor: 'hsl(220 20% 15% / 0.4)' }}>
                {sec.content === 'nav' && (
                  <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-md bg-primary/20" />
                      <div className="h-2.5 w-20 rounded bg-white/[0.06]" />
                    </div>
                    <div className="hidden sm:flex gap-4">
                      {[0,1,2,3].map(j => <div key={j} className="h-2 w-12 rounded bg-white/[0.04]" />)}
                    </div>
                    <div className="h-7 w-20 rounded-full bg-primary/10" />
                  </div>
                )}
                {sec.content === 'hero' && (
                  <div className="flex flex-col justify-center h-full px-6 space-y-3">
                    <div className="h-3 w-28 rounded-full bg-primary/10" />
                    <div className="h-7 w-[80%] rounded bg-white/[0.06]" />
                    <div className="h-7 w-[55%] rounded bg-white/[0.06]" />
                    <div className="h-3 w-[70%] rounded bg-white/[0.03]" />
                    <div className="flex gap-3 pt-2">
                      <div className="h-9 w-28 rounded-lg bg-primary/15" />
                      <div className="h-9 w-24 rounded-lg border border-white/[0.08]" />
                    </div>
                  </div>
                )}
                {sec.content === 'stats' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full items-center px-4">
                    {[0,1,2,3].map(j => (
                      <div key={j} className="text-center space-y-1">
                        <div className="mx-auto h-5 w-14 rounded bg-white/[0.06]" />
                        <div className="mx-auto h-2 w-18 rounded bg-white/[0.03]" />
                      </div>
                    ))}
                  </div>
                )}
                {sec.content === 'features' && (
                  <div className="p-4 space-y-3">
                    <div className="mx-auto h-4 w-40 rounded bg-white/[0.06]" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0,1,2].map(j => (
                        <div key={j} className="rounded-lg border border-white/[0.05] p-3 space-y-2"
                          style={{ backgroundColor: 'hsl(220 20% 15% / 0.3)' }}>
                          <div className="h-7 w-7 rounded-lg bg-primary/10" />
                          <div className="h-3 w-20 rounded bg-white/[0.06]" />
                          <div className="h-2 w-full rounded bg-white/[0.03]" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(sec.content === 'about' || sec.content === 'testimonials' || sec.content === 'cta') && (
                  <div className="flex flex-col items-center justify-center h-full px-6 space-y-2">
                    <div className="h-4 w-36 rounded bg-white/[0.06]" />
                    <div className="h-2.5 w-56 rounded bg-white/[0.03]" />
                    <div className="h-2.5 w-44 rounded bg-white/[0.03]" />
                  </div>
                )}
                {sec.content === 'footer' && (
                  <div className="flex items-center justify-between h-full px-4 border-t border-white/[0.04]">
                    <div className="h-2.5 w-32 rounded bg-white/[0.04]" />
                    <div className="flex gap-2">
                      {[0,1,2].map(j => <div key={j} className="h-4 w-4 rounded-full bg-white/[0.06]" />)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Bottom badge */}
      <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
        <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1.5 shadow-xl backdrop-blur-xl"
          style={{ backgroundColor: 'hsl(220 20% 13% / 0.9)' }}>
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-[10px] font-medium text-foreground/60">{STAGE_META[stage].label}</span>
        </motion.div>
      </div>
    </div>
  );
});
SkeletonPreview.displayName = 'SkeletonPreview';

/* ─── Code Editor ─── */
const LiveCodeEditor = memo(({ files, activeFile, onSelectFile, isStreaming }: {
  files: ProjectFile[];
  activeFile: string;
  onSelectFile: (p: string) => void;
  isStreaming: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const realFiles = files.filter(f => f.path !== 'preview.html');
  const currentFile = realFiles.find(f => f.path === activeFile) || realFiles[0];
  const code = currentFile?.content || '';
  const lines = code.split('\n');

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [code, isStreaming]);

  const getLineClass = (line: string) => {
    const t = line.trim();
    if (t.startsWith('<?php') || t.startsWith('?>')) return 'text-red-400';
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('#')) return 'text-muted-foreground/40';
    if (t.startsWith('<!--')) return 'text-muted-foreground/35';
    if (t.startsWith('<') && t.includes('class=')) return 'text-primary/70';
    if (t.startsWith('<')) return 'text-sky-400/80';
    if (t.startsWith('$') || t.includes('function ') || t.includes('class ') || t.startsWith('require') || t.startsWith('include')) return 'text-purple-400/80';
    if (t.startsWith('const ') || t.startsWith('let ') || t.startsWith('var ') || t.startsWith('import ')) return 'text-yellow-400/70';
    if (t.startsWith('.') || t.startsWith('@media') || t.includes('{') || t.includes('}')) return 'text-cyan-400/60';
    if (t.startsWith('--') || t.includes(':root')) return 'text-emerald-400/60';
    return 'text-foreground/50';
  };

  const fileExt = (currentFile?.path || '').split('.').pop() || '';
  const langMap: Record<string, string> = { php: 'PHP', html: 'HTML', css: 'CSS', js: 'JavaScript', sql: 'SQL', htaccess: 'Apache' };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-card">
      {/* File tabs */}
      {realFiles.length > 0 && (
        <div className="flex items-center border-b border-white/[0.06] bg-secondary/20 px-1.5 py-1 overflow-x-auto scrollbar-none gap-0.5">
          {realFiles.map(f => {
            const { icon: FIcon, color } = categorizeFile(f.path);
            const isActive = f.path === (currentFile?.path || '');
            return (
              <button key={f.path} onClick={() => onSelectFile(f.path)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] whitespace-nowrap transition-all shrink-0 ${
                  isActive ? 'bg-primary/10 text-primary font-medium border border-primary/15' : 'text-muted-foreground/40 hover:text-foreground/60 hover:bg-secondary/30'
                }`}>
                <FIcon className={`h-3 w-3 ${color}`} />
                {f.path.split('/').pop()}
              </button>
            );
          })}
        </div>
      )}

      {/* Editor chrome */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-secondary/30 px-4 py-1.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-background/50 px-3 py-0.5">
          <FileCode className="h-3 w-3 text-primary/40" />
          <span className="font-mono text-[10px] text-muted-foreground/50">{currentFile?.path || 'Aguardando...'}</span>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-primary/60">Escrevendo...</span>
          </div>
        )}
      </div>

      {/* Code */}
      <div ref={scrollRef} className="flex-1 overflow-auto py-3 font-mono text-[11px] leading-[20px]">
        {!code && realFiles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/20 text-xs font-sans gap-2">
            <Code2 className="h-8 w-8 text-muted-foreground/10" />
            <p>O código aparecerá aqui durante a geração</p>
          </div>
        ) : !code ? (
          <div className="flex h-full items-center justify-center text-muted-foreground/20 text-xs font-sans">
            Selecione um arquivo nas abas acima
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="flex hover:bg-secondary/20 px-3">
              <span className="mr-4 inline-block w-8 select-none text-right text-muted-foreground/20 text-[10px]">{i + 1}</span>
              <span className={getLineClass(line)}>{line || '\u00A0'}</span>
            </div>
          ))
        )}
        {isStreaming && code && (
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 0.5, repeat: Infinity }} className="flex px-3">
            <span className="mr-4 inline-block w-8 select-none text-right text-muted-foreground/20 text-[10px]">{lines.length + 1}</span>
            <span className="inline-block h-[14px] w-[7px] rounded-[1px] bg-primary/60" />
          </motion.div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-secondary/20 px-4 py-1">
        <span className="text-[10px] text-muted-foreground/30">{langMap[fileExt] || fileExt.toUpperCase()}</span>
        <span className="text-[10px] text-muted-foreground/25">{lines.length} linhas • {(code.length / 1024).toFixed(1)}KB</span>
      </div>
    </div>
  );
});
LiveCodeEditor.displayName = 'LiveCodeEditor';

/* ─── Build Pipeline ─── */
const BuildPipeline = memo(({ stage }: { stage: BuildStage }) => {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const groups = [
    { label: 'ANÁLISE', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Análise') },
    { label: 'ESTRUTURA', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Estrutura') },
    { label: 'FRONTEND', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Frontend') },
    { label: 'BACKEND', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Backend') },
    { label: 'CONFIG', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Config') },
    { label: 'REFINAMENTO', stages: STAGE_ORDER.filter(s => STAGE_META[s].group === 'Refinamento') },
  ];

  return (
    <div className="space-y-2">
      {groups.map(g => (
        <div key={g.label}>
          <p className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground/25">{g.label}</p>
          <div className="space-y-px">
            {g.stages.map(s => {
              const idx = STAGE_ORDER.indexOf(s);
              const done = idx < currentIdx || stage === 'pronto';
              const active = idx === currentIdx && stage !== 'pronto' && stage !== 'erro';
              return (
                <div key={s} className={`flex items-center gap-2 py-0.5 transition-opacity ${idx > currentIdx && stage !== 'pronto' ? 'opacity-20' : ''}`}>
                  {done ? (
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/15">
                      <Check className="h-2 w-2 text-primary" />
                    </div>
                  ) : active ? (
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/20">
                      <Loader2 className="h-2 w-2 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-white/[0.08]" />
                  )}
                  <span className={`text-[10px] leading-tight ${done ? 'text-primary/50' : active ? 'text-foreground/70 font-medium' : 'text-muted-foreground/20'}`}>
                    {STAGE_META[s].label}
                  </span>
                </div>
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
const StructureView = memo(({ files, isGenerating, onViewCode }: {
  files: ProjectFile[];
  isGenerating: boolean;
  onViewCode: (path: string) => void;
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const realFiles = files.filter(f => f.path !== 'preview.html');

  // Auto-expand all folders
  useEffect(() => {
    const folders = new Set<string>();
    realFiles.forEach(f => {
      const parts = f.path.split('/');
      if (parts.length > 1) folders.add(parts.slice(0, -1).join('/'));
    });
    setExpandedFolders(folders);
  }, [files.length]);

  const buildTree = () => {
    const tree: Record<string, string[]> = {};
    const rootFiles: string[] = [];
    realFiles.forEach(f => {
      const parts = f.path.split('/');
      if (parts.length === 1) rootFiles.push(parts[0]);
      else {
        const folder = parts.slice(0, -1).join('/');
        if (!tree[folder]) tree[folder] = [];
        tree[folder].push(parts[parts.length - 1]);
      }
    });
    return { tree, rootFiles };
  };

  const { tree, rootFiles } = buildTree();
  const currentFile = files.find(f => f.path === selectedFile);

  const folderIcons: Record<string, typeof FolderOpen> = {
    includes: Layers, config: Settings, assets: Image,
    'assets/css': FileText, 'assets/js': Braces, 'assets/img': Image,
    admin: Server, controllers: Zap, models: Database,
    database: Database, helpers: Coffee, views: Eye, pages: FileText,
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3">
      {/* File Tree */}
      <div className="w-full lg:w-60 flex-shrink-0 overflow-y-auto rounded-xl border border-white/[0.06] bg-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FolderTree className="h-3 w-3 text-primary/40" />
            <p className="text-[10px] font-semibold text-foreground/50">Projeto</p>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{realFiles.length}</Badge>
        </div>

        {realFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {isGenerating ? (
              <>
                <Loader2 className="mb-2 h-5 w-5 animate-spin text-primary/30" />
                <p className="text-[11px] text-muted-foreground/30">Criando arquivos...</p>
              </>
            ) : (
              <>
                <FolderOpen className="mb-2 h-6 w-6 text-muted-foreground/15" />
                <p className="text-[11px] text-muted-foreground/20">Gere um projeto para ver a estrutura</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Root files */}
            {rootFiles.map((name, i) => {
              const { icon: FIcon, color } = categorizeFile(name);
              return (
                <motion.button key={name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedFile(name)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-all ${
                    selectedFile === name ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/50 hover:bg-secondary/30'
                  }`}>
                  <FIcon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                  <span className="truncate">{name}</span>
                </motion.button>
              );
            })}

            {/* Folders */}
            {Object.entries(tree).sort().map(([folder, folderFiles], fi) => {
              const FolderIcon = folderIcons[folder] || FolderOpen;
              const isExpanded = expandedFolders.has(folder);
              return (
                <motion.div key={folder} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (rootFiles.length + fi) * 0.02 }}>
                  <button onClick={() => toggleFolder(folder)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-foreground/60 hover:bg-secondary/20 transition-all">
                    <ChevronRight className={`h-3 w-3 text-muted-foreground/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <FolderIcon className="h-3.5 w-3.5 text-primary/30" />
                    <span>{folder}/</span>
                    <span className="ml-auto text-[9px] text-muted-foreground/25">{folderFiles.length}</span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && folderFiles.map(name => {
                      const fullPath = `${folder}/${name}`;
                      const { icon: FIcon, color } = categorizeFile(name);
                      return (
                        <motion.button key={fullPath} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onClick={() => setSelectedFile(fullPath)}
                          className={`flex w-full items-center gap-2 rounded-lg py-1.5 pl-9 pr-2 text-[11px] transition-all ${
                            selectedFile === fullPath ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/40 hover:bg-secondary/30'
                          }`}>
                          <FIcon className={`h-3 w-3 shrink-0 ${color}`} />
                          <span className="truncate">{name}</span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* File preview */}
      <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-card min-h-[30vh]">
        {currentFile ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-secondary/20 px-4 py-2">
              <FileCode className="h-3.5 w-3.5 text-primary/40" />
              <span className="text-xs font-medium text-foreground/60 truncate">{currentFile.path}</span>
              <Badge variant="outline" className="ml-auto text-[9px] px-1.5 shrink-0">{currentFile.category}</Badge>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"
                onClick={() => onViewCode(currentFile.path)}>
                <Code2 className="h-3 w-3" /> Abrir no Editor
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-1 font-mono text-[11px] leading-[20px]">
              {currentFile.content.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-secondary/15 px-3">
                  <span className="mr-3 inline-block w-6 select-none text-right text-muted-foreground/20 text-[10px]">{i + 1}</span>
                  <span className="text-foreground/50">{line || '\u00A0'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/15 gap-2">
            <LayoutGrid className="h-8 w-8" />
            <p className="text-xs">Selecione um arquivo para visualizar</p>
          </div>
        )}
      </div>
    </div>
  );
});
StructureView.displayName = 'StructureView';

/* ─── Chat Log Entry ─── */
interface ChatLogEntry {
  id: string;
  type: 'user' | 'status' | 'files' | 'thinking';
  content: string;
  timestamp: Date;
  files?: string[];
  stage?: BuildStage;
}

const ChatLogItem = memo(({ entry }: { entry: ChatLogEntry }) => {
  if (entry.type === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[90%] rounded-xl bg-primary/10 border border-primary/15 px-3 py-2 text-[12px] text-foreground/80">
          <p className="whitespace-pre-wrap break-words">{entry.content}</p>
          <p className="mt-1 text-[9px] text-muted-foreground/25">
            {entry.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    );
  }

  if (entry.type === 'thinking') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-2 py-1.5">
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} className="h-1 w-1 rounded-full bg-primary" />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground/40 italic">{entry.content || 'Pensando...'}</span>
      </motion.div>
    );
  }

  if (entry.type === 'files') {
    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-primary/10 bg-primary/[0.03] px-3 py-2">
        <p className="text-[10px] font-medium text-primary/60 mb-1 flex items-center gap-1.5">
          <FolderOpen className="h-3 w-3" /> Arquivos criados:
        </p>
        <div className="flex flex-wrap gap-1">
          {(entry.files || []).map(f => {
            const { color } = categorizeFile(f);
            return (
              <span key={f} className={`inline-flex items-center gap-1 rounded-md bg-secondary/30 px-2 py-0.5 text-[9px] ${color}`}>
                {f}
              </span>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // status
  return (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 py-1 px-1">
      {entry.stage === 'pronto' ? (
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15">
          <Check className="h-2.5 w-2.5 text-green-500" />
        </div>
      ) : entry.stage === 'erro' ? (
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/15">
          <X className="h-2.5 w-2.5 text-destructive" />
        </div>
      ) : (
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-2.5 w-2.5 animate-spin text-primary/60" />
        </div>
      )}
      <span className="text-[11px] text-foreground/50 leading-tight">{entry.content}</span>
    </motion.div>
  );
});
ChatLogItem.displayName = 'ChatLogItem';

/* ═══════════════════════════════════════════════ */
/*              MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════ */
export default function SiteBuilder() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveHtml, setLiveHtml] = useState('');
  const [rawOutput, setRawOutput] = useState('');
  const [liveFiles, setLiveFiles] = useState<ProjectFile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [customWidth, setCustomWidth] = useState(1440);
  const [centerMode, setCenterMode] = useState<CenterMode>('preview');
  const [activeCodeFile, setActiveCodeFile] = useState('');
  const [buildStage, setBuildStage] = useState<BuildStage>('idle');
  const [phase, setPhase] = useState<'chat' | 'building'>('chat');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatLogEntries, setChatLogEntries] = useState<ChatLogEntry[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLogEntries]);

  const createProject = useCallback((name?: string) => {
    const project: Project = {
      id: generateId(), name: name || `Projeto ${projects.length + 1}`,
      messages: [], files: [], generatedCode: '', rawOutput: '', snapshots: [],
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

  const addLogEntry = useCallback((entry: Omit<ChatLogEntry, 'id' | 'timestamp'>) => {
    setChatLogEntries(prev => [...prev, { ...entry, id: generateId(), timestamp: new Date() }]);
  }, []);

  /* ─── Send ─── */
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
    setRawOutput('');
    setLiveFiles([]);
    setChatLogEntries([]);
    setActiveCodeFile('');
    setBuildStage('entendendo_prompt');

    addLogEntry({ type: 'user', content: prompt });
    addLogEntry({ type: 'status', content: 'Entendendo seu pedido...', stage: 'entendendo_prompt' });

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      addLogEntry({ type: 'status', content: 'Definindo a arquitetura do projeto...', stage: 'definindo_arquitetura' });

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';
      let lastStage: BuildStage = 'entendendo_prompt';
      const loggedStages = new Set<BuildStage>(['entendendo_prompt', 'definindo_arquitetura']);
      let lastFileCount = 0;

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
              setRawOutput(fullContent);

              const currentFiles = parseFiles(fullContent);
              if (currentFiles.length > 0) {
                setLiveFiles(currentFiles);
                // Update preview progressively
                const previewHtml = getPreviewHtml(currentFiles);
                if (previewHtml) setLiveHtml(previewHtml);

                if (!activeCodeFile) {
                  const firstReal = currentFiles.find(f => f.path !== 'preview.html');
                  if (firstReal) setActiveCodeFile(firstReal.path);
                }

                const nonPreviewFiles = currentFiles.filter(f => f.path !== 'preview.html');
                if (nonPreviewFiles.length > lastFileCount) {
                  const newFiles = nonPreviewFiles.slice(lastFileCount).map(f => f.path);
                  addLogEntry({ type: 'files', content: '', files: newFiles });
                  lastFileCount = nonPreviewFiles.length;
                }
              }

              const newStage = inferStage(fullContent, currentFiles.filter(f => f.path !== 'preview.html').length);
              if (newStage !== lastStage && !loggedStages.has(newStage)) {
                setBuildStage(newStage);
                addLogEntry({ type: 'status', content: STAGE_META[newStage].label, stage: newStage });
                loggedStages.add(newStage);
                lastStage = newStage;
              }

              updateProject(projectId!, { rawOutput: fullContent });
            }
          } catch { /* partial JSON */ }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
          } catch { /* ignore */ }
        }
      }

      const finalFiles = parseFiles(fullContent);
      const finalPreview = getPreviewHtml(finalFiles);
      setBuildStage('pronto');
      setLiveHtml(finalPreview);
      setLiveFiles(finalFiles);
      setRawOutput(fullContent);

      addLogEntry({ type: 'status', content: 'Build concluído! Seu projeto está pronto.', stage: 'pronto' });
      addLogEntry({ type: 'status', content: `${finalFiles.filter(f => f.path !== 'preview.html').length} arquivos gerados` });

      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant' as const, content: fullContent, timestamp: new Date() }],
        files: finalFiles, generatedCode: finalPreview, rawOutput: fullContent,
        name: currentProject?.name || prompt.slice(0, 40),
        snapshots: [...(currentProject?.snapshots || []), finalPreview].slice(-10),
      });
    } catch (err: any) {
      setBuildStage('erro');
      addLogEntry({ type: 'status', content: `Erro: ${err.message}`, stage: 'erro' });
      updateProject(projectId!, {
        messages: [...allMessages, { id: generateId(), role: 'assistant', content: `Erro: ${err.message}`, timestamp: new Date() }],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    const code = rawOutput || activeProject?.rawOutput;
    if (code) { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const downloadProject = () => {
    const files = liveFiles.length > 0 ? liveFiles : activeProject?.files || [];
    if (files.length === 0) return;
    const combined = files.filter(f => f.path !== 'preview.html')
      .map(f => `\n${'='.repeat(60)}\n// ${f.path}\n${'='.repeat(60)}\n\n${f.content}`).join('\n\n');
    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${(activeProject?.name || 'projeto').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const viewportPresets: Record<ViewMode, number> = { desktop: 1440, tablet: 768, mobile: 375 };
  const handleViewMode = (mode: ViewMode) => { setViewMode(mode); setCustomWidth(viewportPresets[mode]); };
  const previewCode = liveHtml || activeProject?.generatedCode || '';
  const displayFiles = liveFiles.length > 0 ? liveFiles : activeProject?.files || [];

  const switchToCode = (path: string) => {
    setActiveCodeFile(path);
    setCenterMode('code');
  };

  const suggestions = [
    { icon: Globe, text: 'Site para barbearia moderna com agendamento online' },
    { icon: Layers, text: 'Landing page para clínica de estética premium' },
    { icon: Zap, text: 'Sistema de pizzaria com cardápio digital e painel admin' },
  ];

  /* ═══ INITIAL CHAT PHASE ═══ */
  if (phase === 'chat' && (!activeProject || activeProject.messages.length === 0)) {
    return (
      <div className="relative flex min-h-[100dvh] flex-col" style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}>
        <GenesisBackground />

        <header className="sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur" style={{ backgroundColor: 'hsl(220 25% 10% / 0.8)' }}>
          <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/login/dashboard')} className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <img src={genesisLogo} alt="Genesis" className="h-7 w-7" />
              <h1 className="text-sm font-bold text-foreground">Site Builder</h1>
              <Badge variant="outline" className="text-[10px] gap-1 hidden sm:flex">
                <FileCode className="h-3 w-3" /> PHP + HTML + CSS + JS
              </Badge>
            </div>
            {projects.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Projetos ({projects.length})</span>
                <span className="sm:hidden">{projects.length}</span>
              </Button>
            )}
          </div>
        </header>

        {/* History modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowHistory(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Seus Projetos</h3>
                  <button onClick={() => setShowHistory(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {projects.map(p => (
                    <div key={p.id} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-xs cursor-pointer hover:bg-secondary/50"
                      onClick={() => {
                        setActiveProjectId(p.id); setShowHistory(false); setPhase('building');
                        setLiveHtml(p.generatedCode); setRawOutput(p.rawOutput);
                        setLiveFiles(p.files || []); setBuildStage(p.generatedCode ? 'pronto' : 'idle');
                      }}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-3.5 w-3.5 text-primary/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground/70">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground/50">{(p.files || []).length} arquivos</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }}
                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 sm:px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-primary/5 blur-xl" />
                <img src={genesisLogo} alt="Genesis" className="relative h-14 w-14 sm:h-16 sm:w-16" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">
              Genesis <span className="text-primary">Site Builder</span>
            </h1>
            <p className="mb-2 text-xs sm:text-sm text-muted-foreground px-2">
              Descreva seu projeto e a IA criará um sistema completo em PHP, HTML, CSS e JavaScript
            </p>
            <p className="mb-8 text-[10px] text-muted-foreground/50">
              Frontend profissional + Backend PHP + Estrutura modular + Código limpo
            </p>

            <div className="mx-auto w-full max-w-xl px-2">
              <div className="rounded-2xl border border-white/[0.08] bg-card/80 p-1 shadow-2xl backdrop-blur-xl transition-all focus-within:border-primary/30">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Descreva o site ou sistema que deseja criar..."
                  rows={3} className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-none" autoFocus />
                <div className="flex items-center justify-between px-3 pb-3">
                  <span className="text-[10px] text-muted-foreground/30 hidden sm:block">Shift+Enter nova linha</span>
                  <Button onClick={handleSend} disabled={!input.trim() || isGenerating} size="sm" className="gap-2 ml-auto">
                    <Sparkles className="h-3.5 w-3.5" /> Criar Projeto
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 px-2">
              {suggestions.map((s, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => setInput(s.text)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-card/30 px-3 py-2.5 text-[11px] text-muted-foreground hover:border-primary/15 hover:bg-card/60 text-left transition-all">
                  <s.icon className="h-3.5 w-3.5 shrink-0 text-primary/30" />
                  {s.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══ WORKSPACE PHASE ═══ */
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Chat Logs */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {chatLogEntries.map(entry => <ChatLogItem key={entry.id} entry={entry} />)}
          {isGenerating && chatLogEntries.length > 0 && chatLogEntries[chatLogEntries.length - 1]?.type !== 'thinking' && (
            <ChatLogItem entry={{ id: 'thinking', type: 'thinking', content: STAGE_META[buildStage].label, timestamp: new Date() }} />
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Pipeline */}
      {(isGenerating || buildStage !== 'idle') && (
        <div className="border-t border-white/[0.06] bg-card/30 p-3 max-h-52 overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground/25">Pipeline</p>
            <span className="text-[10px] text-primary/50">{STAGE_META[buildStage].pct}%</span>
          </div>
          <div className="mb-2.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div className="h-full rounded-full bg-primary/60" animate={{ width: `${STAGE_META[buildStage].pct}%` }} transition={{ duration: 0.5 }} />
          </div>
          <BuildPipeline stage={buildStage} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] bg-card/30 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-secondary/20 px-3 py-2 focus-within:border-primary/25 transition-all">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isGenerating ? 'Aguarde o build...' : 'Descreva alterações ou novo projeto...'}
            rows={2} disabled={isGenerating}
            className="flex-1 resize-none bg-transparent text-xs text-foreground/70 placeholder-muted-foreground/30 outline-none disabled:opacity-40" />
          <Button size="icon" className="h-7 w-7 shrink-0" onClick={handleSend} disabled={!input.trim() || isGenerating}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col" style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)' }}>
      <GenesisBackground />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/[0.06] backdrop-blur shrink-0"
        style={{ backgroundColor: 'hsl(220 25% 10% / 0.8)' }}>
        <div className="flex items-center gap-2 px-3 py-2">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => { setPhase('chat'); setActiveProjectId(null); setBuildStage('idle'); setChatLogEntries([]); setLiveHtml(''); setRawOutput(''); setLiveFiles([]); }}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <img src={genesisLogo} alt="Genesis" className="h-5 w-5" />
          <div className="hidden sm:block min-w-0">
            <h1 className="text-xs font-semibold text-foreground/80 truncate max-w-[160px]">{activeProject?.name || 'Novo Projeto'}</h1>
            <p className="text-[9px] text-muted-foreground/40">PHP + HTML + CSS + JS</p>
          </div>
          {buildStage !== 'idle' && (
            <Badge variant="outline" className="ml-1 text-[9px] gap-1 hidden md:flex">
              {isGenerating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
              {STAGE_META[buildStage].label}
            </Badge>
          )}
        </div>

        {/* Center Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-lg border border-white/[0.06] bg-secondary/30 p-0.5">
          {([
            { mode: 'preview' as CenterMode, icon: Eye, label: 'Preview' },
            { mode: 'code' as CenterMode, icon: Code2, label: 'Código' },
            { mode: 'structure' as CenterMode, icon: LayoutGrid, label: 'Estrutura' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => setCenterMode(mode)}
              className={`flex items-center gap-1 rounded-md px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] transition-all ${
                centerMode === mode ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground/50 hover:text-foreground/60'
              }`}>
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 px-2 py-2">
          {centerMode === 'preview' && (
            <div className="mr-1 hidden lg:flex items-center gap-1 rounded-lg border border-white/[0.06] bg-secondary/30 px-2 py-1">
              {([
                { mode: 'desktop' as ViewMode, icon: Monitor },
                { mode: 'tablet' as ViewMode, icon: Tablet },
                { mode: 'mobile' as ViewMode, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button key={mode} onClick={() => handleViewMode(mode)}
                  className={`rounded-md p-1 transition-all ${viewMode === mode ? 'bg-primary/15 text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground/60'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
              <div className="mx-1 h-4 w-px bg-white/[0.06]" />
              <input type="range" min={320} max={1440} value={customWidth}
                onChange={e => {
                  const w = Number(e.target.value); setCustomWidth(w);
                  if (w >= 1024) setViewMode('desktop');
                  else if (w >= 600) setViewMode('tablet');
                  else setViewMode('mobile');
                }}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              <span className="min-w-[32px] text-center font-mono text-[9px] text-muted-foreground/40">{customWidth}px</span>
            </div>
          )}

          <Button variant="ghost" size="icon" className="h-7 w-7 sm:hidden" onClick={() => setShowSidebar(!showSidebar)}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hidden sm:flex" onClick={copyCode} disabled={!rawOutput}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hidden sm:flex" onClick={downloadProject} disabled={displayFiles.length === 0}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="ml-1 gap-1 text-[10px] hidden sm:flex" onClick={() => { setPhase('chat'); createProject(); }}>
            <Plus className="h-3 w-3" /> Novo
          </Button>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={() => setShowSidebar(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] sm:hidden border-r border-white/[0.06] bg-card/95 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
                <span className="text-xs font-semibold text-foreground/70">Chat & Pipeline</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSidebar(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-44px)]">{sidebarContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Desktop: Resizable */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
              <div className="h-full overflow-hidden bg-white/[0.02] border-r border-white/[0.06]">
                {sidebarContent}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="w-px bg-white/[0.06] hover:bg-primary/30 transition-colors" />
            <ResizablePanel defaultSize={75} minSize={50}>
              <div className="flex h-full flex-col overflow-hidden">
                <div className="relative flex-1 overflow-auto p-3">
                  <AnimatePresence mode="wait">
                    {centerMode === 'preview' && (
                      <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full">
                        {previewCode ? (
                          <div className="relative mx-auto h-full transition-all duration-200" style={{ maxWidth: `${customWidth}px` }}>
                            {isGenerating && (
                              <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2 rounded-t-xl border-b border-primary/10 px-4 py-2 backdrop-blur-md"
                                style={{ backgroundColor: 'hsl(220 20% 13% / 0.9)' }}>
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                <span className="text-[11px] text-foreground/60">{STAGE_META[buildStage].label}</span>
                                <div className="ml-auto flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground/40">{displayFiles.filter(f => f.path !== 'preview.html').length} arquivos</span>
                                  <div className="h-1 w-16 overflow-hidden rounded-full bg-secondary">
                                    <motion.div className="h-full rounded-full bg-primary/50" animate={{ width: `${STAGE_META[buildStage].pct}%` }} transition={{ duration: 0.5 }} />
                                  </div>
                                </div>
                              </div>
                            )}
                            <iframe srcDoc={previewCode} className="h-full w-full rounded-xl border border-white/[0.06] bg-white shadow-lg" sandbox="allow-scripts allow-same-origin" title="Preview" />
                          </div>
                        ) : isGenerating ? (
                          <SkeletonPreview stage={buildStage} />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/15">
                            <Eye className="mb-3 h-12 w-12" />
                            <p className="text-sm">O preview aparecerá aqui</p>
                            <p className="mt-1 text-xs text-muted-foreground/10">Descreva o que deseja no chat</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    {centerMode === 'code' && (
                      <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <LiveCodeEditor files={displayFiles} activeFile={activeCodeFile || displayFiles.find(f => f.path !== 'preview.html')?.path || ''}
                          onSelectFile={setActiveCodeFile} isStreaming={isGenerating} />
                      </motion.div>
                    )}
                    {centerMode === 'structure' && (
                      <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <StructureView files={displayFiles} isGenerating={isGenerating} onViewCode={switchToCode} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status Bar */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] bg-card/30 backdrop-blur-sm px-4 py-1.5 shrink-0">
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${buildStage === 'pronto' ? 'bg-green-500' : buildStage === 'erro' ? 'bg-destructive' : isGenerating ? 'bg-primary animate-pulse' : 'bg-muted-foreground/20'}`} />
                    <span className="text-muted-foreground/40">
                      {buildStage === 'pronto' ? 'Build concluído' : buildStage === 'erro' ? 'Erro' : isGenerating ? STAGE_META[buildStage].label : 'Pronto'}
                    </span>
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/25">
                    <span className="hidden sm:inline">PHP + HTML + CSS + JS</span>
                    {displayFiles.length > 0 && <span>{displayFiles.filter(f => f.path !== 'preview.html').length} arquivos</span>}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Full width */}
        <div className="flex sm:hidden flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-auto p-2">
            <AnimatePresence mode="wait">
              {centerMode === 'preview' && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full">
                  {previewCode ? (
                    <div className="relative h-full">
                      {isGenerating && (
                        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2 rounded-t-xl border-b border-primary/10 px-3 py-1.5 backdrop-blur-md"
                          style={{ backgroundColor: 'hsl(220 20% 13% / 0.9)' }}>
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          <span className="text-[10px] text-foreground/60 truncate flex-1">{STAGE_META[buildStage].label}</span>
                          <span className="text-[9px] text-primary/50">{STAGE_META[buildStage].pct}%</span>
                        </div>
                      )}
                      <iframe srcDoc={previewCode} className="h-full w-full rounded-xl border border-white/[0.06] bg-white" sandbox="allow-scripts allow-same-origin" title="Preview" />
                    </div>
                  ) : isGenerating ? (
                    <SkeletonPreview stage={buildStage} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground/15 text-center">
                      <Eye className="mb-2 h-8 w-8" />
                      <p className="text-xs">O preview aparecerá aqui</p>
                    </div>
                  )}
                </motion.div>
              )}
              {centerMode === 'code' && (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <LiveCodeEditor files={displayFiles} activeFile={activeCodeFile || displayFiles.find(f => f.path !== 'preview.html')?.path || ''}
                    onSelectFile={setActiveCodeFile} isStreaming={isGenerating} />
                </motion.div>
              )}
              {centerMode === 'structure' && (
                <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <StructureView files={displayFiles} isGenerating={isGenerating} onViewCode={switchToCode} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] bg-card/30 px-3 py-1.5 shrink-0">
            <span className="flex items-center gap-1.5 text-[10px]">
              <span className={`h-1.5 w-1.5 rounded-full ${buildStage === 'pronto' ? 'bg-green-500' : buildStage === 'erro' ? 'bg-destructive' : isGenerating ? 'bg-primary animate-pulse' : 'bg-muted-foreground/20'}`} />
              <span className="text-muted-foreground/40 truncate">
                {buildStage === 'pronto' ? 'Concluído' : buildStage === 'erro' ? 'Erro' : isGenerating ? STAGE_META[buildStage].label : 'Pronto'}
              </span>
            </span>
            <span className="text-[9px] text-muted-foreground/25">{displayFiles.filter(f => f.path !== 'preview.html').length} arquivos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
