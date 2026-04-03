import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Flame, History } from 'lucide-react';
import { SearchFilters, NICHES, PLATFORMS } from '../types';
import { Button } from '@/components/ui/button';

interface SearchHeaderProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isSearching: boolean;
  recentSearches: string[];
}

export const SearchHeader = ({ onSearch, isSearching, recentSearches }: SearchHeaderProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    platform: 'all',
    minScore: 0,
    sortBy: 'heat_score',
    format: 'all',
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query, filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar nicho, produto ou tipo de oferta..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-white/30">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 px-3 rounded-xl border transition-all ${
            showFilters ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg shadow-orange-500/20 border-0"
        >
          {isSearching ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Flame className="w-4 h-4" />
            </motion.div>
          ) : (
            <Flame className="w-4 h-4" />
          )}
          <span className="ml-1.5 hidden sm:inline">Rastrear</span>
        </Button>
      </div>

      {/* Quick niches */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {NICHES.slice(0, 10).map((niche) => (
          <button
            key={niche}
            onClick={() => { setQuery(niche); onSearch(niche, filters); }}
            className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70 hover:border-white/15 transition-all"
          >
            {niche}
          </button>
        ))}
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <History className="w-3 h-3 text-white/25 shrink-0" />
          {recentSearches.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); onSearch(s, filters); }}
              className="shrink-0 text-[10px] px-2 py-1 rounded-md bg-white/[0.03] text-white/35 hover:text-white/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Plataforma</label>
              <select
                value={filters.platform}
                onChange={(e) => setFilters(f => ({ ...f, platform: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none focus:border-blue-500/40"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Score Mínimo</label>
              <select
                value={filters.minScore}
                onChange={(e) => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))}
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none focus:border-blue-500/40"
              >
                <option value={0}>Todos</option>
                <option value={30}>30+</option>
                <option value={50}>50+</option>
                <option value={70}>70+</option>
                <option value={85}>85+</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Ordenar Por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none focus:border-blue-500/40"
              >
                <option value="heat_score">Heat Score</option>
                <option value="days_active">Dias Ativo</option>
                <option value="recurrence_count">Recorrência</option>
                <option value="suggested_ticket">Ticket</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">Formato</label>
              <select
                value={filters.format}
                onChange={(e) => setFilters(f => ({ ...f, format: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none focus:border-blue-500/40"
              >
                <option value="all">Todos</option>
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="carousel">Carrossel</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
